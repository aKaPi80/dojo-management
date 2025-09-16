import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_CLUB_SETTINGS } from '@/types';
import { 
  ArrowLeft, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Key
} from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'success'>('email');
  const [clubSettings] = useState(DEFAULT_CLUB_SETTINGS);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);

    try {
      // Check if email exists in users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

      if (!user) {
        toast.error('No se encontró una cuenta con este email');
        setIsLoading(false);
        return;
      }

      // Simulate sending email (in real app, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Update user with temporary password and flag to change password
      const updatedUsers = users.map((u: any) => 
        u.id === user.id 
          ? { ...u, password: tempPassword, mustChangePassword: true, tempPasswordExpiry: Date.now() + 24 * 60 * 60 * 1000 } // 24 hours
          : u
      );
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // In a real application, you would send this via email
      // For demo purposes, we'll show it in the UI
      localStorage.setItem('tempPasswordForDemo', JSON.stringify({
        email: user.email,
        tempPassword,
        username: user.username,
        name: user.name
      }));

      setStep('success');
      toast.success('Instrucciones de recuperación enviadas');
      
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
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
        {/* Header */}
        <div className="text-center">
          <img 
            src={clubSettings.logo} 
            alt="Logo" 
            className="mx-auto h-16 w-16 object-contain"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MA';
            }}
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {clubSettings.clubName}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Recuperación de Cuenta
          </p>
        </div>

        {step === 'email' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-blue-600" />
                <span>Recuperar Contraseña</span>
              </CardTitle>
              <CardDescription>
                Ingresa tu email para recibir instrucciones de recuperación
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email registrado</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Te enviaremos un email con una contraseña temporal para acceder a tu cuenta.
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Email Enviado</span>
              </CardTitle>
              <CardDescription>
                Revisa tu bandeja de entrada
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>¡Listo!</strong> Hemos enviado las instrucciones de recuperación a tu email.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-gray-600">
                <p><strong>Próximos pasos:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Revisa tu bandeja de entrada (y spam)</li>
                  <li>Busca el email con tu contraseña temporal</li>
                  <li>Inicia sesión con tu usuario y la contraseña temporal</li>
                  <li>Cambia tu contraseña inmediatamente</li>
                </ol>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Importante:</strong> La contraseña temporal expira en 24 horas.
                </AlertDescription>
              </Alert>

              {/* Demo purposes - show temp password */}
              {(() => {
                const tempData = localStorage.getItem('tempPasswordForDemo');
                if (tempData) {
                  const data = JSON.parse(tempData);
                  return (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>DEMO - Contraseña temporal:</strong><br />
                        Usuario: {data.username}<br />
                        Contraseña temporal: <code className="bg-blue-100 px-1 rounded">{data.tempPassword}</code>
                      </AlertDescription>
                    </Alert>
                  );
                }
                return null;
              })()}
            </CardContent>
          </Card>
        )}

        {/* Back to Login */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/login')}
            className="text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </Button>
        </div>
      </div>
    </div>
  );
}