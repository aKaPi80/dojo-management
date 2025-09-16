import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, ClubSettings, getAttendanceValue } from '@/types';
import { Settings, Save, RotateCcw, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ClubSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [clubSettings, setClubSettings] = useState<ClubSettings>(DEFAULT_CLUB_SETTINGS);
  const [attendanceValues, setAttendanceValues] = useState({
    normal: 1,
    curso_nacional: 3,
    curso_internacional: 6,
    especial: 2
  });

  useEffect(() => {
    if (!user || user.role !== 'chief_instructor') {
      navigate('/dashboard');
      return;
    }

    // Load club settings
    const savedSettings = localStorage.getItem('clubSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setClubSettings(settings);
      } catch (error) {
        console.error('Error parsing club settings:', error);
        setClubSettings(DEFAULT_CLUB_SETTINGS);
      }
    }

    // Load attendance values
    const savedAttendanceValues = localStorage.getItem('attendanceValues');
    if (savedAttendanceValues) {
      try {
        const values = JSON.parse(savedAttendanceValues);
        setAttendanceValues(values);
      } catch (error) {
        console.error('Error parsing attendance values:', error);
      }
    }
  }, [user, navigate]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Save club settings
      localStorage.setItem('clubSettings', JSON.stringify(clubSettings));
      
      // Save attendance values
      localStorage.setItem('attendanceValues', JSON.stringify(attendanceValues));
      
      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
      setClubSettings(DEFAULT_CLUB_SETTINGS);
      setAttendanceValues({
        normal: 1,
        curso_nacional: 3,
        curso_internacional: 6,
        especial: 2
      });
      toast.success('Configuración restaurada a valores por defecto');
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
                  <p className="text-sm text-gray-500">Configuración del Club</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Club Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Información del Club</span>
                </CardTitle>
                <CardDescription>
                  Configura la información básica y apariencia de tu dojo
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clubName">Nombre del Club *</Label>
                    <Input
                      id="clubName"
                      value={clubSettings.clubName}
                      onChange={(e) => setClubSettings({...clubSettings, clubName: e.target.value})}
                      placeholder="Nombre de tu dojo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">URL del Logo</Label>
                    <Input
                      id="logo"
                      type="url"
                      value={clubSettings.logo}
                      onChange={(e) => setClubSettings({...clubSettings, logo: e.target.value})}
                      placeholder="https://ejemplo.com/logo.png"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundImage">URL de Imagen de Fondo</Label>
                  <Input
                    id="backgroundImage"
                    type="url"
                    value={clubSettings.backgroundImage}
                    onChange={(e) => setClubSettings({...clubSettings, backgroundImage: e.target.value})}
                    placeholder="https://ejemplo.com/fondo.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de Contacto</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={clubSettings.contactEmail}
                      onChange={(e) => setClubSettings({...clubSettings, contactEmail: e.target.value})}
                      placeholder="info@tudojo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                    <Input
                      id="contactPhone"
                      value={clubSettings.contactPhone}
                      onChange={(e) => setClubSettings({...clubSettings, contactPhone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección del Dojo</Label>
                  <Textarea
                    id="address"
                    value={clubSettings.address}
                    onChange={(e) => setClubSettings({...clubSettings, address: e.target.value})}
                    placeholder="Dirección completa del dojo"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      value={clubSettings.website}
                      onChange={(e) => setClubSettings({...clubSettings, website: e.target.value})}
                      placeholder="www.tudojo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={clubSettings.socialMedia.facebook || ''}
                      onChange={(e) => setClubSettings({
                        ...clubSettings, 
                        socialMedia: {...clubSettings.socialMedia, facebook: e.target.value}
                      })}
                      placeholder="@tudojo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={clubSettings.socialMedia.instagram || ''}
                      onChange={(e) => setClubSettings({
                        ...clubSettings, 
                        socialMedia: {...clubSettings.socialMedia, instagram: e.target.value}
                      })}
                      placeholder="@tudojo"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Values */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Valores de Asistencia</span>
                </CardTitle>
                <CardDescription>
                  Configura los multiplicadores para diferentes tipos de asistencia
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="normal">Asistencia Normal</Label>
                    <Input
                      id="normal"
                      type="number"
                      min="1"
                      max="10"
                      value={attendanceValues.normal}
                      onChange={(e) => setAttendanceValues({
                        ...attendanceValues, 
                        normal: parseInt(e.target.value) || 1
                      })}
                    />
                    <p className="text-xs text-gray-500">
                      Valor base para asistencias regulares
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="especial">Asistencia Especial</Label>
                    <Input
                      id="especial"
                      type="number"
                      min="1"
                      max="10"
                      value={attendanceValues.especial}
                      onChange={(e) => setAttendanceValues({
                        ...attendanceValues, 
                        especial: parseInt(e.target.value) || 2
                      })}
                    />
                    <p className="text-xs text-gray-500">
                      Valor para entrenamientos especiales
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="curso_nacional">Curso Nacional</Label>
                    <Input
                      id="curso_nacional"
                      type="number"
                      min="1"
                      max="10"
                      value={attendanceValues.curso_nacional}
                      onChange={(e) => setAttendanceValues({
                        ...attendanceValues, 
                        curso_nacional: parseInt(e.target.value) || 3
                      })}
                    />
                    <p className="text-xs text-gray-500">
                      Valor para cursos y seminarios nacionales
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="curso_internacional">Curso Internacional</Label>
                    <Input
                      id="curso_internacional"
                      type="number"
                      min="1"
                      max="10"
                      value={attendanceValues.curso_internacional}
                      onChange={(e) => setAttendanceValues({
                        ...attendanceValues, 
                        curso_internacional: parseInt(e.target.value) || 6
                      })}
                    />
                    <p className="text-xs text-gray-500">
                      Valor para cursos y seminarios internacionales
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Vista Previa de Valores</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="text-blue-800">
                      Normal: <strong>{attendanceValues.normal}x</strong>
                    </div>
                    <div className="text-blue-800">
                      Especial: <strong>{attendanceValues.especial}x</strong>
                    </div>
                    <div className="text-blue-800">
                      Nacional: <strong>{attendanceValues.curso_nacional}x</strong>
                    </div>
                    <div className="text-blue-800">
                      Internacional: <strong>{attendanceValues.curso_internacional}x</strong>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleResetSettings}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar por Defecto
              </Button>
              
              <Button 
                onClick={handleSaveSettings}
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}