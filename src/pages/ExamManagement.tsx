import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GraduationCap, 
  Calendar, 
  Award, 
  Clock, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Bell,
  AlertTriangle,
  Users
} from 'lucide-react';
import { User, Grade, GRADES, ExamRecord, Notification } from '@/types';
import { ExamCalculations } from '@/utils/examCalculations';
import { toast } from 'sonner';

export default function ExamManagement() {
  const [eligibleStudents, setEligibleStudents] = useState<User[]>([]);
  const [overdueStudents, setOverdueStudents] = useState<User[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [examResult, setExamResult] = useState({
    passed: true,
    examiner: '',
    notes: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const students = users.filter(u => u.role === 'estudiante' && u.active);
    
    // Actualizar datos de examen para todos los estudiantes
    const updatedStudents = students.map(student => {
      const nextExamDate = ExamCalculations.calculateNextExamDate(student);
      const settings = ExamCalculations.getDefaultSettings();
      const attendancePercentage = ExamCalculations.calculateAttendancePercentage(student.id);
      const examEnabled = attendancePercentage >= settings.minAttendancePercentage;
      
      return {
        ...student,
        nextExamDate: nextExamDate?.toISOString().split('T')[0],
        examEnabled,
        attendancePercentage
      };
    });

    // Guardar cambios
    const allUsers = users.map(u => {
      const updated = updatedStudents.find(s => s.id === u.id);
      return updated || u;
    });
    localStorage.setItem('users', JSON.stringify(allUsers));

    setAllStudents(updatedStudents);
    
    // NUEVA LÓGICA: Estudiantes elegibles incluyen los que cumplen asistencia, 
    // independientemente de si la fecha está vencida o no
    const today = new Date();
    const eligible: User[] = [];
    const overdue: User[] = [];
    
    updatedStudents.forEach(student => {
      if (student.examEnabled) {
        // Si cumple asistencia, es elegible
        eligible.push(student);
        
        // Si además tiene fecha vencida, también aparece en vencidos
        if (student.nextExamDate) {
          const examDate = new Date(student.nextExamDate);
          if (examDate < today) {
            overdue.push(student);
          }
        }
      } else if (student.nextExamDate) {
        // Si no cumple asistencia pero tiene fecha vencida, solo aparece en vencidos
        const examDate = new Date(student.nextExamDate);
        if (examDate < today) {
          overdue.push(student);
        }
      }
    });
    
    setEligibleStudents(eligible);
    setOverdueStudents(overdue);
  };

  const handleExamResult = () => {
    if (!selectedStudent || !examResult.examiner) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const nextGrade = ExamCalculations.getNextGrade(selectedStudent.grade, selectedStudent.category);
    if (!nextGrade) {
      toast.error('No hay siguiente grado disponible');
      return;
    }

    ExamCalculations.updateUserGrade(
      selectedStudent.id,
      nextGrade,
      examResult.examiner,
      examResult.passed
    );

    // Crear notificación para el estudiante
    const notifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notification: Notification = {
      id: Date.now().toString(),
      title: examResult.passed ? '¡Examen Aprobado!' : 'Resultado del Examen',
      message: examResult.passed 
        ? `¡Felicidades! Has aprobado el examen para ${nextGrade.name}. Tu nuevo cinturón es ${nextGrade.beltColor}.`
        : `Tu examen para ${nextGrade.name} requiere repetición. Sigue entrenando y podrás presentarte de nuevo pronto.`,
      date: new Date().toISOString().split('T')[0],
      targetRole: 'estudiante',
      targetUserId: selectedStudent.id,
      type: 'exam',
      read: false,
      examId: Date.now().toString(),
      emailSent: false
    };

    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));

    loadStudents();
    setIsExamDialogOpen(false);
    setSelectedStudent(null);
    setExamResult({ passed: true, examiner: '', notes: '' });
    
    toast.success(`Examen registrado: ${examResult.passed ? 'Aprobado' : 'Suspenso'}`);
  };

  const handleSendExamNotification = (student: User) => {
    if (!ExamCalculations.canSendExamNotification(student)) {
      toast.error('No se puede enviar la notificación en este momento');
      return;
    }

    const message = ExamCalculations.getExamNotificationMessage(student);
    const nextGrade = ExamCalculations.getNextGrade(student.grade, student.category);

    // Crear notificación
    const notifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notification: Notification = {
      id: Date.now().toString(),
      title: 'Próximo Examen Programado',
      message: `${message} Estarás presentándote para ${nextGrade?.name} (${nextGrade?.beltColor}). Asegúrate de mantener tu asistencia al día.`,
      date: new Date().toISOString().split('T')[0],
      targetRole: 'estudiante',
      targetUserId: student.id,
      type: 'exam-reminder',
      read: false,
      emailSent: false
    };

    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Marcar notificación como enviada
    ExamCalculations.markExamNotificationSent(student.id);

    loadStudents();
    toast.success(`Notificación enviada a ${student.name}`);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getGradeBadgeColor = (grade: Grade) => {
    if (grade.dan) return 'bg-black text-white';
    switch (grade.beltColor) {
      case 'Blanco': return 'bg-gray-100 text-gray-800';
      case 'Amarillo': return 'bg-yellow-100 text-yellow-800';
      case 'Naranja': return 'bg-orange-100 text-orange-800';
      case 'Verde': return 'bg-green-100 text-green-800';
      case 'Azul': return 'bg-blue-100 text-blue-800';
      case 'Marrón': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExam = (examDate: string) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (examDate: string) => {
    return getDaysUntilExam(examDate) < 0;
  };

  const settings = ExamCalculations.getDefaultSettings();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Exámenes</h1>
          <p className="text-gray-600">SKBC Gipuzkoa - Shorinji Kempo</p>
          <p className="text-sm text-gray-500 mt-1">
            Derechos de examen: {settings.examFee}€ • Cinturón: {settings.beltFee}€ • Asistencia mínima: {settings.minAttendancePercentage}%
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Elegibles</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{eligibleStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              Cumplen asistencia mínima
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fechas Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Insuficiente</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {allStudents.filter(s => s.attendancePercentage < settings.minAttendancePercentage).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Necesitan mejorar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              Miembros activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Exams Alert */}
      {overdueStudents.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>⚠️ ATENCIÓN:</strong> {overdueStudents.length} estudiante(s) tienen fechas de examen vencidas.
            Revisa la sección "Fechas Vencidas" más abajo.
          </AlertDescription>
        </Alert>
      )}

      {/* Eligible Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>Estudiantes Elegibles para Examen</span>
          </CardTitle>
          <CardDescription>
            Estudiantes que cumplen los requisitos de asistencia (≥{settings.minAttendancePercentage}%) y pueden presentarse a examen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eligibleStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibleStudents.map((student) => {
                const nextGrade = ExamCalculations.getNextGrade(student.grade, student.category);
                const age = calculateAge(student.birthDate);
                const daysUntilExam = student.nextExamDate ? getDaysUntilExam(student.nextExamDate) : null;
                const canSendNotification = ExamCalculations.canSendExamNotification(student);
                const hasOverdueExam = student.nextExamDate && isOverdue(student.nextExamDate);
                
                return (
                  <div key={student.id} className={`p-4 border rounded-lg ${hasOverdueExam ? 'border-orange-300 bg-orange-50' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={student.photo} alt={student.name} />
                        <AvatarFallback className={hasOverdueExam ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}>
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{student.name}</h4>
                            <p className="text-sm text-gray-600">
                              {age} años • {student.category}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <Badge className={getGradeBadgeColor(student.grade)}>
                              {student.grade.name}
                            </Badge>
                            {hasOverdueExam && (
                              <Badge variant="destructive" className="ml-1">
                                VENCIDA
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Asistencia:</span>
                            <span className="font-medium text-green-600">
                              {student.attendancePercentage}%
                            </span>
                          </div>
                          
                          {nextGrade && (
                            <div className="flex justify-between">
                              <span>Próximo grado:</span>
                              <span className="font-medium">
                                {nextGrade.name} ({nextGrade.beltColor})
                              </span>
                            </div>
                          )}
                          
                          {student.nextExamDate && (
                            <div className="flex justify-between">
                              <span>Fecha examen:</span>
                              <span className={`font-medium ${hasOverdueExam ? 'text-red-600' : 'text-gray-700'}`}>
                                {new Date(student.nextExamDate).toLocaleDateString()}
                                {daysUntilExam && (
                                  <span className="ml-1 text-gray-500">
                                    ({hasOverdueExam ? `vencida hace ${Math.abs(daysUntilExam)} días` : `en ${daysUntilExam} días`})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          
                          {student.examNotificationSent && (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <CheckCircle className="h-3 w-3" />
                              <span className="text-xs">Notificación enviada</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsExamDialogOpen(true);
                            }}
                          >
                            <Award className="h-3 w-3 mr-1" />
                            Registrar Examen
                          </Button>
                          
                          {student.nextExamDate && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canSendNotification}
                              onClick={() => handleSendExamNotification(student)}
                            >
                              <Bell className="h-3 w-3 mr-1" />
                              {student.examNotificationSent ? 'Notificado' : 'Notificar'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay estudiantes elegibles para examen</p>
              <p className="text-sm text-gray-400">
                Los estudiantes aparecerán aquí cuando cumplan los requisitos de asistencia (≥{settings.minAttendancePercentage}%)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Students Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Todos los Estudiantes</CardTitle>
          <CardDescription>
            Resumen del progreso y estado de exámenes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allStudents
              .sort((a, b) => {
                // Primero los que tienen fecha vencida, luego por asistencia
                const aOverdue = a.nextExamDate && new Date(a.nextExamDate) < new Date();
                const bOverdue = b.nextExamDate && new Date(b.nextExamDate) < new Date();
                
                if (aOverdue && !bOverdue) return -1;
                if (!aOverdue && bOverdue) return 1;
                
                return b.attendancePercentage - a.attendancePercentage;
              })
              .map((student) => {
                const nextGrade = ExamCalculations.getNextGrade(student.grade, student.category);
                const age = calculateAge(student.birthDate);
                const daysUntilExam = student.nextExamDate ? getDaysUntilExam(student.nextExamDate) : null;
                const isOverdueExam = daysUntilExam !== null && daysUntilExam < 0;
                
                return (
                  <div key={student.id} className={`flex items-center justify-between p-3 border rounded-lg ${isOverdueExam ? 'border-red-200 bg-red-50' : ''}`}>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={student.photo} alt={student.name} />
                        <AvatarFallback>
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">
                          {age} años • {student.category} • {student.grade.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge 
                          variant={student.attendancePercentage >= settings.minAttendancePercentage ? "default" : "destructive"}
                        >
                          {student.attendancePercentage}% asistencia
                        </Badge>
                        
                        {student.nextExamDate && (
                          <p className={`text-sm mt-1 ${isOverdueExam ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            {isOverdueExam
                              ? `⚠️ Vencido hace ${Math.abs(daysUntilExam)} días`
                              : daysUntilExam && daysUntilExam > 0
                              ? `Examen en ${daysUntilExam} días`
                              : 'Examen hoy'
                            }
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {student.examEnabled ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        
                        {isOverdueExam && (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        
                        {student.examNotificationSent && (
                          <Bell className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Exam Result Dialog */}
      <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Resultado del Examen</DialogTitle>
            <DialogDescription>
              {selectedStudent?.name} - {selectedStudent?.grade.name} → {selectedStudent && ExamCalculations.getNextGrade(selectedStudent.grade, selectedStudent.category)?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resultado del examen</Label>
              <Select 
                value={examResult.passed ? 'passed' : 'failed'} 
                onValueChange={(value) => setExamResult({...examResult, passed: value === 'passed'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">✅ Aprobado</SelectItem>
                  <SelectItem value="failed">❌ Suspenso (Repetición)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="examiner">Examinador *</Label>
              <Input
                id="examiner"
                value={examResult.examiner}
                onChange={(e) => setExamResult({...examResult, examiner: e.target.value})}
                placeholder="Nombre del sensei examinador"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observaciones</Label>
              <Textarea
                id="notes"
                value={examResult.notes}
                onChange={(e) => setExamResult({...examResult, notes: e.target.value})}
                placeholder="Comentarios sobre el examen, técnicas evaluadas, etc."
                rows={3}
              />
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p><strong>Coste del examen:</strong></p>
              <p>• Derechos de examen: {settings.examFee}€</p>
              <p>• Cinturón nuevo: {settings.beltFee}€</p>
              <p className="font-medium">Total: {settings.examFee + settings.beltFee}€</p>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleExamResult} className="flex-1">
                Registrar Resultado
              </Button>
              <Button variant="outline" onClick={() => setIsExamDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}