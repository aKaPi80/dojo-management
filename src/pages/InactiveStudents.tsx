import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, User } from '@/types';
import { 
  ArrowLeft,
  Search,
  UserX,
  UserCheck,
  Calendar,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  Users,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

export default function InactiveStudents() {
  const { user, getAllUsers, updateUser } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
  const inactiveUsers = allUsers.filter(u => 
    !u.isActive && 
    u.role === 'estudiante' &&
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === inactiveUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(inactiveUsers.map(u => u.id));
    }
  };

  const handleReactivateUsers = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Selecciona al menos un estudiante para reactivar');
      return;
    }

    setIsLoading(true);

    try {
      for (const userId of selectedUsers) {
        const userToUpdate = allUsers.find(u => u.id === userId);
        if (userToUpdate) {
          const updatedUser = {
            ...userToUpdate,
            isActive: true,
            reactivatedAt: new Date().toISOString(),
            reactivatedBy: user.name,
            updatedAt: new Date().toISOString()
          };
          updateUser(updatedUser);
        }
      }

      toast.success(`${selectedUsers.length} estudiante(s) reactivado(s) correctamente`);
      setSelectedUsers([]);
      
    } catch (error) {
      toast.error('Error al reactivar estudiantes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSingle = async (targetUser: User) => {
    setIsLoading(true);

    try {
      const updatedUser = {
        ...targetUser,
        isActive: true,
        reactivatedAt: new Date().toISOString(),
        reactivatedBy: user.name,
        updatedAt: new Date().toISOString()
      };
      
      updateUser(updatedUser);
      toast.success(`${targetUser.name} ha sido reactivado correctamente`);
      
    } catch (error) {
      toast.error('Error al reactivar el estudiante');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                  onClick={() => navigate('/students')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Estudiantes
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
                  <p className="text-sm text-gray-500">Estudiantes de Baja</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserX className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Estudiantes de Baja</p>
                    <p className="text-2xl font-bold text-red-600">{inactiveUsers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                    <p className="text-2xl font-bold text-blue-600">{allUsers.filter(u => u.role === 'estudiante').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Estudiantes Activos</p>
                    <p className="text-2xl font-bold text-green-600">{allUsers.filter(u => u.role === 'estudiante' && u.isActive).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserX className="h-6 w-6 text-red-600" />
                <span>Gestión de Estudiantes de Baja</span>
              </CardTitle>
              <CardDescription>
                Administra los estudiantes que están dados de baja y reactívalos cuando sea necesario
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar estudiantes de baja..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {inactiveUsers.length > 0 && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleSelectAll}
                    >
                      {selectedUsers.length === inactiveUsers.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                    </Button>
                    
                    {selectedUsers.length > 0 && (
                      <Button 
                        onClick={handleReactivateUsers}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reactivar ({selectedUsers.length})
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {selectedUsers.length > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>{selectedUsers.length} estudiante(s) seleccionado(s)</strong> para reactivación.
                    Los estudiantes reactivados volverán a aparecer en la lista de estudiantes activos.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Inactive Students List */}
          {inactiveUsers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <UserCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ¡Excelente! No hay estudiantes de baja
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'No se encontraron estudiantes de baja con ese nombre'
                    : 'Todos los estudiantes están activos en el dojo'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveUsers.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(student.id)}
                          onChange={() => handleSelectUser(student.id)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <img 
                          src={student.photo || `https://via.placeholder.com/48x48/EF4444/FFFFFF?text=${student.name.charAt(0)}`}
                          alt={student.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-600">@{student.username}</p>
                        </div>
                      </div>
                      <Badge variant="destructive">
                        <UserX className="h-3 w-3 mr-1" />
                        Baja
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Badge variant="outline">{student.grade.name}</Badge>
                        <span>•</span>
                        <span>{student.grade.beltColor}</span>
                      </div>
                      
                      {student.email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{student.email}</span>
                        </div>
                      )}
                      
                      {student.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>Ingreso: {formatDate(student.joinDate)}</span>
                      </div>

                      {student.deactivatedAt && (
                        <div className="flex items-center space-x-2 text-sm text-red-600">
                          <UserX className="h-3 w-3" />
                          <span>Baja: {formatDate(student.deactivatedAt)}</span>
                        </div>
                      )}

                      {student.deactivatedBy && (
                        <div className="text-xs text-gray-500">
                          Dado de baja por: {student.deactivatedBy}
                        </div>
                      )}

                      {student.deactivationReason && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Motivo:</strong> {student.deactivationReason}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleReactivateSingle(student)}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reactivar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Alert */}
          <Alert className="mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Información importante:</strong>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Los estudiantes de baja no aparecen en las listas de asistencia</li>
                <li>• Al reactivar un estudiante, volverá a la lista de estudiantes activos</li>
                <li>• Se conserva todo el historial de asistencias y exámenes</li>
                <li>• Solo profesores y el Chief Instructor pueden reactivar estudiantes</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}