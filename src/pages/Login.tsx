import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_CLUB_SETTINGS } from '@/types';
import { Eye, EyeOff, AlertCircle, Key, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clubSettings] = useState(DEFAULT_CLUB_SETTINGS);

  useEffect(() => {
    if (user) {
      if (user.role === 'estudiante') {
        navigate('/profile');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast.success('Inicio de sesión exitoso');
      } else {
        toast.error('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
  };

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
            {clubSettings.clubName}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogIn className="h-5 w-5" />
              <span>Iniciar Sesión</span>
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nombre de usuario"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
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

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/forgot-password')}
                className="text-blue-600 hover:text-blue-500"
              >
                <Key className="h-4 w-4 mr-2" />
                ¿Olvidaste tu contraseña?
              </Button>
            </div>

            {/* Demo Credentials */}
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Credenciales de demostración:</strong>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">Chief Instructor</div>
                      <div className="text-xs text-gray-600">admin / admin123</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDemoLogin('admin', 'admin123')}
                    >
                      Usar
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">Profesor</div>
                      <div className="text-xs text-gray-600">profesor1 / profesor123</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDemoLogin('profesor1', 'profesor123')}
                    >
                      Usar
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">Estudiante</div>
                      <div className="text-xs text-gray-600">estudiante1 / estudiante123</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDemoLogin('estudiante1', 'estudiante123')}
                    >
                      Usar
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}