import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DEFAULT_CLUB_SETTINGS } from '@/types';
import { 
  Key,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [clubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!token) {
      toast.error('Token de recuperación no válido');
      navigate('/login');
      return;
    }

    // Validate token
    const resetTokens = JSON.parse(localStorage.getItem('resetTokens') || '{}');
    const tokenData = resetTokens[token];
    
    if (!tokenData) {
      toast.error('Token de recuperación no válido o expirado');
      navigate('/login');
      return;
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - tokenData.createdAt;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (tokenAge > twentyFourHours) {
      toast.error('El token de recuperación ha expirado');
      // Clean up expired token
      delete resetTokens[token];
      localStorage.setItem('resetTokens', JSON.stringify(resetTokens));
      navigate('/login');
      return;
    }

    setIsValidToken(true);
    setUserEmail(tokenData.email);
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // Get reset token data
      const resetTokens = JSON.parse(localStorage.getItem('resetTokens') || '{}');
      const tokenData = resetTokens[token!];
      
      if (!tokenData) {
        toast.error('Token no válido');
        navigate('/login');
        return;
      }

      // Update user password
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.email === tokenData.email);
      
      if (userIndex === -1) {
        toast.error('Usuario no encontrado');
        navigate('/login');
        return;
      }

      // Update password and remove temporary password flag
      users[userIndex].password = password;
      users[userIndex].mustChangePassword = false;
      users[userIndex].updatedAt = new Date().toISOString();
      
      localStorage.setItem('users', JSON.stringify(users));
      
      // Clean up the used token
      delete resetTokens[token!];
      localStorage.setItem('resetTokens', JSON.stringify(resetTokens));
      
      toast.success('Contraseña actualizada correctamente');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      toast.error('Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Token no válido
            </h3>
            <p className="text-gray-600 mb-4">
              El enlace de recuperación no es válido o ha expirado.
            </p>
            <Button onClick={() => navigate('/login')}>
              Volver al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${clubSettings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white bg-opacity-90" />
      
      <div className="relative z-10 max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src={clubSettings.logo} 
            alt="Logo" 
            className="mx-auto h-16 w-16 object-contain"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MA';
            }}
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Restablecer Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu nueva contraseña para {userEmail}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-blue-600" />
              <span>Nueva Contraseña</span>
            </CardTitle>
            <CardDescription>
              Crea una contraseña segura para tu cuenta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    required
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
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Las contraseñas no coinciden
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Requisitos de contraseña:</strong>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• Mínimo 6 caracteres</li>
                    <li>• Se recomienda usar letras, números y símbolos</li>
                    <li>• Evita usar información personal</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
              >
                {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}