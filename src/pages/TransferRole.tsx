import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, User } from '@/types';
import { 
  ArrowLeft,
  Crown,
  Users,
  AlertTriangle,
  CheckCircle,
  Search,
  User as UserIcon,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';

export default function TransferRole() {
  const { user, getAllUsers, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');

  useEffect(() => {
    if (!user || user.role !== 'chief_instructor') {
      navigate('/dashboard');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);
  }, [user, navigate]);

  if (!user || user.role !== 'chief_instructor') {
    return null;
  }

  const allUsers = getAllUsers();
  const eligibleUsers = allUsers.filter(u => 
    u.role === 'profesor' && 
    u.isActive && 
    u.id !== user.id &&
    (searchTerm === '' || 
     u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSelectUser = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setStep('confirm');
  };

  const handleTransfer = async () => {
    if (!selectedUser) return;

    if (confirmationText !== 'TRANSFERIR ROLE') {
      toast.error('Debes escribir "TRANSFERIR ROLE" para confirmar');
      return;
    }

    setIsTransferring(true);

    try {
      // Update selected user to chief_instructor
      const updatedSelectedUser = { 
        ...selectedUser, 
        role: 'chief_instructor' as const,
        updatedAt: new Date().toISOString()
      };
      
      // Update current user to profesor
      const updatedCurrentUser = { 
        ...user, 
        role: 'profesor' as const,
        updatedAt: new Date().toISOString()
      };

      // Update both users
      updateUser(updatedSelectedUser);
      updateUser(updatedCurrentUser);

      setStep('success');
      toast.success('Rol de Chief Instructor transferido exitosamente');

      // Auto logout after 3 seconds
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 3000);

    } catch (error) {
      toast.error('Error al transferir el rol');
    } finally {
      setIsTransferring(false);
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
                  onClick={() => navigate('/settings')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Configuración
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
                  <p className="text-sm text-gray-500">Transferir Rol de Chief Instructor</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {step === 'select' && (
            <>
              {/* Warning Card */}
              <Alert className="mb-8 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>¡ATENCIÓN!</strong> Esta acción es irreversible. Al transferir el rol de Chief Instructor:
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Perderás todos los privilegios de administrador</li>
                    <li>Tu rol cambiará a "Profesor"</li>
                    <li>El usuario seleccionado se convertirá en el nuevo Chief Instructor</li>
                    <li>Serás desconectado automáticamente del sistema</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Current Chief Instructor */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-6 w-6 text-yellow-600" />
                    <span>Chief Instructor Actual</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <img 
                        src={user.photo || `https://via.placeholder.com/60x60/4F46E5/FFFFFF?text=${user.name.charAt(0)}`}
                        alt={user.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Chief Instructor
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Select New Chief Instructor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-blue-600" />
                    <span>Seleccionar Nuevo Chief Instructor</span>
                  </CardTitle>
                  <CardDescription>
                    Solo los profesores activos pueden ser promovidos a Chief Instructor
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar profesor por nombre, usuario o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Eligible Users List */}
                  {eligibleUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay profesores disponibles
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm 
                          ? 'No se encontraron profesores que coincidan con la búsqueda'
                          : 'No hay profesores activos para promover a Chief Instructor'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {eligibleUsers.map((professor) => (
                        <div 
                          key={professor.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <img 
                              src={professor.photo || `https://via.placeholder.com/48x48/4F46E5/FFFFFF?text=${professor.name.charAt(0)}`}
                              alt={professor.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">{professor.name}</h3>
                              <p className="text-sm text-gray-600">@{professor.username}</p>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                {professor.email && (
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{professor.email}</span>
                                  </div>
                                )}
                                {professor.phone && (
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{professor.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{professor.grade.name}</Badge>
                            <Badge className="bg-blue-100 text-blue-800">Profesor</Badge>
                            <Button 
                              onClick={() => handleSelectUser(professor)}
                              variant="outline"
                            >
                              Seleccionar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {step === 'confirm' && selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                  <span>Confirmar Transferencia</span>
                </CardTitle>
                <CardDescription>
                  Esta acción no se puede deshacer
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Transfer Summary */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-medium text-gray-900">Resumen de la transferencia:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Chief */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Chief Instructor Actual:</p>
                      <div className="flex items-center space-x-3 p-3 bg-red-100 rounded-lg">
                        <UserIcon className="h-8 w-8 text-red-600" />
                        <div>
                          <p className="font-medium text-red-900">{user.name}</p>
                          <p className="text-sm text-red-700">Será degradado a Profesor</p>
                        </div>
                      </div>
                    </div>

                    {/* New Chief */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Nuevo Chief Instructor:</p>
                      <div className="flex items-center space-x-3 p-3 bg-green-100 rounded-lg">
                        <Crown className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">{selectedUser.name}</p>
                          <p className="text-sm text-green-700">Será promovido a Chief Instructor</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirmation Input */}
                <div className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Para confirmar esta transferencia, escribe <strong>"TRANSFERIR ROLE"</strong> en el campo de abajo:
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="confirmation">Confirmación</Label>
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="Escribe: TRANSFERIR ROLE"
                      className={confirmationText === 'TRANSFERIR ROLE' ? 'border-green-500' : 'border-red-300'}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('select')}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleTransfer}
                    disabled={confirmationText !== 'TRANSFERIR ROLE' || isTransferring}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {isTransferring ? 'Transfiriendo...' : 'Transferir Rol'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'success' && selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <span>Transferencia Completada</span>
                </CardTitle>
                <CardDescription>
                  El rol ha sido transferido exitosamente
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>¡Transferencia exitosa!</strong><br />
                    {selectedUser.name} es ahora el nuevo Chief Instructor del {clubSettings.clubName}.
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Cambios realizados:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{selectedUser.name} promovido a Chief Instructor</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Tu rol cambiado a Profesor</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Privilegios de administrador transferidos</span>
                    </li>
                  </ul>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Serás desconectado automáticamente en unos segundos. Deberás iniciar sesión nuevamente con tu rol de Profesor.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}