import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User, Crown, UserCheck, UserX, Search, Plus } from 'lucide-react';
import { User as UserType } from '@/types';

export default function ProfessorManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  // Only Chief Instructor can access this page
  if (user?.role !== 'chief_instructor') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
            <p className="text-gray-600">
              Solo el Chief Instructor puede gestionar profesores.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadUsers = () => {
    const storedUsers: UserType[] = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  };

  const handlePromoteToProfessor = () => {
    if (!selectedStudent) {
      toast.error('Selecciona un estudiante');
      return;
    }

    const updatedUsers = users.map(u => 
      u.id === selectedStudent 
        ? { ...u, role: 'profesor' as const }
        : u
    );

    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    const studentName = users.find(u => u.id === selectedStudent)?.name;
    toast.success(`${studentName} ha sido nombrado profesor`);
    
    setSelectedStudent('');
    setIsDialogOpen(false);
  };

  const handleDemoteToStudent = (professorId: string) => {
    const updatedUsers = users.map(u => 
      u.id === professorId 
        ? { ...u, role: 'estudiante' as const }
        : u
    );

    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    const professorName = users.find(u => u.id === professorId)?.name;
    toast.success(`${professorName} ha sido removido como profesor`);
  };

  const professors = users.filter(u => u.role === 'profesor');
  const students = users.filter(u => u.role === 'estudiante');
  
  const filteredProfessors = professors.filter(professor =>
    professor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Profesores</h1>
        <p className="text-gray-600">
          Nombra y gestiona los profesores del dojo
        </p>
      </div>

      {/* Search and Add Professor */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar profesores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nombrar Profesor</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nombrar Nuevo Profesor</DialogTitle>
              <DialogDescription>
                Selecciona un estudiante para promoverlo a profesor
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Estudiante</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.grade.name} ({student.grade.beltColor})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handlePromoteToProfessor} className="flex-1">
                  Nombrar Profesor
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Professors List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          Profesores Actuales ({professors.length})
        </h2>
        
        {filteredProfessors.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay profesores</h3>
              <p className="text-gray-600 mb-4">
                Aún no has nombrado ningún profesor. Puedes promover estudiantes a profesores.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfessors.map((professor) => (
              <Card key={professor.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{professor.name}</CardTitle>
                        <CardDescription>{professor.email}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Profesor</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Grado:</span>
                      <span className="font-medium">
                        {professor.grade.name} - {professor.grade.beltColor}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Miembro desde:</span>
                      <span className="font-medium">
                        {new Date(professor.joinDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Categoría:</span>
                      <span className="font-medium capitalize">{professor.category}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoteToStudent(professor.id)}
                      className="w-full flex items-center space-x-2 text-red-600 hover:text-red-700"
                    >
                      <UserX className="h-4 w-4" />
                      <span>Remover como Profesor</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profesores</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professors.length}</div>
            <p className="text-xs text-muted-foreground">
              Profesores activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para promoción
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Incluyendo Chief Instructor
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}