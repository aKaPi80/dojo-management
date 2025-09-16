import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Search, Phone, Mail, Calendar, Award, Globe, QrCode, UserX, Users } from 'lucide-react';
import { User, Grade, GRADES, InternationalCourse } from '@/types';
import { toast } from 'sonner';

interface DeactivatedMember {
  user: User;
  deactivationDate: string;
  reason: string;
}

export default function MemberManagement() {
  const [members, setMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'niños' | 'adultos'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [isCoursesDialogOpen, setIsCoursesDialogOpen] = useState(false);
  const [selectedMemberForCourses, setSelectedMemberForCourses] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    emergencyContact: '',
    category: 'adultos' as 'niños' | 'adultos',
    gradeId: GRADES.ADULTS[0].id,
    isActive: true,
    photo: ''
  });

  // Course form state
  const [courseData, setCourseData] = useState({
    name: '',
    location: '',
    date: ''
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = () => {
    try {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const students = users.filter(u => u.role === 'estudiante' && u.isActive);
      setMembers(students);
    } catch (error) {
      console.error('Error loading members:', error);
      setMembers([]);
    }
  };

  const filteredMembers = members
    .filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           member.grade.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || member.grade.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Ordenar por categoría (adultos primero) y luego por nombre
      if (a.grade.category !== b.grade.category) {
        return a.grade.category === 'adultos' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

  const activeAdults = members.filter(m => m.grade.category === 'adultos').length;
  const activeKids = members.filter(m => m.grade.category === 'niños').length;

  const availableGrades = formData.category === 'niños' ? GRADES.KIDS : GRADES.ADULTS;
  const selectedGrade = availableGrades.find(g => g.id === formData.gradeId) || availableGrades[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate birthDate before proceeding
    if (!formData.birthDate) {
      toast.error('La fecha de nacimiento es obligatoria');
      return;
    }

    const birthDate = new Date(formData.birthDate);
    if (isNaN(birthDate.getTime())) {
      toast.error('Fecha de nacimiento inválida');
      return;
    }
    
    try {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (editingMember) {
        // Update existing member
        const updatedUsers = users.map(u => 
          u.id === editingMember.id 
            ? { 
                ...u, 
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                birthDate: formData.birthDate,
                emergencyContact: formData.emergencyContact,
                grade: selectedGrade,
                isActive: formData.isActive,
                photo: formData.photo
              }
            : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        toast.success('Miembro actualizado exitosamente');
      } else {
        // Create new member
        const newMember: User = {
          id: Date.now().toString(),
          username: formData.email || `user${Date.now()}`,
          password: 'temp123',
          name: formData.name,
          email: formData.email,
          role: 'estudiante',
          grade: selectedGrade,
          birthDate: formData.birthDate,
          phone: formData.phone,
          address: formData.address,
          emergencyContact: formData.emergencyContact,
          joinDate: new Date().toISOString(),
          attendancePercentage: 0,
          isActive: formData.isActive,
          mustChangePassword: true,
          photo: formData.photo
        };
        
        users.push(newMember);
        localStorage.setItem('users', JSON.stringify(users));
        toast.success('Nuevo miembro creado exitosamente');
      }
      
      loadMembers();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Error al guardar el miembro');
    }
  };

  const handleEdit = (member: User) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      birthDate: member.birthDate || '',
      emergencyContact: member.emergencyContact || '',
      category: member.grade.category,
      gradeId: member.grade.id,
      isActive: member.isActive,
      photo: member.photo || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeactivate = (memberId: string) => {
    if (confirm('¿Estás seguro de que quieres dar de baja a este miembro? Se guardará en el historial de bajas.')) {
      try {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const deactivatedMembers: DeactivatedMember[] = JSON.parse(localStorage.getItem('deactivatedMembers') || '[]');
        
        const memberToDeactivate = users.find(u => u.id === memberId);
        if (memberToDeactivate) {
          // Añadir a la lista de dados de baja
          const deactivatedMember: DeactivatedMember = {
            user: { ...memberToDeactivate, isActive: false },
            deactivationDate: new Date().toISOString().split('T')[0],
            reason: 'Baja voluntaria'
          };
          
          deactivatedMembers.push(deactivatedMember);
          localStorage.setItem('deactivatedMembers', JSON.stringify(deactivatedMembers));
          
          // Marcar como inactivo en lugar de eliminar
          const updatedUsers = users.map(u => 
            u.id === memberId ? { ...u, isActive: false } : u
          );
          localStorage.setItem('users', JSON.stringify(updatedUsers));
          
          loadMembers();
          toast.success('Miembro dado de baja exitosamente');
        }
      } catch (error) {
        console.error('Error deactivating member:', error);
        toast.error('Error al dar de baja el miembro');
      }
    }
  };

  const handleAddCourse = () => {
    if (!selectedMemberForCourses || !courseData.name || !courseData.location || !courseData.date) {
      toast.error('Por favor completa todos los campos del curso');
      return;
    }

    const courseDate = new Date(courseData.date);
    if (isNaN(courseDate.getTime())) {
      toast.error('Fecha del curso inválida');
      return;
    }

    try {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === selectedMemberForCourses.id);
      
      if (userIndex === -1) return;

      const newCourse: InternationalCourse = {
        id: Date.now().toString(),
        name: courseData.name,
        location: courseData.location,
        date: courseData.date,
        timeReduction: 3
      };

      // Initialize internationalCourses if it doesn't exist
      if (!users[userIndex].internationalCourses) {
        users[userIndex].internationalCourses = [];
      }

      users[userIndex].internationalCourses!.push(newCourse);
      
      localStorage.setItem('users', JSON.stringify(users));
      loadMembers();
      
      setCourseData({ name: '', location: '', date: '' });
      toast.success('Curso internacional añadido exitosamente');
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('Error al añadir el curso');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      birthDate: '',
      emergencyContact: '',
      category: 'adultos',
      gradeId: GRADES.ADULTS[0].id,
      isActive: true,
      photo: ''
    });
    setEditingMember(null);
  };

  const getGradeBadgeColor = (grade: Grade) => {
    if (grade.beltColor.includes('-')) {
      return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800';
    }
    
    switch (grade.beltColor) {
      case 'Blanco': return 'bg-gray-100 text-gray-800';
      case 'Amarillo': return 'bg-yellow-100 text-yellow-800';
      case 'Naranja': return 'bg-orange-100 text-orange-800';
      case 'Verde': return 'bg-green-100 text-green-800';
      case 'Azul': return 'bg-blue-100 text-blue-800';
      case 'Marrón': return 'bg-amber-100 text-amber-800';
      case 'Negro': return 'bg-black text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 'N/A';
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Miembros Activos</h1>
          <p className="text-gray-600">SKBC Gipuzkoa - Shorinji Kempo</p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Adultos: {activeAdults}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Niños: {activeKids}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Total: {activeAdults + activeKids}</span>
            </div>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Miembro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
              </DialogTitle>
              <DialogDescription>
                {editingMember ? 'Modifica los datos del miembro' : 'Completa los datos del nuevo practicante de Shorinji Kempo'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de nacimiento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Residencia</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Dirección de residencia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">URL de la foto de perfil</Label>
                <Input
                  id="photo"
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({...formData, photo: e.target.value})}
                  placeholder="https://ejemplo.com/foto.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value: 'niños' | 'adultos') => {
                  const newGrades = value === 'niños' ? GRADES.KIDS : GRADES.ADULTS;
                  setFormData({
                    ...formData, 
                    category: value,
                    gradeId: newGrades[0].id
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="niños">Niños</SelectItem>
                    <SelectItem value="adultos">Adultos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grade">Grado inicial</Label>
                <Select value={formData.gradeId} onValueChange={(value) => setFormData({...formData, gradeId: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGrades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name} - {grade.beltColor}
                        {grade.isIntermediate && ' (Intermedio)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+34 600 123 456"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergency">Contacto de emergencia</Label>
                <Textarea
                  id="emergency"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  placeholder="Nombre y teléfono del contacto de emergencia"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="active">Miembro activo</Label>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingMember ? 'Actualizar' : 'Crear'} Miembro
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, email o grado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={(value: 'all' | 'niños' | 'adultos') => setCategoryFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="adultos">Solo adultos</SelectItem>
            <SelectItem value="niños">Solo niños</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => {
          const age = calculateAge(member.birthDate || '');
          
          return (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start space-x-3">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={member.photo} alt={member.name} />
                    <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-600">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{member.name}</CardTitle>
                    <CardDescription className="truncate">{member.email}</CardDescription>
                    <CardDescription>{age} años • {member.grade.category}</CardDescription>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge className={getGradeBadgeColor(member.grade)}>
                        {member.grade.name}
                        {member.grade.isIntermediate && ' (Int.)'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {member.grade.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {member.address && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <span className="font-medium">Residencia:</span>
                      <span className="truncate">{member.address}</span>
                    </div>
                  )}
                  
                  {member.phone && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>Desde: {new Date(member.joinDate).toLocaleDateString()}</span>
                  </div>
                  
                  {member.internationalCourses && member.internationalCourses.length > 0 && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Globe className="h-3 w-3" />
                      <span>{member.internationalCourses.length} curso(s) internacional(es)</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedMemberForCourses(member);
                        setIsCoursesDialogOpen(true);
                      }}
                    >
                      <Globe className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeactivate(member.id)}
                    >
                      <UserX className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* International Courses Dialog */}
      <Dialog open={isCoursesDialogOpen} onOpenChange={setIsCoursesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cursos Internacionales</DialogTitle>
            <DialogDescription>
              {selectedMemberForCourses?.name} - Gestiona los cursos internacionales
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedMemberForCourses?.internationalCourses?.map((course) => (
              <div key={course.id} className="p-3 border rounded-lg">
                <h4 className="font-medium">{course.name}</h4>
                <p className="text-sm text-gray-600">{course.location}</p>
                <p className="text-sm text-gray-600">{new Date(course.date).toLocaleDateString()}</p>
                <p className="text-sm text-green-600">Reducción: {course.timeReduction} meses</p>
              </div>
            ))}
            
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium">Añadir Nuevo Curso</h4>
              <Input
                placeholder="Nombre del curso"
                value={courseData.name}
                onChange={(e) => setCourseData({...courseData, name: e.target.value})}
              />
              <Input
                placeholder="Ubicación"
                value={courseData.location}
                onChange={(e) => setCourseData({...courseData, location: e.target.value})}
              />
              <Input
                type="date"
                value={courseData.date}
                onChange={(e) => setCourseData({...courseData, date: e.target.value})}
              />
              <Button onClick={handleAddCourse} className="w-full">
                Añadir Curso
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron miembros</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Intenta con otros términos de búsqueda
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}