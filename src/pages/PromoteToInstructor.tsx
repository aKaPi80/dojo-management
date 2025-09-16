import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, User } from '@/types';
import { UserCheck, Crown, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function PromoteToInstructor() {
  const { user, getAllUsers, updateUser } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [eligibleStudents, setEligibleStudents] = useState<User[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'chief_instructor') {
      navigate('/dashboard');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);

    // Load eligible students (active students only)
    const users = getAllUsers();
    const students = users.filter(u => 
      u.role === 'estudiante' && 
      u.isActive && 
      u.id !== user.id
    );
    setEligibleStudents(students);
  }, [user, navigate, getAllUsers]);

  const handlePromote = async (studentId: string) => {
    setIsLoading(true);
    try {
      const users = getAllUsers();
      const student = users.find(u => u.id === studentId);
      
      if (!student) {
        toast.error('Estudiante no encontrado');
        return;
      }

      const updatedStudent: User = {
        ...student,
        role: 'profesor'
      };

      const result = await updateUser(updatedStudent);
      if (result.success) {
        toast.success(`${student.name} ha sido promovido a Profesor`);
        
        // Refresh the list
        const updatedUsers = getAllUsers();
        const updatedEligibleStudents = updatedUsers.filter(u => 
          u.role === 'estudiante' && 
          u.isActive && 
          u.id !== user.id
        );
        setEligibleStudents(updatedEligibleStudents);
      } else {
        toast.error('Error al promover el estudiante');
      }
    } catch (error) {
      console.error('Error promoting student:', error);
      toast.error('Error al promover el estudiante');
    } finally {
      setIsLoading(false);
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
                  <p className="text-sm text-gray-500">Promover a Instructor</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/members')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Miembros
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span>Promover Estudiantes a Profesores</span>
              </CardTitle>
              <CardDescription>
                Selecciona estudiantes activos para promoverlos al rol de Profesor
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Solo el Chief Instructor puede promover estudiantes a profesores. Esta acción no se puede deshacer desde esta pantalla.
                </AlertDescription>
              </Alert>

              {eligibleStudents.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudiantes elegibles</h3>
                  <p className="text-gray-500">
                    Todos los estudiantes activos ya han sido promovidos o no hay estudiantes registrados.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {eligibleStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {student.photo ? (
                            <img 
                              src={student.photo} 
                              alt={student.name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-lg font-medium text-gray-600">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-500">@{student.username}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{student.grade.name}</Badge>
                            <Badge variant="outline">Estudiante</Badge>
                            <span className="text-xs text-gray-500">
                              Asistencia: {student.attendancePercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handlePromote(student.id)}
                        disabled={isLoading}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Promover a Profesor
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}