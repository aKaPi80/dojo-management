import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Upload,
  CheckCircle,
  AlertCircle,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClubRegistration() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    clubName: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MA',
    backgroundImage: 'https://images.unsplash.com/photo-1544737151-6e4b9d1b8c7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    classesPerWeek: 3
  });

  const [adminData, setAdminData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleClubDataChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdminDataChange = (field: string, value: string) => {
    setAdminData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          logo: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          backgroundImage: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    if (!formData.clubName.trim()) {
      toast.error('El nombre del club es obligatorio');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Ingresa un email válido para el club');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!adminData.name.trim()) {
      toast.error('El nombre del administrador es obligatorio');
      return false;
    }
    if (!adminData.username.trim()) {
      toast.error('El nombre de usuario es obligatorio');
      return false;
    }
    if (!adminData.password || adminData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (adminData.password !== adminData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }
    if (!adminData.email.trim() || !/\S+@\S+\.\S+/.test(adminData.email)) {
      toast.error('Ingresa un email válido para el administrador');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      // Save club settings
      const clubSettings = {
        ...formData,
        createdAt: new Date().toISOString(),
        isSetup: true
      };
      localStorage.setItem('clubSettings', JSON.stringify(clubSettings));

      // Create admin user
      const adminUser = {
        id: 'admin-' + Date.now(),
        name: adminData.name,
        username: adminData.username,
        password: adminData.password,
        email: adminData.email,
        role: 'chief_instructor',
        grade: {
          id: 'dan_10',
          name: '10º Dan',
          beltColor: 'Negro con 10 rayas doradas',
          category: 'adults',
          order: 28
        },
        joinDate: new Date().toISOString(),
        lastExamDate: new Date().toISOString(),
        attendancePercentage: 100,
        isActive: true,
        attendances: [],
        exams: [],
        createdAt: new Date().toISOString(),
        photo: `https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=${adminData.name.charAt(0)}`
      };

      // Initialize users array with admin
      const users = [adminUser];
      localStorage.setItem('users', JSON.stringify(users));

      // Mark setup as complete
      localStorage.setItem('setupComplete', 'true');

      toast.success('¡Club registrado exitosamente!');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      toast.error('Error al registrar el club');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${formData.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      <div className="relative z-10 max-w-2xl w-full space-y-8">
        <div className="text-center">
          <img 
            src={formData.logo} 
            alt="Logo" 
            className="mx-auto h-20 w-20 object-contain"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MA';
            }}
          />
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Registro de Dojo
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Configura tu dojo de artes marciales
          </p>
        </div>

        <Card className="bg-white bg-opacity-95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {step === 1 ? (
                <>
                  <Building2 className="h-5 w-5" />
                  <span>Información del Dojo</span>
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5" />
                  <span>Administrador Principal</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Configura la información básica de tu dojo'
                : 'Crea la cuenta del Chief Instructor'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 1 ? (
              <div className="space-y-6">
                {/* Club Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clubName">Nombre del Dojo *</Label>
                    <Input
                      id="clubName"
                      value={formData.clubName}
                      onChange={(e) => handleClubDataChange('clubName', e.target.value)}
                      placeholder="Ej: Dojo Sakura"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classesPerWeek">Clases por Semana</Label>
                    <Input
                      id="classesPerWeek"
                      type="number"
                      min="1"
                      max="7"
                      value={formData.classesPerWeek}
                      onChange={(e) => handleClubDataChange('classesPerWeek', parseInt(e.target.value) || 3)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleClubDataChange('description', e.target.value)}
                    placeholder="Describe tu dojo, estilo de artes marciales, filosofía..."
                    rows={3}
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email del Dojo *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleClubDataChange('email', e.target.value)}
                        placeholder="contacto@dojo.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleClubDataChange('phone', e.target.value)}
                        placeholder="+34 123 456 789"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleClubDataChange('address', e.target.value)}
                        placeholder="Calle, Ciudad, País"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleClubDataChange('website', e.target.value)}
                        placeholder="https://www.dojo.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Visual Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Logo del Dojo</Label>
                    <div className="flex items-center space-x-4">
                      <img 
                        src={formData.logo} 
                        alt="Logo" 
                        className="h-16 w-16 object-contain border rounded"
                      />
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Subir Logo
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Imagen de Fondo</Label>
                    <div className="space-y-2">
                      <div 
                        className="h-16 w-full bg-cover bg-center border rounded"
                        style={{ backgroundImage: `url(${formData.backgroundImage})` }}
                      />
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBackgroundUpload}
                          className="hidden"
                          id="background-upload"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById('background-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Subir Fondo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={handleNextStep} className="w-full" size="lg">
                  Continuar
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Admin Info */}
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Crown className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Chief Instructor:</strong> Esta cuenta tendrá acceso completo a todas las funciones del sistema.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Nombre Completo *</Label>
                    <Input
                      id="adminName"
                      value={adminData.name}
                      onChange={(e) => handleAdminDataChange('name', e.target.value)}
                      placeholder="Sensei Juan Pérez"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminUsername">Nombre de Usuario *</Label>
                    <Input
                      id="adminUsername"
                      value={adminData.username}
                      onChange={(e) => handleAdminDataChange('username', e.target.value)}
                      placeholder="admin"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email del Administrador *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminData.email}
                    onChange={(e) => handleAdminDataChange('email', e.target.value)}
                    placeholder="admin@dojo.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Contraseña *</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminData.password}
                      onChange={(e) => handleAdminDataChange('password', e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={adminData.confirmPassword}
                      onChange={(e) => handleAdminDataChange('confirmPassword', e.target.value)}
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>

                {adminData.confirmPassword && adminData.password !== adminData.confirmPassword && (
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
                    <strong>Información importante:</strong>
                    <ul className="mt-2 text-sm space-y-1">
                      <li>• Guarda estas credenciales en un lugar seguro</li>
                      <li>• Podrás cambiar la contraseña después del registro</li>
                      <li>• El email se usará para recuperación de cuenta</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                    Anterior
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading}
                    className="flex-1"
                    size="lg"
                  >
                    {isLoading ? 'Creando Dojo...' : 'Crear Dojo'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}