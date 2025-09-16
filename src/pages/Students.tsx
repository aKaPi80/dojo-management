import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, User, GRADES } from '@/types';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  UserX,
  Award,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function Students() {
  const { user, getAllUsers, updateUser } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Deactivation state
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivationDialog, setShowDeactivationDialog] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
      navigate('/dashboard');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);
  }, [user, navigate]);

  if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
    return null;
  }

  const allUsers = getAllUsers();
  const students = allUsers.filter(u => u.role === 'estudiante' && u.isActive);
  const professors = allUsers.filter(u => (u.role === 'profesor' || u.role === 'chief_instructor') && u.isActive);
  const inactiveStudents = allUsers.filter(u => u.role === 'estudiante' && !u.isActive);

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = filterGrade === 'all' || student.grade.id === filterGrade;
    const matchesCategory = filterCategory === 'all' || student.grade.category === filterCategory;
    
    return matchesSearch && matchesGrade && matchesCategory;
  });

  const getGradeColor = (grade: any) => {
    if (grade.category === 'children') {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const handleEditStudent = (student: User) => {
    // Navigate to edit student page or open edit modal
    navigate(`/edit-student/${student.id}`);
  };

  const handleDeactivateStudent = (student: User) => {
    setSelectedStudent(student);
    setDeactivationReason('');
    setShowDeactivationDialog(true);
  };

  const confirmDeactivation = async () => {
    if (!selectedStudent) return;

    if (!deactivationReason.trim()) {
      toast.error('Por favor ingresa un motivo para la baja');
      return;
    }

    setIsDeactivating(true);

    try {
      const updatedStudent = {
        ...selectedStudent,
        isActive: false,
        deactivatedAt: new Date().toISOString(),
        deactivatedBy: user.name,
        deactivationReason: deactivationReason.trim(),
        updatedAt: new Date().toISOString()
      };

      updateUser(updatedStudent);
      toast.success(`${selectedStudent.name} ha sido dado de baja correctamente`);
      
      setShowDeactivationDialog(false);
      setSelectedStudent(null);
      setDeactivationReason('');
      
    } catch (error) {
      toast.error('Error al dar de baja al estudiante');
    } finally {
      setIsDeactivating(false);
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
                  <p className="text-sm text-gray-500">Gestión de Estudiantes</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Estudiantes Activos</p>
                    <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserX className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Estudiantes de Baja</p>
                    <p className="text-2xl font-bold text-red-600">{inactiveStudents.length}</p>
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
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Activos</p>
                    <p className="text-2xl font-bold text-purple-600">{students.length + professors.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="students" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="students">Estudiantes Activos</TabsTrigger>
              <TabsTrigger value="inactive">Estudiantes de Baja</TabsTrigger>
              <TabsTrigger value="professors">Profesores</TabsTrigger>
            </TabsList>

            {/* Active Students Tab */}
            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Estudiantes Activos</span>
                      </CardTitle>
                      <CardDescription>
                        Gestiona los perfiles de todos los estudiantes activos
                      </CardDescription>
                    </div>
                    
                    <div className="flex space-x-2">
                      {user.role === 'chief_instructor' && (
                        <Button onClick={() => navigate('/create-student')}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Nuevo Estudiante
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por nombre, usuario o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <select 
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">Todas las categorías</option>
                      <option value="children">Niños</option>
                      <option value="adults">Adultos</option>
                    </select>
                  </div>

                  {/* Students Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                      <Card key={student.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900">{student.name}</h3>
                              <p className="text-sm text-gray-600">@{student.username}</p>
                            </div>
                            <Badge className={getGradeColor(student.grade)}>
                              {student.grade.name}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{student.email}</span>
                            </div>
                            {student.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{student.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Desde: {new Date(student.joinDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <span className="text-sm text-gray-500">
                              Asistencia: {student.attendancePercentage}%
                            </span>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditStudent(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user.role === 'chief_instructor' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeactivateStudent(student)}
                                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No se encontraron estudiantes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inactive Students Tab */}
            <TabsContent value="inactive">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <UserX className="h-5 w-5 text-red-600" />
                        <span>Estudiantes de Baja</span>
                      </CardTitle>
                      <CardDescription>
                        Estudiantes que han sido dados de baja del dojo
                      </CardDescription>
                    </div>
                    
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/inactive-students')}
                    >
                      Ver Gestión Completa
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {inactiveStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        ¡Excelente! No hay estudiantes de baja
                      </h3>
                      <p className="text-gray-600">
                        Todos los estudiantes están activos en el dojo
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert className="border-red-200 bg-red-50">
                        <UserX className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>{inactiveStudents.length} estudiante(s) de baja.</strong> 
                          Haz clic en "Ver Gestión Completa" para administrar las reactivaciones.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inactiveStudents.slice(0, 6).map((student) => (
                          <Card key={student.id} className="border-red-200">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{student.name}</h4>
                                  <p className="text-sm text-gray-600">@{student.username}</p>
                                  <p className="text-xs text-red-600 mt-1">
                                    Baja: {student.deactivatedAt ? new Date(student.deactivatedAt).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                <Badge variant="destructive">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Baja
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {inactiveStudents.length > 6 && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            Y {inactiveStudents.length - 6} estudiante(s) más de baja...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professors Tab */}
            <TabsContent value="professors">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Profesores e Instructores</span>
                  </CardTitle>
                  <CardDescription>
                    Personal docente del dojo
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {professors.map((professor) => (
                      <Card key={professor.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900">{professor.name}</h3>
                              <p className="text-sm text-gray-600">
                                {professor.role === 'chief_instructor' ? 'Chief Instructor' : 'Profesor'}
                              </p>
                            </div>
                            <Badge className="bg-orange-100 text-orange-800">
                              {professor.grade.name}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{professor.email}</span>
                            </div>
                            {professor.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{professor.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Desde: {new Date(professor.joinDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Deactivation Dialog */}
      <Dialog open={showDeactivationDialog} onOpenChange={setShowDeactivationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserX className="h-5 w-5 text-red-600" />
              <span>Dar de Baja Estudiante</span>
            </DialogTitle>
            <DialogDescription>
              Estás a punto de dar de baja a <strong>{selectedStudent?.name}</strong>. 
              Esta acción se puede revertir posteriormente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Importante:</strong> El estudiante no aparecerá en las listas de asistencia 
                ni podrá acceder al sistema hasta ser reactivado.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="deactivationReason">Motivo de la baja *</Label>
              <Textarea
                id="deactivationReason"
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder="Ej: Cambio de ciudad, problemas económicos, falta de tiempo..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeactivationDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmDeactivation}
                disabled={isDeactivating || !deactivationReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeactivating ? 'Procesando...' : 'Confirmar Baja'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}