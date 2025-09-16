import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Crown, 
  LogOut, 
  Home,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isInstructor = user.role === 'chief_instructor' || user.role === 'profesor';

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true
    },
    {
      name: 'Materiales',
      href: '/materials',
      icon: BookOpen,
      show: true
    },
    {
      name: 'Miembros',
      href: '/members',
      icon: Users,
      show: isInstructor
    },
    {
      name: 'Asistencias',
      href: '/attendance',
      icon: Calendar,
      show: isInstructor
    },
    {
      name: 'Profesores',
      href: '/professors',
      icon: Crown,
      show: user.role === 'chief_instructor'
    }
  ];

  const visibleItems = navigationItems.filter(item => item.show);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Crown className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-sm font-semibold text-gray-900">SKBC Gipuzkoa</h1>
            <p className="text-xs text-gray-500 truncate max-w-32">{user.name}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={closeMobileMenu}>
          <div 
            className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="p-4 border-b bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">SKBC Gipuzkoa</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMobileMenu}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">
                  {user.role === 'chief_instructor' ? 'Chief Instructor' :
                   user.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                </p>
                <p className="text-xs text-gray-500">{user.grade.name}</p>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="p-4 space-y-2">
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white shadow-sm border-r">
          {/* Desktop Header */}
          <div className="flex items-center px-6 py-4 border-b">
            <Crown className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">SKBC Gipuzkoa</h1>
              <p className="text-sm text-gray-600">Shorinji Kempo</p>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">
                  {user.role === 'chief_instructor' ? 'Chief Instructor' :
                   user.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                </p>
                <p className="text-xs text-gray-500">{user.grade.name}</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Logout */}
          <div className="px-4 py-4 border-t">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}