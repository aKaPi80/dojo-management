import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_CLUB_SETTINGS, GRADES, getAllUsers, saveUsers, User } from '@/types';
import { UserPlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    phone: '',
    address: '',
    photo: '',
    gradeId: GRADES.ADULTS[GRADES.ADULTS.length - 1]?.id || ''
  });

  useEffect(() => {
    // Check if Chief Instructor already exists
    const users = getAllUsers();
    const hasChief = users.some(u => u.role === 'chief_instructor');
    
    if (hasChief) {
      navigate('/');
      return;
    }

    // Load club settings
    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      if (formData.password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres');
        return;
      }

      if (!formData.name.trim() || !formData.username.trim()) {
        setError('Nombre y usuario son requeridos');
        return;
      }

      // Check if username already exists
      const users = getAllUsers();
      const existingUser = users.find(u => u.username === formData.username);
      if (existingUser) {
        setError('El nombre de usuario ya existe');
        return;
      }

      const selectedGrade = GRADES.ADULTS.find(g => g.id === formData.gradeId);
      if (!selectedGrade) {
        setError('Debe seleccionar un grado válido');
        return;
      }

      // Create Chief Instructor
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email || '',
        role: 'chief_instructor',
        grade: selectedGrade,
        birthDate: formData.birthDate || '',
        phone: formData.phone || '',
        address: formData.address || '',
        emergencyContact: '',
        photo: formData.photo || '',
        joinDate: new Date().toISOString(),
        attendancePercentage: 100,
        isActive: true,
        mustChangePassword: false
      };

      users.push(newUser);
      saveUsers(users);

      // Set as current user
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      toast.success('¡Chief Instructor registrado exitosamente!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setError('Error al registrar. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-50 p-6"
      style={{
        backgroundImage: `url(${clubSettings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src={clubSettings.logo} 
                alt="Logo" 
                className="h-16 w-16 object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MA';
                }}
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Registrar Chief Instructor
            </CardTitle>
            <CardDescription>
              Configura tu cuenta de administrador para comenzar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Tu nombre completo"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Usuario *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Nombre de usuario"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="correo@ejemplo.com"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grado *</Label>
                <Select 
                  value={formData.gradeId} 
                  onValueChange={(value) => setFormData({...formData, gradeId: value})}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.ADULTS.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name} - {grade.beltColor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Mínimo 4 caracteres"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Confirma tu contraseña"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 (555) 000-0000"
                  disabled={isLoading}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registrando...' : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrar Chief Instructor
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                disabled={isLoading}
              >
                ¿Ya tienes cuenta? Iniciar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}