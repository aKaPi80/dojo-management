import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, User, getAllUsers } from '@/types';
import { 
  UserX, 
  Search, 
  RotateCcw, 
  Eye, 
  Calendar,
  Award,
  Phone,
  Mail,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function InactiveMembers() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [inactiveMembers, setInactiveMembers] = useState<User[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'chief_instructor') {
      navigate('/dashboard');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);

    loadInactiveMembers();
  }, [user, navigate]);

  useEffect(() => {
    filterMembers();
  }, [inactiveMembers, searchTerm]);

  const loadInactiveMembers = () => {
    const allUsers = getAllUsers();
    const inactive = allUsers.filter(u => !u.isActive);
    setInactiveMembers(inactive);
  };

  const filterMembers = () => {
    if (!searchTerm.trim()) {
      setFilteredMembers(inactiveMembers);
      return;
    }

    const filtered = inactiveMembers.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.grade.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredMembers(filtered);
  };

  const handleReactivate = async (memberId: string) => {
    if (!confirm('¿Estás seguro de que quieres reactivar este miembro?')) {
      return;
    }

    setIsLoading(true);
    try {
      const allUsers = getAllUsers();
      const memberToReactivate = allUsers.find(u => u.id === memberId);
      
      if (!memberToReactivate) {
        toast.error('Miembro no encontrado');
        return;
      }

      const reactivatedMember: User = {
        ...memberToReactivate,
        isActive: true,
        updatedAt: new Date().toISOString()
      };

      await updateUser(reactivatedMember);
      toast.success(`${memberToReactivate.name} ha sido reactivado exitosamente`);
      
      // Reload inactive members list
      loadInactiveMembers();
      setSelectedMember(null);

    } catch (error) {
      console.error('Error reactivating member:', error);
      toast.error('Error al reactivar el miembro');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateInactiveDuration = (member: User) => {
    if (!member.updatedAt) return 'Fecha desconocida';
    
    const lastUpdate = new Date(member.updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} días`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} ${years === 1 ? 'año' : 'años'}${remainingMonths > 0 ? ` y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}` : ''}`;
    }
  };

  if (!user || user.role !== 'chief_instructor') {
    return null;
  }

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
                  <p className="text-sm text-gray-500">Miembros Inactivos</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Stats */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Miembros Dados de Baja</h2>
                <p className="text-gray-600">
                  Gestiona y reactiva miembros que se han dado de baja del dojo
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {inactiveMembers.length} miembros inactivos
                </Badge>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, usuario, email o grado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {inactiveMembers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <UserX className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay miembros inactivos
                </h3>
                <p className="text-gray-500">
                  Todos los miembros están actualmente activos en el dojo.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Members List */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Lista de Miembros Inactivos ({filteredMembers.length})
                </h3>
                
                {filteredMembers.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">No se encontraron miembros con ese criterio de búsqueda.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredMembers.map((member) => (
                      <Card 
                        key={member.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedMember?.id === member.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedMember(member)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={member.photo || 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=' + member.name.charAt(0)}
                                alt={member.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">{member.name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {member.grade.name}
                                  </Badge>
                                  <Badge variant={
                                    member.role === 'chief_instructor' ? 'destructive' :
                                    member.role === 'profesor' ? 'default' : 'outline'
                                  } className="text-xs">
                                    {member.role === 'chief_instructor' ? 'Chief' :
                                     member.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Inactivo desde:</p>
                              <p className="text-xs font-medium text-red-600">
                                {calculateInactiveDuration(member)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Member Details */}
              <div>
                {selectedMember ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <Eye className="h-5 w-5" />
                          <span>Detalles del Miembro</span>
                        </span>
                        <Button
                          onClick={() => handleReactivate(selectedMember.id)}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {isLoading ? 'Reactivando...' : 'Reactivar'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Profile Section */}
                      <div className="flex items-start space-x-4">
                        <img 
                          src={selectedMember.photo || 'https://via.placeholder.com/80x80/4F46E5/FFFFFF?text=' + selectedMember.name.charAt(0)}
                          alt={selectedMember.name}
                          className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900">{selectedMember.name}</h3>
                          <p className="text-gray-600">@{selectedMember.username}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary">{selectedMember.grade.name}</Badge>
                            <Badge variant={
                              selectedMember.role === 'chief_instructor' ? 'destructive' :
                              selectedMember.role === 'profesor' ? 'default' : 'outline'
                            }>
                              {selectedMember.role === 'chief_instructor' ? 'Chief Instructor' :
                               selectedMember.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Status Alert */}
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Miembro Inactivo</strong> - Dado de baja hace {calculateInactiveDuration(selectedMember)}
                        </AlertDescription>
                      </Alert>

                      {/* Contact Information */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Información de Contacto</h4>
                        <div className="space-y-2 text-sm">
                          {selectedMember.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{selectedMember.email}</span>
                            </div>
                          )}
                          {selectedMember.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{selectedMember.phone}</span>
                            </div>
                          )}
                          {selectedMember.address && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{selectedMember.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Academic Information */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Información Académica</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Fecha de ingreso:</span>
                            <p>{formatDate(selectedMember.joinDate)}</p>
                          </div>
                          {selectedMember.lastExamDate && (
                            <div>
                              <span className="font-medium text-gray-600">Último examen:</span>
                              <p>{formatDate(selectedMember.lastExamDate)}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-600">Asistencia general:</span>
                            <p>{selectedMember.attendancePercentage}%</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Categoría:</span>
                            <p>{selectedMember.grade.category === 'niños' ? 'Niños' : 'Adultos'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      {(selectedMember.emergencyContact || selectedMember.emergencyPhone) && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Contacto de Emergencia</h4>
                          <div className="space-y-2 text-sm">
                            {selectedMember.emergencyContact && (
                              <div>
                                <span className="font-medium text-gray-600">Nombre:</span>
                                <p>{selectedMember.emergencyContact}</p>
                              </div>
                            )}
                            {selectedMember.emergencyPhone && (
                              <div>
                                <span className="font-medium text-gray-600">Teléfono:</span>
                                <p>{selectedMember.emergencyPhone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Medical Information */}
                      {selectedMember.medicalInfo && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Información Médica</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {selectedMember.medicalInfo}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {selectedMember.notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Notas</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {selectedMember.notes}
                          </p>
                        </div>
                      )}

                      {/* Exam History */}
                      {selectedMember.exams && selectedMember.exams.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Historial de Exámenes</h4>
                          <div className="space-y-2">
                            {selectedMember.exams.slice(0, 3).map((exam) => (
                              <div key={exam.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                <div className="flex items-center space-x-2">
                                  <Award className="h-4 w-4 text-gray-400" />
                                  <span>{exam.newGrade.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={exam.result === 'passed' ? 'default' : 'destructive'} className="text-xs">
                                    {exam.result === 'passed' ? 'Aprobado' : 'Reprobado'}
                                  </Badge>
                                  <span className="text-gray-500">{formatDate(exam.date)}</span>
                                </div>
                              </div>
                            ))}
                            {selectedMember.exams.length > 3 && (
                              <p className="text-xs text-gray-500 text-center">
                                Y {selectedMember.exams.length - 3} exámenes más...
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <UserX className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Selecciona un miembro
                      </h3>
                      <p className="text-gray-500">
                        Haz clic en un miembro de la lista para ver sus detalles completos.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}