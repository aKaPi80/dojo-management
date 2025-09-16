import { User, Grade, GRADES, ExamSettings, Attendance, InternationalCourse, CLASS_TYPES } from '@/types';

export class ExamCalculations {
  static getDefaultSettings(): ExamSettings {
    return {
      examFee: 10,
      beltFee: 5,
      minAttendancePercentage: 50,
      attendanceCheckMonths: 2
    };
  }

  static getGradesList(category: 'niños' | 'adultos'): Grade[] {
    return category === 'niños' ? GRADES.KIDS : GRADES.ADULTS;
  }

  static getNextGrade(currentGrade: Grade, category: 'niños' | 'adultos'): Grade | null {
    const grades = this.getGradesList(category);
    const currentIndex = grades.findIndex(g => 
      g.kyu === currentGrade.kyu && g.dan === currentGrade.dan
    );
    
    if (currentIndex === -1 || currentIndex === grades.length - 1) {
      return null;
    }
    
    return grades[currentIndex + 1];
  }

  static calculateNextExamDate(user: User): Date | null {
    const lastExam = user.examHistory
      .filter(exam => exam.passed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const baseDate = lastExam ? new Date(lastExam.date) : new Date(user.joinDate);
    let examInterval = user.grade.examInterval;

    // Para niños, verificar que no pueda llegar a 1 dan antes de los 17 años
    if (user.category === 'niños') {
      const birthDate = new Date(user.birthDate);
      const targetAge = 17;
      const targetDate = new Date(birthDate);
      targetDate.setFullYear(birthDate.getFullYear() + targetAge);

      const nextGrade = this.getNextGrade(user.grade, user.category);
      if (nextGrade?.dan === 1) {
        const calculatedExamDate = new Date(baseDate);
        calculatedExamDate.setMonth(calculatedExamDate.getMonth() + examInterval);
        
        if (calculatedExamDate < targetDate) {
          return targetDate;
        }
      }
    }

    // Para adultos, aplicar reducción por cursos internacionales
    if (user.category === 'adultos' && (!user.grade.dan || user.grade.dan === 1)) {
      const reductionMonths = user.internationalCourses.length * 3;
      examInterval = Math.max(examInterval - reductionMonths, 3);
    }

    const nextExamDate = new Date(baseDate);
    nextExamDate.setMonth(nextExamDate.getMonth() + examInterval);
    
    return nextExamDate;
  }

  static calculateAttendancePercentage(userId: string, months: number = 2): number {
    const attendance: Attendance[] = JSON.parse(localStorage.getItem('attendance') || '[]');
    const userAttendance = attendance.filter(a => a.studentId === userId);
    
    if (userAttendance.length === 0) return 0;

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const relevantAttendance = userAttendance.filter(a => 
      new Date(a.date) >= cutoffDate
    );

    if (relevantAttendance.length === 0) return 0;

    // Calcular asistencia ponderada según el tipo de clase
    const totalPossibleValue = relevantAttendance.length; // Asumiendo clases normales
    const actualValue = relevantAttendance
      .filter(a => a.present)
      .reduce((sum, a) => sum + (a.attendanceValue || 1), 0);

    return Math.min(Math.round((actualValue / totalPossibleValue) * 100), 100);
  }

  static isExamEnabled(user: User, settings: ExamSettings): boolean {
    const nextExamDate = this.calculateNextExamDate(user);
    if (!nextExamDate) return false;

    const now = new Date();
    const checkDate = new Date(nextExamDate);
    checkDate.setMonth(checkDate.getMonth() - settings.attendanceCheckMonths);

    if (now < checkDate) return false;

    const attendancePercentage = this.calculateAttendancePercentage(user.id, settings.attendanceCheckMonths);
    return attendancePercentage >= settings.minAttendancePercentage;
  }

  static getStudentsEligibleForExam(): User[] {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const settings = this.getDefaultSettings();
    
    return users
      .filter(u => u.role === 'estudiante' && u.active)
      .filter(u => this.isExamEnabled(u, settings))
      .filter(u => {
        const nextExamDate = this.calculateNextExamDate(u);
        if (!nextExamDate) return false;
        
        const now = new Date();
        const oneMonthBefore = new Date(nextExamDate);
        oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);
        
        return now >= oneMonthBefore && now <= nextExamDate;
      });
  }

  static canSendExamNotification(user: User): boolean {
    if (!user.nextExamDate) return false;
    
    const examDate = new Date(user.nextExamDate);
    const now = new Date();
    const daysUntilExam = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Permitir notificación si faltan entre 10 y 45 días
    if (daysUntilExam < 10 || daysUntilExam > 45) return false;
    
    // Verificar si ya se envió una notificación recientemente
    if (user.examNotificationSent && user.lastExamNotificationDate) {
      const lastNotification = new Date(user.lastExamNotificationDate);
      const daysSinceLastNotification = Math.ceil((now.getTime() - lastNotification.getTime()) / (1000 * 60 * 60 * 24));
      
      // Solo permitir nueva notificación si han pasado más de 10 días
      return daysSinceLastNotification > 10;
    }
    
    return true;
  }

  static getExamNotificationMessage(user: User): string {
    if (!user.nextExamDate) return '';
    
    const examDate = new Date(user.nextExamDate);
    const now = new Date();
    const daysUntilExam = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExam <= 20) {
      return `Tu examen está programado para dentro de aproximadamente ${daysUntilExam} días (${examDate.toLocaleDateString()}).`;
    } else {
      const weeksUntilExam = Math.ceil(daysUntilExam / 7);
      return `Tu examen está programado para dentro de aproximadamente ${weeksUntilExam} semanas (${examDate.toLocaleDateString()}).`;
    }
  }

  static scheduleRetakeExam(userId: string): void {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;

    const user = users[userIndex];
    const retakeDate = new Date();
    retakeDate.setMonth(retakeDate.getMonth() + 1);
    
    users[userIndex] = {
      ...user,
      nextExamDate: retakeDate.toISOString().split('T')[0],
      examEnabled: true,
      examNotificationSent: false
    };
    
    localStorage.setItem('users', JSON.stringify(users));
  }

  static updateUserGrade(userId: string, newGrade: Grade, examiner: string, passed: boolean): void {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;

    const user = users[userIndex];
    const settings = this.getDefaultSettings();
    
    const examRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      grade: newGrade,
      examiner,
      passed,
      isRetake: false,
      cost: {
        examFee: settings.examFee,
        beltFee: settings.beltFee
      }
    };

    const updatedUser = {
      ...user,
      examHistory: [...user.examHistory, examRecord],
      examEnabled: false,
      examNotificationSent: false
    };

    if (passed) {
      updatedUser.grade = newGrade;
      updatedUser.belt = newGrade.beltColor;
      const nextExamDate = this.calculateNextExamDate(updatedUser);
      updatedUser.nextExamDate = nextExamDate?.toISOString().split('T')[0];
    } else {
      const retakeDate = new Date();
      retakeDate.setMonth(retakeDate.getMonth() + 1);
      updatedUser.nextExamDate = retakeDate.toISOString().split('T')[0];
      updatedUser.examEnabled = true;
    }

    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
  }

  static markExamNotificationSent(userId: string): void {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;
    
    users[userIndex] = {
      ...users[userIndex],
      examNotificationSent: true,
      lastExamNotificationDate: new Date().toISOString().split('T')[0]
    };
    
    localStorage.setItem('users', JSON.stringify(users));
  }
}