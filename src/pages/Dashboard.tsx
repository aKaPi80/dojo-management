import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, User } from '@/types';
import { 
  Users, 
  Calendar, 
  Award, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  BookOpen,
  Settings,
  ArrowRight,
  Eye
} from 'lucide-react';

export default function Dashboard() {
  const { user, getAllUsers } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Students go to profile instead of dashboard
    if (user.role === 'estudiante') {
      navigate('/profile');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);
  }, [user, navigate]);

  if (!user || user.role === 'estudiante') {
    return null;
  }

  // Simplified exam calculation - no dependency on gradeRequirements
  const calculateDaysToExam = (student: User): number => {
    if (!student.lastExamDate) return 0;
    
    const lastExamDate = new Date(student.lastExamDate);
    const today = new Date();
    
    // Simple calculation: 90 days (3 months) minimum between exams
    const daysSinceLastExam = Math.ceil((today.getTime() - lastExamDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return 90 - daysSinceLastExam; // Days until eligible (negative means overdue)
  };

  const getExamStatus = (student: User): 'ready' | 'overdue' | 'not_ready' => {
    const daysToExam = calculateDaysToExam(student);
    
    if (daysToExam <= 0 && daysToExam >= -30) return 'ready'; // Ready for exam
    if (daysToExam < -30) return 'overdue'; // More than 30 days overdue
    return 'not_ready'; // Not ready yet
  };

  const allUsers = getAllUsers();
  const students = allUsers.filter(u => u.role === 'estudiante' && u.isActive);
  const professors = allUsers.filter(u => (u.role === 'profesor' || u.role === 'chief_instructor') && u.isActive);

  // Calculate exam statistics
  const studentsReadyForExam = students.filter(student => getExamStatus(student) === 'ready');
  const overdueExams = students.filter(student => getExamStatus(student) === 'overdue');
  const averageAttendance = students.length > 0 
    ? Math.round(students.reduce((sum, student) => sum + student.attendancePercentage, 0) / students.length)
    : 0;

  // Recent activity (mock data for now)
  const recentActivities = [
    { id: 1, type: 'exam', message: 'Nuevo examen programado para Ana García', time: '2 horas' },
    { id: 2, type: 'attendance', message: '15 estudiantes registraron asistencia hoy', time: '4 horas' },
    { id: 3, type: 'student', message: 'Nuevo estudiante: Carlos Ruiz', time: '1 día' },
  ];

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
                  <p className="text-sm text-gray-500">Panel de Control</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido, {user.name}
            </h2>
            <p className="text-gray-600">
              {user.role === 'chief_instructor' ? 'Chief Instructor' : 'Profesor'} - 
              Aquí tienes un resumen de la actividad del dojo
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                    <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Profesores</p>
                    <p className="text-2xl font-bold text-green-600">{professors.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Asistencia Promedio</p>
                    <p className="text-2xl font-bold text-purple-600">{averageAttendance}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clases por Semana</p>
                    <p className="text-2xl font-bold text-orange-600">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exam Alerts - Now Clickable */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Students Ready for Exam */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/exam-list?type=ready')}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span>Listos para Examen</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">{studentsReadyForExam.length}</Badge>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </CardTitle>
                <CardDescription>
                  Estudiantes que han cumplido los requisitos mínimos
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {studentsReadyForExam.length > 0 ? (
                  <div className="space-y-3">
                    {studentsReadyForExam.slice(0, 3).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-green-900">{student.name}</p>
                          <p className="text-sm text-green-700">{student.grade.name}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">APTO</Badge>
                      </div>
                    ))}
                    {studentsReadyForExam.length > 3 && (
                      <div className="text-center">
                        <Button variant="ghost" size="sm" className="text-green-600">
                          Ver {studentsReadyForExam.length - 3} más <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">
                    No hay estudiantes listos para examen
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Overdue Exams */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/exam-list?type=overdue')}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <span>Exámenes Vencidos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800">{overdueExams.length}</Badge>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </CardTitle>
                <CardDescription>
                  Estudiantes con exámenes pendientes hace más de 30 días
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {overdueExams.length > 0 ? (
                  <div className="space-y-3">
                    {overdueExams.slice(0, 3).map((student) => {
                      const daysOverdue = Math.abs(calculateDaysToExam(student));
                      return (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium text-red-900">{student.name}</p>
                            <p className="text-sm text-red-700">{student.grade.name}</p>
                          </div>
                          <Badge className="bg-red-100 text-red-800">{daysOverdue}d</Badge>
                        </div>
                      );
                    })}
                    {overdueExams.length > 3 && (
                      <div className="text-center">
                        <Button variant="ghost" size="sm" className="text-red-600">
                          Ver {overdueExams.length - 3} más <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">
                    No hay exámenes vencidos
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col justify-center space-y-2"
              onClick={() => navigate('/students')}
            >
              <Users className="h-6 w-6" />
              <span>Gestionar Estudiantes</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col justify-center space-y-2"
              onClick={() => navigate('/attendance')}
            >
              <UserCheck className="h-6 w-6" />
              <span>Registrar Asistencia</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col justify-center space-y-2"
              onClick={() => navigate('/exams')}
            >
              <Award className="h-6 w-6" />
              <span>Gestionar Exámenes</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col justify-center space-y-2"
              onClick={() => navigate('/materials')}
            >
              <BookOpen className="h-6 w-6" />
              <span>Material de Estudio</span>
            </Button>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Actividad Reciente</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'exam' && <Award className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'attendance' && <UserCheck className="h-5 w-5 text-green-600" />}
                      {activity.type === 'student' && <Users className="h-5 w-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">Hace {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings Access for Chief Instructor */}
          {user.role === 'chief_instructor' && (
            <div className="mt-8">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Como Chief Instructor, tienes acceso completo a la configuración del dojo.</span>
                  <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                    Ir a Configuración
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}