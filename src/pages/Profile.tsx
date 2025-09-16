import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { 
  DEFAULT_CLUB_SETTINGS, 
  GRADES, 
  getAttendanceValue,
  isBirthday,
  getBirthdayMessage 
} from '@/types';
import { 
  User, 
  Calendar, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  PartyPopper,
  Target,
  CalendarDays,
  BookOpen,
  Save,
  Camera,
  Trophy,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [examStatus, setExamStatus] = useState({
    isEligible: false,
    isOverdue: false,
    nextGrade: null as any,
    attendanceSinceExam: 0,
    monthsSinceExam: 0,
    requiredAttendance: 0,
    requiredMonths: 0,
    estimatedExamDate: null as Date | null,
    remainingClasses: 0,
    remainingWeeks: 0,
    countdown: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);

    calculateExamStatus();
  }, [user, navigate]);

  const calculateExamStatus = () => {
    if (!user) return;

    const currentGrade = user.grade;
    const grades = currentGrade.category === 'niños' ? GRADES.CHILDREN : GRADES.ADULTS;
    
    const currentIndex = grades.findIndex(g => g.id === currentGrade.id);
    if (currentIndex === -1 || currentIndex === grades.length - 1) {
      return; // No next grade available
    }
    
    const nextGrade = grades[currentIndex + 1];
    
    // Calculate attendance since last exam
    let attendanceSinceExam = 0;
    const lastExamDate = user.lastExamDate || user.joinDate;
    
    if (user.attendances) {
      user.attendances.forEach(attendance => {
        if (attendance.present && attendance.date >= lastExamDate) {
          const value = getAttendanceValue(attendance.sessionType || 'normal');
          attendanceSinceExam += value;
        }
      });
    }

    // Calculate months since last exam
    const lastExam = new Date(lastExamDate);
    const now = new Date();
    const monthsSinceExam = Math.floor((now.getTime() - lastExam.getTime()) / (1000 * 60 * 60 * 24 * 30));

    const requiredAttendance = nextGrade.requirements?.minAttendance || 0;
    const requiredMonths = nextGrade.requirements?.minMonths || 0;

    const meetsAttendance = attendanceSinceExam >= requiredAttendance;
    const meetsTime = monthsSinceExam >= requiredMonths;
    const isEligible = meetsAttendance && meetsTime;

    // Calculate estimated exam date considering business rules
    const estimatedExamDate = calculateEstimatedExamDate(lastExam, requiredMonths);
    const isOverdue = now > estimatedExamDate && isEligible;

    // Calculate remaining classes and countdown
    const remainingClasses = Math.max(0, requiredAttendance - attendanceSinceExam);
    const remainingWeeks = calculateRemainingWeeks(remainingClasses);
    const countdown = generateCountdown(estimatedExamDate, remainingClasses, remainingWeeks);

    setExamStatus({
      isEligible,
      isOverdue,
      nextGrade,
      attendanceSinceExam,
      monthsSinceExam,
      requiredAttendance,
      requiredMonths,
      estimatedExamDate,
      remainingClasses,
      remainingWeeks,
      countdown
    });
  };

  const calculateEstimatedExamDate = (startDate: Date, requiredMonths: number): Date => {
    const estimatedDate = new Date(startDate);
    estimatedDate.setMonth(estimatedDate.getMonth() + requiredMonths);
    
    // Skip July and August (vacation months)
    if (estimatedDate.getMonth() === 6) { // July
      estimatedDate.setMonth(8); // Move to September
    } else if (estimatedDate.getMonth() === 7) { // August
      estimatedDate.setMonth(8); // Move to September
    }
    
    return estimatedDate;
  };

  const calculateRemainingWeeks = (remainingClasses: number): number => {
    // 2 classes per week (Tuesday and Thursday)
    // Excluding holidays and July/August
    const classesPerWeek = 2;
    const holidayReduction = 0.9; // 10% reduction for holidays
    
    const effectiveClassesPerWeek = classesPerWeek * holidayReduction;
    return Math.ceil(remainingClasses / effectiveClassesPerWeek);
  };

  const generateCountdown = (examDate: Date, remainingClasses: number, remainingWeeks: number): string => {
    const now = new Date();
    const timeDiff = examDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return 'Fecha de examen pasada';
    }
    
    if (remainingClasses > 0) {
      return `Te quedan ${remainingClasses} clases (aprox. ${remainingWeeks} semanas)`;
    }
    
    if (daysDiff < 30) {
      return `Listo para examen - ${daysDiff} días hasta fecha estimada`;
    } else {
      const monthsDiff = Math.floor(daysDiff / 30);
      return `Listo para examen - ${monthsDiff} meses hasta fecha estimada`;
    }
  };

  // Calculate completed courses
  const calculateCompletedCourses = () => {
    if (!user || !user.attendances) return { nacional: 0, internacional: 0 };

    let nacional = 0;
    let internacional = 0;

    user.attendances.forEach(attendance => {
      if (attendance.present) {
        if (attendance.sessionType === 'curso_nacional') nacional++;
        if (attendance.sessionType === 'curso_internacional') internacional++;
      }
    });

    return { nacional, internacional };
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      toast.error('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    if (passwordForm.currentPassword !== user.password) {
      toast.error('La contraseña actual es incorrecta');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = {
        ...user,
        password: passwordForm.newPassword,
        mustChangePassword: false,
        updatedAt: new Date().toISOString()
      };

      await updateUser(updatedUser);
      toast.success('Contraseña actualizada exitosamente');
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return null;
  }

  const completedCourses = calculateCompletedCourses();
  const userExams = user.exams || [];

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: `url(${clubSettings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white bg-opacity-90" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <img 
                  src={clubSettings.logo} 
                  alt="Logo" 
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MA';
                  }}
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{clubSettings.clubName}</h1>
                  <p className="text-sm text-gray-500">Mi Perfil</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Birthday Alert */}
          {user.birthDate && isBirthday(user.birthDate) && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <PartyPopper className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>{getBirthdayMessage()}</strong> ¡Esperamos que tengas un día maravilloso!
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Header with Grade */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <img 
                    src={user.photo || `https://via.placeholder.com/120x120/4F46E5/FFFFFF?text=${user.name.charAt(0)}`}
                    alt={user.name}
                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    onClick={() => toast.info('Función de subir foto próximamente disponible')}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                    <Badge variant="secondary" className="text-sm">{user.grade.name}</Badge>
                    <Badge variant="outline" className="text-sm">{user.grade.beltColor}</Badge>
                    <Badge variant={
                      user.role === 'chief_instructor' ? 'destructive' :
                      user.role === 'profesor' ? 'default' : 'secondary'
                    } className="text-sm">
                      {user.role === 'chief_instructor' ? 'Chief Instructor' :
                       user.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                    </Badge>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p className="flex items-center justify-center sm:justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Miembro desde: {new Date(user.joinDate).toLocaleDateString('es-ES')}
                    </p>
                    <p className="flex items-center justify-center sm:justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Asistencia: {user.attendancePercentage}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Trophy className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cursos Nacionales</p>
                    <p className="text-2xl font-bold text-green-600">{completedCourses.nacional}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cursos Internacionales</p>
                    <p className="text-2xl font-bold text-purple-600">{completedCourses.internacional}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="nextexam" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="nextexam">Próximo Examen</TabsTrigger>
              <TabsTrigger value="exams">Mis Exámenes</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            {/* Next Exam Tab */}
            <TabsContent value="nextexam">
              {/* Status Alert */}
              {examStatus.isOverdue ? (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>¡EXAMEN VENCIDO!</strong> Ya cumples todos los requisitos para tu próximo examen.
                  </AlertDescription>
                </Alert>
              ) : examStatus.isEligible ? (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>¡LISTO para EXAMEN!</strong> Cumples todos los requisitos para tu próximo grado.
                  </AlertDescription>
                </Alert>
              ) : examStatus.nextGrade && (
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>En Progreso</strong> - {examStatus.countdown}
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Estado del Próximo Examen</span>
                  </CardTitle>
                  {examStatus.nextGrade && (
                    <CardDescription>
                      Progreso hacia {examStatus.nextGrade.name} - {examStatus.nextGrade.beltColor}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {examStatus.nextGrade ? (
                    <>
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Examen para {examStatus.nextGrade.name}</h3>
                          {examStatus.estimatedExamDate && (
                            <p className="text-gray-600">Fecha estimada: {formatDate(examStatus.estimatedExamDate)}</p>
                          )}
                        </div>
                        <Badge 
                          variant={examStatus.isEligible ? 'default' : 'secondary'}
                          className="text-lg px-4 py-2"
                        >
                          {examStatus.isEligible ? (
                            <><CheckCircle className="h-4 w-4 mr-2" />APTO</>
                          ) : (
                            <><XCircle className="h-4 w-4 mr-2" />NO APTO</>
                          )}
                        </Badge>
                      </div>

                      {/* Progress Bars */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Asistencias</span>
                            <span>{examStatus.attendanceSinceExam}/{examStatus.requiredAttendance}</span>
                          </div>
                          <Progress 
                            value={examStatus.requiredAttendance > 0 
                              ? Math.min(100, (examStatus.attendanceSinceExam / examStatus.requiredAttendance) * 100)
                              : 0
                            } 
                            className="h-3" 
                          />
                          {examStatus.remainingClasses > 0 && (
                            <p className="text-xs text-gray-600">
                              Te quedan {examStatus.remainingClasses} clases
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Tiempo</span>
                            <span>{examStatus.monthsSinceExam}/{examStatus.requiredMonths} meses</span>
                          </div>
                          <Progress 
                            value={examStatus.requiredMonths > 0
                              ? Math.min(100, (examStatus.monthsSinceExam / examStatus.requiredMonths) * 100)
                              : 0
                            } 
                            className="h-3" 
                          />
                        </div>
                      </div>

                      {/* Exam Date Card */}
                      {examStatus.estimatedExamDate && (
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <CalendarDays className="h-8 w-8 text-blue-600" />
                              <div>
                                <h4 className="font-medium text-blue-900">Fecha Estimada de Examen</h4>
                                <p className="text-blue-700">{formatDate(examStatus.estimatedExamDate)}</p>
                                <p className="text-sm text-blue-600 mt-1">{examStatus.countdown}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Schedule Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Información del Horario</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>• Clases: Martes y Jueves (2 clases por semana)</p>
                          <p>• Vacaciones: Julio y Agosto (sin clases)</p>
                          <p>• Los días festivos pueden afectar el calendario</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">¡Felicidades!</h3>
                      <p>Has alcanzado el grado máximo en tu categoría.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exams Tab */}
            <TabsContent value="exams">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Historial de Exámenes</span>
                  </CardTitle>
                  <CardDescription>
                    Registro completo de todos tus exámenes realizados
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {userExams.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No hay exámenes registrados</h3>
                      <p>Cuando realices tu primer examen, aparecerá aquí el historial.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userExams
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((exam) => (
                        <div key={exam.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                exam.result === 'passed' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {exam.result === 'passed' ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Examen de {exam.toGrade?.name || 'Grado'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(exam.date).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                            </div>
                            
                            <Badge variant={exam.result === 'passed' ? 'default' : 'destructive'}>
                              {exam.result === 'passed' ? 'APROBADO' : 'REPROBADO'}
                            </Badge>
                          </div>

                          {exam.notes && (
                            <div className="mt-3 pt-3 border-t">
                              <span className="font-medium text-gray-600">Observaciones:</span>
                              <p className="text-sm text-gray-700 mt-1">{exam.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Cuenta</CardTitle>
                  <CardDescription>
                    Actualiza tu información de acceso
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nombre de Usuario</Label>
                      <Input
                        id="username"
                        value={user.username}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">
                        Contacta con el administrador para cambiar tu nombre de usuario
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                        minLength={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        minLength={4}
                      />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Guardando...' : 'Actualizar Contraseña'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}