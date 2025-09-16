import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserCheck, Calendar, Mail, Phone, RotateCcw } from 'lucide-react';
import { DeactivatedMember, User, Grade } from '@/types';
import { toast } from 'sonner';

export default function DeactivatedMembers() {
  const [deactivatedMembers, setDeactivatedMembers] = useState<DeactivatedMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDeactivatedMembers();
  }, []);

  const loadDeactivatedMembers = () => {
    const stored: DeactivatedMember[] = JSON.parse(localStorage.getItem('deactivatedMembers') || '[]');
    setDeactivatedMembers(stored.sort((a, b) => 
      new Date(b.deactivationDate).getTime() - new Date(a.deactivationDate).getTime()
    ));
  };

  const filteredMembers = deactivatedMembers.filter(member => {
    const user = member.user;
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.grade.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleReactivate = (memberId: string) => {
    if (confirm('¿Estás seguro de que quieres reactivar a este miembro?')) {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const deactivated: DeactivatedMember[] = JSON.parse(localStorage.getItem('deactivatedMembers') || '[]');
      
      const memberToReactivate = deactivated.find(dm => dm.user.id === memberId);
      if (memberToReactivate) {
        // Reactivar el usuario
        const userIndex = users.findIndex(u => u.id === memberId);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], active: true };
        } else {
          // Si no existe en users, añadirlo
          users.push({ ...memberToReactivate.user, active: true });
        }
        
        // Remover de la lista de dados de baja
        const updatedDeactivated = deactivated.filter(dm => dm.user.id !== memberId);
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('deactivatedMembers', JSON.stringify(updatedDeactivated));
        
        loadDeactivatedMembers();
        toast.success('Miembro reactivado exitosamente');
      }
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getGradeBadgeColor = (grade: Grade) => {
    if (grade.dan) return 'bg-black text-white';
    switch (grade.beltColor) {
      case 'Blanco': return 'bg-gray-100 text-gray-800';
      case 'Amarillo': return 'bg-yellow-100 text-yellow-800';
      case 'Naranja': return 'bg-orange-100 text-orange-800';
      case 'Verde': return 'bg-green-100 text-green-800';
      case 'Azul': return 'bg-blue-100 text-blue-800';
      case 'Marrón': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Miembros Dados de Baja</h1>
          <p className="text-gray-600">Historial de miembros inactivos - SKBC Gipuzkoa</p>
          <p className="text-sm text-gray-500 mt-1">
            Total de bajas: {deactivatedMembers.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2 max-w-sm">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, email o grado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((deactivatedMember) => {
          const member = deactivatedMember.user;
          const age = calculateAge(member.birthDate);
          
          return (
            <Card key={member.id} className="border-red-200 bg-red-50/30">
              <CardHeader>
                <div className="flex items-start space-x-3">
                  <Avatar className="w-16 h-16 opacity-75">
                    <AvatarImage src={member.photo} alt={member.name} />
                    <AvatarFallback className="text-lg font-bold bg-red-100 text-red-600">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{member.name}</CardTitle>
                    <CardDescription className="truncate">{member.email}</CardDescription>
                    <CardDescription>{age} años • {member.category}</CardDescription>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge className={getGradeBadgeColor(member.grade)}>
                        {member.grade.name}
                      </Badge>
                      <Badge variant="destructive" className="text-xs">
                        Inactivo
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
                    <span>Miembro desde: {new Date(member.joinDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-red-600">
                    <Calendar className="h-3 w-3" />
                    <span>Baja: {new Date(deactivatedMember.deactivationDate).toLocaleDateString()}</span>
                  </div>
                  
                  {deactivatedMember.reason && (
                    <div className="text-gray-600">
                      <span className="font-medium">Motivo:</span> {deactivatedMember.reason}
                    </div>
                  )}
                  
                  {member.internationalCourses.length > 0 && (
                    <div className="text-green-600 text-xs">
                      {member.internationalCourses.length} curso(s) internacional(es)
                    </div>
                  )}
                  
                  <div className="flex gap-1 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleReactivate(member.id)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reactivar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron miembros dados de baja' : 'No hay miembros dados de baja'}
            </p>
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