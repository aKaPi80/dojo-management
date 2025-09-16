import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS } from '@/types';
import { 
  ArrowLeft, 
  User, 
  Lock, 
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);
    
    // Set current values
    setNewUsername(user.username);
    setRecoveryEmail(user.email || '');
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast.error('El nombre de usuario no puede estar vacío');
      return;
    }

    if (newUsername === user.username) {
      toast.info('El nombre de usuario es el mismo');
      return;
    }

    setIsUpdatingUsername(true);

    try {
      // Check if username already exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find((u: any) => u.username === newUsername && u.id !== user.id);
      
      if (existingUser) {
        toast.error('Este nombre de usuario ya está en uso');
        setIsUpdatingUsername(false);
        return;
      }

      const updatedUser = {
        ...user,
        username: newUsername,
        updatedAt: new Date().toISOString()
      };

      updateUser(updatedUser);
      toast.success('Nombre de usuario actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el nombre de usuario');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast.error('Ingresa tu contraseña actual');
      return;
    }

    if (currentPassword !== user.password) {
      toast.error('La contraseña actual es incorrecta');
      return;
    }

    if (!newPassword) {
      toast.error('Ingresa una nueva contraseña');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword === currentPassword) {
      toast.info('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const updatedUser = {
        ...user,
        password: newPassword,
        mustChangePassword: false,
        updatedAt: new Date().toISOString()
      };

      updateUser(updatedUser);
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast.success('Contraseña actualizada correctamente');
    } catch (error) {
      toast.error('Error al actualizar la contraseña');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateRecoveryEmail = async () => {
    if (!recoveryEmail.trim()) {
      toast.error('El email de recuperación no puede estar vacío');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(recoveryEmail)) {
      toast.error('Ingresa un email válido');
      return;
    }

    if (recoveryEmail === user.email) {
      toast.info('El email de recuperación es el mismo');
      return;
    }

    setIsUpdatingEmail(true);

    try {
      const updatedUser = {
        ...user,
        email: recoveryEmail,
        updatedAt: new Date().toISOString()
      };

      updateUser(updatedUser);
      toast.success('Email de recuperación actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el email de recuperación');
    } finally {
      setIsUpdatingEmail(false);
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
                  onClick={() => navigate(user.role === 'estudiante' ? '/profile' : '/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
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
                  <p className="text-sm text-gray-500">Configuración de Cuenta</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* User Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
              <CardDescription>
                Configuración de seguridad para {user.name}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.role === 'chief_instructor' ? 'Chief Instructor' : user.role === 'profesor' ? 'Profesor' : 'Estudiante'}</p>
                  <p className="text-sm text-gray-600">{user.grade.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Username */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Cambiar Nombre de Usuario</span>
              </CardTitle>
              <CardDescription>
                Actualiza tu nombre de usuario para iniciar sesión
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentUsername">Usuario Actual</Label>
                <Input
                  id="currentUsername"
                  value={user.username}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newUsername">Nuevo Usuario</Label>
                <Input
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Nuevo nombre de usuario"
                />
              </div>

              <Button 
                onClick={handleUpdateUsername}
                disabled={isUpdatingUsername || newUsername === user.username}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdatingUsername ? 'Actualizando...' : 'Actualizar Usuario'}
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Cambiar Contraseña</span>
              </CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mayor seguridad
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-600">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recomendaciones:</strong>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• Usa al menos 6 caracteres</li>
                    <li>• Combina letras, números y símbolos</li>
                    <li>• No uses información personal</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdatingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </CardContent>
          </Card>

          {/* Recovery Email */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email de Recuperación</span>
              </CardTitle>
              <CardDescription>
                Configura un email para recuperar tu cuenta si olvidas tus credenciales
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recoveryEmail">Email de Recuperación</Label>
                <Input
                  id="recoveryEmail"
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
                <p className="text-xs text-gray-500">
                  Este email se usará para enviarte instrucciones de recuperación si olvidas tu usuario o contraseña
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Importante:</strong> Asegúrate de usar un email al que tengas acceso. 
                  Sin un email de recuperación válido, no podrás recuperar tu cuenta si olvidas tus credenciales.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleUpdateRecoveryEmail}
                disabled={isUpdatingEmail || !recoveryEmail || recoveryEmail === user.email}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdatingEmail ? 'Actualizando...' : 'Actualizar Email de Recuperación'}
              </Button>
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Consejos de Seguridad</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Cambia tu contraseña regularmente</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>No compartas tus credenciales con nadie</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Mantén actualizado tu email de recuperación</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Cierra sesión en dispositivos compartidos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}