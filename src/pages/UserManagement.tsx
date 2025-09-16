import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Shield } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function UserManagement() {
  const { user } = useAuth();

  // Only professors and chief instructors can access this page
  if (user?.role === 'estudiante') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Solo los profesores y el Chief Instructor pueden acceder a esta sección.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <Users className="h-8 w-8 text-blue-600" />
          <span>Gestión de Usuarios</span>
        </h1>
        <p className="text-gray-600">Administra los miembros del dojo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Panel de Gestión</CardTitle>
          <CardDescription>
            Esta funcionalidad está en desarrollo. Pronto podrás gestionar todos los usuarios del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Funcionalidad próximamente</p>
            <p className="text-sm text-gray-400">
              Aquí podrás ver y gestionar todos los usuarios del dojo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}