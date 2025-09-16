import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, User, GRADES } from '@/types';
import { 
  ArrowLeft,
  Save,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

export default function EditStudent() {
  const { user, getAllUsers, updateUser } = useAuth();
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  
  const [studentData, setStudentData] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    notes: '',
    gradeId: '',
    photo: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
      navigate('/students');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);

    // Find the student to edit
    const allUsers = getAllUsers();
    const student = allUsers.find(u => u.id === studentId && u.role === 'estudiante');
    
    if (!student) {
      toast.error('Estudiante no encontrado');
      navigate('/students');
      return;
    }

    setStudentData(student);
    setFormData({
      name: student.name,
      username: student.username,
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      birthDate: student.birthDate || '',
      emergencyContact: student.emergencyContact || '',
      emergencyPhone: student.emergencyPhone || '',
      medicalInfo: student.medicalInfo || '',
      notes: student.notes || '',
      gradeId: student.grade.id,
      photo: student.photo || ''
    });
  }, [user, navigate, studentId, getAllUsers]);

  if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor') || !studentData) {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          photo: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.gradeId) {
      newErrors.gradeId = 'Selecciona un grado';
    }

    // Check if username is already taken by another user
    const allUsers = getAllUsers();
    const existingUser = allUsers.find(u => 
      u.username === formData.username && u.id !== studentData.id
    );
    if (existingUser) {
      newErrors.username = 'Este nombre de usuario ya está en uso';
    }

    // Check if email is already taken by another user
    const existingEmailUser = allUsers.find(u => 
      u.email === formData.email && u.id !== studentData.id
    );
    if (existingEmailUser) {
      newErrors.email = 'Este email ya está en uso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);

    try {
      const selectedGrade = GRADES.ALL.find(g => g.id === formData.gradeId);
      if (!selectedGrade) {
        toast.error('Grado seleccionado no válido');
        setIsLoading(false);
        return;
      }

      const updatedStudent: User = {
        ...studentData,
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        birthDate: formData.birthDate,
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        medicalInfo: formData.medicalInfo.trim(),
        notes: formData.notes.trim(),
        grade: selectedGrade,
        photo: formData.photo || `https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=${formData.name.charAt(0)}`,
        updatedAt: new Date().toISOString()
      };

      updateUser(updatedStudent);
      toast.success('Estudiante actualizado correctamente');
      
      setTimeout(() => {
        navigate('/students');
      }, 1500);

    } catch (error) {
      toast.error('Error al actualizar el estudiante');
    } finally {
      setIsLoading(false);
    }
  };

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
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/students')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Estudiantes
                </Button>
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
                  <p className="text-sm text-gray-500">Editar Estudiante</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="h-6 w-6" />
                <span>Editar Estudiante: {studentData.name}</span>
              </CardTitle>
              <CardDescription>
                Actualiza la información del estudiante
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload */}
                <div className="flex items-center space-x-6">
                  <div className="shrink-0">
                    <img 
                      src={formData.photo || `https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=${formData.name.charAt(0)}`}
                      alt="Foto del estudiante"
                      className="h-20 w-20 object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Cambiar Foto
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG o GIF. Máximo 5MB.
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nombre completo del estudiante"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de Usuario *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Usuario para iniciar sesión"
                      className={errors.username ? 'border-red-500' : ''}
                    />
                    {errors.username && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.username}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@ejemplo.com"
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+34 123 456 789"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradeId">Grado *</Label>
                    <Select value={formData.gradeId} onValueChange={(value) => handleInputChange('gradeId', value)}>
                      <SelectTrigger className={errors.gradeId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecciona un grado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="" disabled>Selecciona un grado</SelectItem>
                        {GRADES.ALL.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name} - {grade.beltColor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.gradeId && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.gradeId}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Dirección completa"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      placeholder="Nombre del contacto"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                        placeholder="+34 123 456 789"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-2">
                  <Label htmlFor="medicalInfo">Información Médica</Label>
                  <Textarea
                    id="medicalInfo"
                    value={formData.medicalInfo}
                    onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                    placeholder="Alergias, medicamentos, condiciones médicas relevantes..."
                    rows={3}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Cualquier información adicional relevante..."
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/students')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="min-w-[120px]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}