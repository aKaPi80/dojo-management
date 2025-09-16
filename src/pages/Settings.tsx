import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS } from '@/types';
import { 
  Settings as SettingsIcon, 
  Save, 
  Upload, 
  AlertCircle,
  Crown,
  Users,
  Calendar,
  Award,
  BookOpen,
  Image,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'chief_instructor') {
      navigate('/dashboard');
      return;
    }

    // Load current settings
    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);
  }, [user, navigate]);

  if (!user || user.role !== 'chief_instructor') {
    return null;
  }

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Save settings to localStorage
      localStorage.setItem('clubSettings', JSON.stringify(clubSettings));
      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (field: 'logo' | 'backgroundImage') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setClubSettings(prev => ({
            ...prev,
            [field]: result
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const quickActions = [
    {
      title: 'Gestionar Usuarios',
      description: 'Ver y administrar todos los usuarios del sistema',
      icon: Users,
      action: () => navigate('/students'),
      color: 'text-blue-600'
    },
    {
      title: 'Transferir Rol',
      description: 'Transferir el rol de Chief Instructor a otro profesor',
      icon: Crown,
      action: () => navigate('/transfer-role'),
      color: 'text-yellow-600'
    },
    {
      title: 'Gestionar Exámenes',
      description: 'Configurar y programar exámenes de grado',
      icon: Award,
      action: () => navigate('/exams'),
      color: 'text-green-600'
    },
    {
      title: 'Material de Estudio',
      description: 'Administrar recursos y materiales de aprendizaje',
      icon: BookOpen,
      action: () => navigate('/materials'),
      color: 'text-purple-600'
    }
  ];

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
                  <p className="text-sm text-gray-500">Configuración del Sistema</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Configuración del Dojo
            </h2>
            <p className="text-gray-600">
              Como Chief Instructor, puedes personalizar la configuración del {clubSettings.clubName}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-5 w-5" />
                    <span>Información Básica</span>
                  </CardTitle>
                  <CardDescription>
                    Configuración general del dojo
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clubName">Nombre del Dojo</Label>
                      <Input
                        id="clubName"
                        value={clubSettings.clubName}
                        onChange={(e) => setClubSettings(prev => ({ ...prev, clubName: e.target.value }))}
                        placeholder="Nombre del dojo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="classesPerWeek">Clases por Semana</Label>
                      <Input
                        id="classesPerWeek"
                        type="number"
                        min="1"
                        max="7"
                        value={clubSettings.classesPerWeek}
                        onChange={(e) => setClubSettings(prev => ({ ...prev, classesPerWeek: parseInt(e.target.value) || 2 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={clubSettings.description}
                      onChange={(e) => setClubSettings(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del dojo..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={clubSettings.address}
                        onChange={(e) => setClubSettings(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Dirección del dojo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={clubSettings.phone}
                        onChange={(e) => setClubSettings(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Teléfono de contacto"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clubSettings.email}
                      onChange={(e) => setClubSettings(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email de contacto"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Visual Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Image className="h-5 w-5" />
                    <span>Configuración Visual</span>
                  </CardTitle>
                  <CardDescription>
                    Personaliza la apariencia del sistema
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Logo */}
                  <div className="space-y-4">
                    <Label>Logo del Dojo</Label>
                    <div className="flex items-center space-x-4">
                      <img 
                        src={clubSettings.logo} 
                        alt="Logo actual" 
                        className="h-16 w-16 object-contain border rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MA';
                        }}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => handleImageUpload('logo')}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Cambiar Logo
                      </Button>
                    </div>
                  </div>

                  {/* Background Image */}
                  <div className="space-y-4">
                    <Label>Imagen de Fondo</Label>
                    <div className="flex items-center space-x-4">
                      <div 
                        className="h-16 w-24 bg-cover bg-center border rounded-lg"
                        style={{ backgroundImage: `url(${clubSettings.backgroundImage})` }}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => handleImageUpload('backgroundImage')}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Cambiar Fondo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-6">
              {/* Chief Instructor Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <span>Chief Instructor</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={user.photo || `https://via.placeholder.com/48x48/4F46E5/FFFFFF?text=${user.name.charAt(0)}`}
                      alt={user.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.grade.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SettingsIcon className="h-5 w-5" />
                    <span>Acciones Rápidas</span>
                  </CardTitle>
                  <CardDescription>
                    Acceso directo a funciones administrativas
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-4"
                      onClick={action.action}
                    >
                      <div className="flex items-start space-x-3">
                        <action.icon className={`h-5 w-5 mt-0.5 ${action.color}`} />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{action.title}</p>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* System Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Información del Sistema</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Versión:</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usuarios activos:</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última actualización:</span>
                    <span>Hoy</span>
                  </div>
                </CardContent>
              </Card>

              {/* Warning */}
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Importante:</strong> Los cambios en la configuración afectan a todos los usuarios del sistema.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}