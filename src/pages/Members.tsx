import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, getAllUsers, saveUsers, User, GRADES } from '@/types';
import { 
  Users, 
  UserPlus, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  Crown,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';

export default function Members() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
      navigate('/dashboard');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);

    loadUsers();
  }, [user, navigate]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterGrade]);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    const activeUsers = allUsers.filter(u => u.isActive);
    setUsers(activeUsers);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    if (filterGrade !== 'all') {
      filtered = filtered.filter(u => u.grade.id === filterGrade);
    }

    setFilteredUsers(filtered);
  };

  const handleViewUser = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setShowUserDetails(true);
  };

  const handleEditUser = (userId: string) => {
    navigate(`/edit-student/${userId}`);
  };

  const handleDeactivateUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este usuario?')) {
      try {
        const allUsers = getAllUsers();
        const userIndex = allUsers.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
          allUsers[userIndex].isActive = false;
          saveUsers(allUsers);
          loadUsers();
          toast.success('Usuario desactivado exitosamente');
        }
      } catch (error) {
        console.error('Error deactivating user:', error);
        toast.error('Error al desactivar el usuario');
      }
    }
  };

  const getRoleStats = () => {
    const chiefInstructors = users.filter(u => u.role === 'chief_instructor').length;
    const professors = users.filter(u => u.role === 'profesor').length;
    const students = users.filter(u => u.role === 'estudiante').length;
    
    return { chiefInstructors, professors, students, total: users.length };
  };

  const getGradeDistribution = () => {
    const distribution: {[key: string]: number} = {};
    users.forEach(u => {
      const gradeKey = u.grade.name;
      distribution[gradeKey] = (distribution[gradeKey] || 0) + 1;
    });
    return distribution;
  };

  if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
    return null;
  }

  const stats = getRoleStats();
  const gradeDistribution = getGradeDistribution();

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
                  <p className="text-sm text-gray-500">Gestión de Miembros</p>
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
                    <p className="text-sm font-medium text-gray-600">Total Miembros</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserPlus className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                    <p className="text-2xl font-bold text-green-600">{stats.students}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Profesores</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.professors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chief Instructors</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.chiefInstructors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Miembros</CardTitle>
                  <CardDescription>
                    Administra los miembros del dojo y sus información
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => navigate('/attendance')}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Asistencias
                  </Button>
                  {user.role === 'chief_instructor' && (
                    <Button onClick={() => navigate('/promote-instructor')} variant="secondary">
                      <Crown className="h-4 w-4 mr-2" />
                      Promover Profesores
                    </Button>
                  )}
                  <Button onClick={() => navigate('/create-student')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Miembro
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar miembro</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Nombre, usuario o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filterRole">Filtrar por rol</Label>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="chief_instructor">Chief Instructor</SelectItem>
                      <SelectItem value="profesor">Profesores</SelectItem>
                      <SelectItem value="estudiante">Estudiantes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filterGrade">Filtrar por grado</Label>
                  <Select value={filterGrade} onValueChange={setFilterGrade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los grados</SelectItem>
                      {GRADES.ALL.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name} - {grade.beltColor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No se encontraron miembros con los filtros aplicados.
                    </AlertDescription>
                  </Alert>
                ) : (
                  filteredUsers.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {member.photo ? (
                            <img 
                              src={member.photo} 
                              alt={member.name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-gray-600 font-medium text-lg">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-500">@{member.username}</p>
                              {member.email && (
                                <p className="text-xs text-gray-400">{member.email}</p>
                              )}
                            </div>
                            <Badge variant="secondary">
                              {member.grade.name}
                            </Badge>
                            <Badge variant={
                              member.role === 'chief_instructor' ? 'destructive' :
                              member.role === 'profesor' ? 'default' : 'outline'
                            }>
                              {member.role === 'chief_instructor' ? 'Chief Instructor' :
                               member.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm">
                          <p className="text-gray-900 font-medium">{member.attendancePercentage}%</p>
                          <p className="text-gray-500">asistencia</p>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewUser(member)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {(user.role === 'chief_instructor' || user.role === 'profesor') && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditUser(member.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {user.role === 'chief_instructor' && member.role !== 'chief_instructor' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeactivateUser(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Miembro</DialogTitle>
            <DialogDescription>
              Información completa del miembro seleccionado
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedUser.photo ? (
                    <img 
                      src={selectedUser.photo} 
                      alt={selectedUser.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium text-2xl">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600">@{selectedUser.username}</p>
                  <div className="flex space-x-2 mt-2">
                    <Badge variant="secondary">{selectedUser.grade.name}</Badge>
                    <Badge variant={
                      selectedUser.role === 'chief_instructor' ? 'destructive' :
                      selectedUser.role === 'profesor' ? 'default' : 'outline'
                    }>
                      {selectedUser.role === 'chief_instructor' ? 'Chief Instructor' :
                       selectedUser.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Información de Contacto</h4>
                  
                  {selectedUser.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedUser.email}</span>
                    </div>
                  )}
                  
                  {selectedUser.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedUser.phone}</span>
                    </div>
                  )}
                  
                  {selectedUser.birthDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(selectedUser.birthDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Información del Dojo</h4>
                  
                  <div>
                    <p className="text-sm text-gray-600">Fecha de ingreso</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedUser.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Porcentaje de asistencia</p>
                    <p className="text-sm font-medium">{selectedUser.attendancePercentage}%</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge variant={selectedUser.isActive ? 'default' : 'secondary'}>
                      {selectedUser.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Attendance History */}
              {selectedUser.attendances && selectedUser.attendances.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Historial de Asistencias Recientes</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {selectedUser.attendances.slice(-6).reverse().map((attendance) => (
                      <div key={attendance.id} className="text-xs p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <span>{new Date(attendance.date).toLocaleDateString()}</span>
                          <Badge variant={attendance.present ? 'default' : 'secondary'} className="text-xs">
                            {attendance.present ? 'Presente' : 'Ausente'}
                          </Badge>
                        </div>
                        <div className="text-gray-500 mt-1">
                          {attendance.sessionType === 'normal' ? 'Normal' :
                           attendance.sessionType === 'especial' ? 'Especial' :
                           attendance.sessionType === 'curso_nacional' ? 'C. Nacional' :
                           'C. Internacional'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {(selectedUser.address || selectedUser.emergencyContact) && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Información Adicional</h4>
                  
                  {selectedUser.address && (
                    <div>
                      <p className="text-sm text-gray-600">Dirección</p>
                      <p className="text-sm">{selectedUser.address}</p>
                    </div>
                  )}
                  
                  {selectedUser.emergencyContact && (
                    <div>
                      <p className="text-sm text-gray-600">Contacto de emergencia</p>
                      <p className="text-sm">{selectedUser.emergencyContact}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            {selectedUser && (user.role === 'chief_instructor' || user.role === 'profesor') && (
              <Button onClick={() => {
                setShowUserDetails(false);
                handleEditUser(selectedUser.id);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowUserDetails(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}