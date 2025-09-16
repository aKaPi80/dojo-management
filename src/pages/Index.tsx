import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEFAULT_CLUB_SETTINGS } from '@/types';
import { 
  Building2,
  Users,
  Award,
  Calendar,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if club is already set up
    const setupComplete = localStorage.getItem('setupComplete');
    const clubSettings = localStorage.getItem('clubSettings');
    
    if (setupComplete && clubSettings) {
      // Club is already set up, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/club-registration');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
      style={{
        backgroundImage: `url(${DEFAULT_CLUB_SETTINGS.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white bg-opacity-95" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <img 
                  src={DEFAULT_CLUB_SETTINGS.logo} 
                  alt="Logo" 
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MA';
                  }}
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Sistema de Gestión de Dojo</h1>
                  <p className="text-sm text-gray-500">Plataforma completa para artes marciales</p>
                </div>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/login')}
              >
                Ya tengo una cuenta
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestiona tu{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dojo
              </span>{' '}
              de forma profesional
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistema completo de gestión para dojos de artes marciales. 
              Controla estudiantes, asistencias, exámenes y más desde una sola plataforma.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              >
                <Building2 className="h-5 w-5 mr-2" />
                Crear Mi Dojo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/login')}
                className="px-8 py-3"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Gestión de Estudiantes
                </h3>
                <p className="text-gray-600 text-sm">
                  Administra perfiles, grados, historial y progreso de todos tus estudiantes
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Control de Asistencias
                </h3>
                <p className="text-gray-600 text-sm">
                  Registra y monitorea la asistencia de estudiantes a clases y entrenamientos
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sistema de Exámenes
                </h3>
                <p className="text-gray-600 text-sm">
                  Programa y gestiona exámenes de grado con seguimiento completo
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Configuración Flexible
                </h3>
                <p className="text-gray-600 text-sm">
                  Personaliza tu dojo con logo, colores y configuraciones específicas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Section */}
          <Card className="mb-16">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">
                ¿Por qué elegir nuestro sistema?
              </CardTitle>
              <CardDescription className="text-lg">
                Diseñado específicamente para dojos de artes marciales
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Sistema de Grados Completo</h4>
                      <p className="text-gray-600 text-sm">28 grados desde 10º Kyu hasta 10º Dan, adaptable a cualquier arte marcial</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Roles y Permisos</h4>
                      <p className="text-gray-600 text-sm">Chief Instructor, Profesores y Estudiantes con accesos diferenciados</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Fácil de Usar</h4>
                      <p className="text-gray-600 text-sm">Interfaz intuitiva diseñada para instructores, no para programadores</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Gestión de Bajas</h4>
                      <p className="text-gray-600 text-sm">Sistema completo para dar de baja y reactivar estudiantes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Recuperación de Cuenta</h4>
                      <p className="text-gray-600 text-sm">Sistema seguro de recuperación de contraseñas por email</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Transferencia de Roles</h4>
                      <p className="text-gray-600 text-sm">Proceso seguro para transferir la administración del dojo</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-12 text-center">
              <Star className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
              <h2 className="text-3xl font-bold mb-4">
                ¡Comienza hoy mismo!
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Configura tu dojo en menos de 5 minutos y comienza a gestionar 
                tus estudiantes de forma profesional.
              </p>
              
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
              >
                <Building2 className="h-5 w-5 mr-2" />
                Crear Mi Dojo Ahora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>© 2024 Sistema de Gestión de Dojo. Diseñado para artes marciales.</p>
              <p className="text-sm mt-2">
                Plataforma completa para la administración profesional de dojos
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}