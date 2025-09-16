import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { 
  DEFAULT_CLUB_SETTINGS, 
  User, 
  GRADES, 
  generateUsername, 
  generatePassword, 
  getAllUsers, 
  saveUsers,
  StudentCredentials,
  printCredentials,
  sendCredentialsByEmail
} from '@/types';
import { 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Printer,
  Send,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

export default function CreateStudent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<StudentCredentials | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    notes: '',
    ageCategory: '' as 'niños' | 'adultos' | '',
    selectedGrade: ''
  });

  useEffect(() => {
    if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
      navigate('/dashboard');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ageCategory || !formData.selectedGrade) {
      toast.error('Por favor selecciona la categoría de edad y el grado');
      return;
    }

    setIsLoading(true);
    try {
      const users = getAllUsers();
      
      // Check if email already exists
      if (formData.email && users.some(u => u.email === formData.email)) {
        toast.error('Ya existe un usuario con este email');
        setIsLoading(false);
        return;
      }

      // Find the selected grade
      const selectedGrade = GRADES.ALL.find(g => g.id === formData.selectedGrade);
      if (!selectedGrade) {
        toast.error('Grado seleccionado no válido');
        setIsLoading(false);
        return;
      }

      // Generate credentials
      const username = generateUsername(formData.name);
      const password = generatePassword();
      
      // Ensure username is unique
      let finalUsername = username;
      let counter = 1;
      while (users.some(u => u.username === finalUsername)) {
        finalUsername = `${username}${counter}`;
        counter++;
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: finalUsername,
        password: password,
        name: formData.name,
        email: formData.email || undefined,
        role: 'estudiante',
        grade: selectedGrade,
        birthDate: formData.birthDate || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
        medicalInfo: formData.medicalInfo || undefined,
        notes: formData.notes || undefined,
        joinDate: new Date().toISOString(),
        attendancePercentage: 0,
        isActive: true,
        mustChangePassword: true,
        createdBy: user?.id,
        attendances: [],
        exams: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save user
      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);

      // Create credentials object
      const credentials: StudentCredentials = {
        username: finalUsername,
        password: password,
        studentName: formData.name,
        webAppUrl: window.location.origin,
        createdDate: new Date().toISOString(),
        chiefInstructorCode: user?.role === 'chief_instructor' ? user.username : undefined
      };

      setCreatedCredentials(credentials);
      toast.success(`Estudiante ${formData.name} creado exitosamente`);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        birthDate: '',
        emergencyContact: '',
        emergencyPhone: '',
        medicalInfo: '',
        notes: '',
        ageCategory: '',
        selectedGrade: ''
      });

    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('Error al crear estudiante. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintCredentials = () => {
    if (createdCredentials) {
      printCredentials(createdCredentials);
      toast.success('Credenciales enviadas a impresora');
    }
  };

  const handleEmailCredentials = async () => {
    if (createdCredentials && formData.email) {
      try {
        await sendCredentialsByEmail(createdCredentials, formData.email);
        toast.success(`Credenciales enviadas a ${formData.email}`);
      } catch (error) {
        toast.error('Error al enviar email');
      }
    } else {
      toast.error('Email no disponible');
    }
  };

  const handleCopyCredentials = () => {
    if (createdCredentials) {
      const credentialsText = `
Credenciales de Acceso - ${clubSettings.clubName}

Estudiante: ${createdCredentials.studentName}
Usuario: ${createdCredentials.username}
Contraseña: ${createdCredentials.password}
Acceso web: ${createdCredentials.webAppUrl}
Fecha de creación: ${new Date(createdCredentials.createdDate).toLocaleDateString()}

Por seguridad, el usuario debe cambiar su contraseña en el primer inicio de sesión.
      `.trim();
      
      navigator.clipboard.writeText(credentialsText);
      toast.success('Credenciales copiadas al portapapeles');
    }
  };

  const getAvailableGrades = () => {
    if (!formData.ageCategory) return [];
    return formData.ageCategory === 'niños' ? GRADES.CHILDREN : GRADES.ADULTS;
  };

  if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
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
                  <p className="text-sm text-gray-500">Crear Nuevo Estudiante</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Message with Credentials */}
          {createdCredentials && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span>¡Estudiante Creado Exitosamente!</span>
                </CardTitle>
                <CardDescription className="text-green-700">
                  Las credenciales de acceso han sido generadas. Puedes imprimirlas o enviarlas por email.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-3">Credenciales de Acceso:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Estudiante:</span>
                      <p className="font-mono">{createdCredentials.studentName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Usuario:</span>
                      <p className="font-mono">{createdCredentials.username}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Contraseña:</span>
                      <p className="font-mono">{createdCredentials.password}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Acceso web:</span>
                      <p className="font-mono text-xs">{createdCredentials.webAppUrl}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={handlePrintCredentials} variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Credenciales
                  </Button>
                  
                  {formData.email && (
                    <Button onClick={handleEmailCredentials} variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Enviar por Email
                    </Button>
                  )}
                  
                  <Button onClick={handleCopyCredentials} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar al Portapapeles
                  </Button>
                  
                  <Button 
                    onClick={() => setCreatedCredentials(null)} 
                    variant="default"
                  >
                    Crear Otro Estudiante
                  </Button>
                </div>

                <Alert className="mt-4 border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Importante:</strong> El estudiante debe cambiar su contraseña en el primer inicio de sesión por seguridad.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Create Student Form */}
          {!createdCredentials && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Crear Nuevo Estudiante</span>
                </CardTitle>
                <CardDescription>
                  Completa la información del estudiante para crear su cuenta
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nombre y apellidos del estudiante"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@ejemplo.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Número de teléfono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Dirección completa"
                    />
                  </div>

                  {/* Grade Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="ageCategory">Categoría de Edad *</Label>
                      <Select 
                        value={formData.ageCategory} 
                        onValueChange={(value: 'niños' | 'adultos') => {
                          setFormData(prev => ({ 
                            ...prev, 
                            ageCategory: value,
                            selectedGrade: '' // Reset grade when category changes
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="niños">Niños</SelectItem>
                          <SelectItem value="adultos">Adultos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selectedGrade">Grado Inicial *</Label>
                      <Select 
                        value={formData.selectedGrade} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, selectedGrade: value }))}
                        disabled={!formData.ageCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el grado" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableGrades().map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.name} - {grade.beltColor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        placeholder="Nombre del contacto de emergencia"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                        placeholder="Teléfono del contacto de emergencia"
                      />
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-2">
                    <Label htmlFor="medicalInfo">Información Médica</Label>
                    <Textarea
                      id="medicalInfo"
                      value={formData.medicalInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicalInfo: e.target.value }))}
                      placeholder="Alergias, medicaciones, condiciones médicas relevantes..."
                      rows={3}
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Cualquier información adicional relevante..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/members')}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {isLoading ? 'Creando...' : 'Crear Estudiante'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}