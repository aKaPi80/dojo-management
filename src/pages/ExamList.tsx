import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, User, GRADES } from '@/types';
import { 
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Clock,
  User as UserIcon,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

export default function ExamList() {
  const { user, getAllUsers } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  
  const examType = searchParams.get('type') || 'ready';

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

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

  // Simplified exam readiness calculation
  const calculateExamReadiness = (student: User) => {
    if (!student.lastExamDate) {
      return {
        status: 'no_exam' as const,
        daysToExam: 0,
        message: 'Sin exámenes registrados'
      };
    }

    const lastExamDate = new Date(student.lastExamDate);
    const today = new Date();
    const daysSinceLastExam = Math.ceil((today.getTime() - lastExamDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Simple 90-day rule (3 months minimum between exams)
    const minDaysBetweenExams = 90;
    const daysToExam = minDaysBetweenExams - daysSinceLastExam;

    if (daysToExam <= 0 && daysToExam >= -30) {
      return {
        status: 'ready' as const,
        daysToExam: Math.abs(daysToExam),
        message: '¡Listo para examen!'
      };
    }

    if (daysToExam < -30) {
      return {
        status: 'overdue' as const,
        daysToExam: Math.abs(daysToExam),
        message: `${Math.abs(daysToExam)} días vencido`
      };
    }

    return {
      status: 'not_ready' as const,
      daysToExam: daysToExam,
      message: `${daysToExam} días restantes`
    };
  };

  const allUsers = getAllUsers();
  const students = allUsers.filter(u => u.role === 'estudiante' && u.isActive);

  // Filter students based on exam type and filters
  const getFilteredStudents = () => {
    let filteredStudents = students.filter(student => {
      const examReadiness = calculateExamReadiness(student);
      
      // Filter by exam type
      if (examType === 'ready' && examReadiness.status !== 'ready') return false;
      if (examType === 'overdue' && examReadiness.status !== 'overdue') return false;
      if (examType === 'not_ready' && examReadiness.status !== 'not_ready') return false;
      
      return true;
    });

    // Apply search filter
    if (searchTerm) {
      filteredStudents = filteredStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply grade filter
    if (selectedGrade !== 'all') {
      filteredStudents = filteredStudents.filter(student => student.grade.id === selectedGrade);
    }

    return filteredStudents;
  };

  const filteredStudents = getFilteredStudents();

  // Get all available grades for filter
  const allGrades = [...GRADES.CHILDREN, ...GRADES.ADULTS];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">APTO</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">VENCIDO</Badge>;
      case 'not_ready':
        return <Badge className="bg-yellow-100 text-yellow-800">NO APTO</Badge>;
      default:
        return <Badge variant="outline">SIN DATOS</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'not_ready':
        return <XCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTitle = () => {
    switch (examType) {
      case 'ready':
        return 'Estudiantes Listos para Examen';
      case 'overdue':
        return 'Exámenes Vencidos';
      case 'not_ready':
        return 'Estudiantes No Listos';
      default:
        return 'Lista de Exámenes';
    }
  };

  const getDescription = () => {
    switch (examType) {
      case 'ready':
        return 'Estudiantes que han cumplido los requisitos mínimos para rendir examen';
      case 'overdue':
        return 'Estudiantes con exámenes pendientes hace más de 30 días';
      case 'not_ready':
        return 'Estudiantes que aún no cumplen los requisitos para examen';
      default:
        return 'Gestión de exámenes por estado';
    }
  };

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
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </Button>
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
                  <p className="text-sm text-gray-500">Lista de Exámenes</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h2>
            <p className="text-gray-600">
              {getDescription()}
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtros</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Buscar estudiante</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Nombre o email del estudiante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Grade Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Filtrar por grado</label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los grados</SelectItem>
                      {allGrades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name} - {grade.beltColor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Mostrando {filteredStudents.length} de {students.length} estudiantes
            </p>
          </div>

          {/* Students List */}
          <div className="space-y-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const examReadiness = calculateExamReadiness(student);
                
                return (
                  <Card key={student.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={student.photo || `https://via.placeholder.com/60x60/4F46E5/FFFFFF?text=${student.name.charAt(0)}`}
                              alt={student.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                              {getStatusBadge(examReadiness.status)}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <UserIcon className="h-4 w-4" />
                                <span>{student.grade.name}</span>
                              </div>
                              
                              {student.email && (
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-4 w-4" />
                                  <span>{student.email}</span>
                                </div>
                              )}
                              
                              {student.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-4 w-4" />
                                  <span>{student.phone}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">
                                  Último examen: {student.lastExamDate 
                                    ? new Date(student.lastExamDate).toLocaleDateString('es-ES')
                                    : 'Nunca'
                                  }
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-600">
                                  Asistencia: {student.attendancePercentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              {getStatusIcon(examReadiness.status)}
                              <span className="text-sm font-medium">
                                {examReadiness.message}
                              </span>
                            </div>
                            
                            {examReadiness.status === 'ready' && (
                              <p className="text-xs text-green-600">
                                Puede rendir examen
                              </p>
                            )}
                            
                            {examReadiness.status === 'overdue' && (
                              <p className="text-xs text-red-600">
                                Requiere atención urgente
                              </p>
                            )}
                            
                            {examReadiness.status === 'not_ready' && (
                              <p className="text-xs text-yellow-600">
                                Necesita más tiempo
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No se encontraron estudiantes
                      </h3>
                      <p className="text-gray-600">
                        No hay estudiantes que coincidan con los filtros seleccionados.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}