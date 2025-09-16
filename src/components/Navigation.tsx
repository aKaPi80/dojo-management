import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Settings, 
  Users, 
  Calendar,
  Award,
  BookOpen,
  Database,
  UserCog,
  ChevronDown
} from 'lucide-react';

interface NavigationProps {
  clubSettings: any;
}

export default function Navigation({ clubSettings }: NavigationProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      label: 'Mi Perfil',
      icon: User,
      action: () => navigate('/profile'),
      roles: ['estudiante', 'profesor', 'chief_instructor']
    },
    {
      label: 'Configuración de Cuenta',
      icon: UserCog,
      action: () => navigate('/account-settings'),
      roles: ['estudiante', 'profesor', 'chief_instructor']
    },
    {
      separator: true,
      roles: ['profesor', 'chief_instructor']
    },
    {
      label: 'Dashboard',
      icon: Settings,
      action: () => navigate('/dashboard'),
      roles: ['profesor', 'chief_instructor']
    },
    {
      label: 'Estudiantes',
      icon: Users,
      action: () => navigate('/students'),
      roles: ['profesor', 'chief_instructor']
    },
    {
      label: 'Asistencias',
      icon: Calendar,
      action: () => navigate('/attendance'),
      roles: ['profesor', 'chief_instructor']
    },
    {
      label: 'Exámenes',
      icon: Award,
      action: () => navigate('/exams'),
      roles: ['profesor', 'chief_instructor']
    },
    {
      label: 'Material de Estudio',
      icon: BookOpen,
      action: () => navigate('/materials'),
      roles: ['profesor', 'chief_instructor']
    },
    {
      separator: true,
      roles: ['chief_instructor']
    },
    {
      label: 'Configuración del Dojo',
      icon: Settings,
      action: () => navigate('/settings'),
      roles: ['chief_instructor']
    },
    {
      label: 'Importar Datos',
      icon: Database,
      action: () => navigate('/import-data'),
      roles: ['chief_instructor']
    }
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user.role)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <img 
            src={user.photo || `https://via.placeholder.com/32x32/4F46E5/FFFFFF?text=${user.name.charAt(0)}`}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="hidden sm:inline-block">{user.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.grade.name} - {user.role === 'chief_instructor' ? 'Chief Instructor' : user.role === 'profesor' ? 'Profesor' : 'Estudiante'}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {filteredItems.map((item, index) => {
          if (item.separator) {
            return <DropdownMenuSeparator key={index} />;
          }
          
          const Icon = item.icon!;
          return (
            <DropdownMenuItem key={index} onClick={item.action}>
              <Icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}