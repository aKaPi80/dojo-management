import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_CLUB_SETTINGS } from '@/types';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ChangePassword() {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }

      if (formData.newPassword.length < 4) {
        toast.error('La contraseña debe tener al menos 4 caracteres');
        return;
      }

      const success = await changePassword(formData.oldPassword, formData.newPassword);

      if (success) {
        toast.success('Contraseña cambiada exitosamente');
        navigate('/dashboard');
      } else {
        toast.error('Contraseña actual incorrecta');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!user) return null;

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
                    e.currentTarget.src = 'https://via.placeholder.com/150x150?text=SKBC';
                  }}
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{clubSettings.clubName}</h1>
                  <p className="text-sm text-gray-500">Cambiar Contraseña</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Cambiar Contraseña</CardTitle>
              <CardDescription>
                {user.mustChangePassword 
                  ? 'Debes cambiar tu contraseña antes de continuar'
                  : 'Actualiza tu contraseña por seguridad'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {user.mustChangePassword && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Por seguridad, debes cambiar tu contraseña temporal antes de acceder al sistema.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Contraseña actual</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={showPasswords.old ? 'text' : 'password'}
                      value={formData.oldPassword}
                      onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                      placeholder="Ingresa tu contraseña actual"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('old')}
                    >
                      {showPasswords.old ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      placeholder="Ingresa tu nueva contraseña"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Confirma tu nueva contraseña"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                </Button>

                {!user.mustChangePassword && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancelar
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}