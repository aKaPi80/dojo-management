import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bell, 
  Plus, 
  Send, 
  Users, 
  User, 
  GraduationCap,
  Mail,
  MessageSquare,
  Calendar,
  Trash2
} from 'lucide-react';
import { Notification, User as UserType } from '@/types';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    targetRole: 'all' as 'all' | 'profesor' | 'estudiante' | 'adultos' | 'niños',
    type: 'general' as 'general' | 'announcement' | 'course' | 'exam'
  });

  useEffect(() => {
    loadNotifications();
    loadUsers();
  }, []);

  const loadNotifications = () => {
    const stored: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    // Mostrar solo notificaciones enviadas por profesores o del sistema
    const professorNotifications = stored.filter(n => 
      n.type !== 'student-message' || n.fromUserId === user?.id
    );
    setNotifications(professorNotifications.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const loadUsers = () => {
    const allUsers: UserType[] = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(allUsers.filter(u => u.active));
  };

  const handleSendNotification = () => {
    if (!notificationData.title || !notificationData.message) {
      toast.error('Por favor completa el título y mensaje');
      return;
    }

    const newNotifications: Notification[] = [];

    if (selectedUsers.length > 0) {
      // Enviar a usuarios específicos
      selectedUsers.forEach(userId => {
        const notification: Notification = {
          id: `${Date.now()}-${userId}`,
          title: notificationData.title,
          message: notificationData.message,
          date: new Date().toISOString().split('T')[0],
          targetRole: 'estudiante',
          targetUserId: userId,
          fromUserId: user?.id,
          type: notificationData.type,
          read: false,
          emailSent: false
        };
        newNotifications.push(notification);
      });
    } else {
      // Enviar por rol/categoría
      const notification: Notification = {
        id: Date.now().toString(),
        title: notificationData.title,
        message: notificationData.message,
        date: new Date().toISOString().split('T')[0],
        targetRole: notificationData.targetRole,
        fromUserId: user?.id,
        type: notificationData.type,
        read: false,
        emailSent: false
      };
      newNotifications.push(notification);
    }

    const existingNotifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = [...existingNotifications, ...newNotifications];
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

    loadNotifications();
    resetForm();
    setIsDialogOpen(false);
    
    toast.success(`Notificación enviada a ${selectedUsers.length > 0 ? selectedUsers.length + ' usuario(s)' : getTargetDescription()}`);
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      const existingNotifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = existingNotifications.filter(n => n.id !== notificationId);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      loadNotifications();
      toast.success('Notificación eliminada');
    }
  };

  const resetForm = () => {
    setNotificationData({
      title: '',
      message: '',
      targetRole: 'all',
      type: 'general'
    });
    setSelectedUsers([]);
  };

  const getTargetDescription = () => {
    switch (notificationData.targetRole) {
      case 'all': return 'todos los miembros';
      case 'profesor': return 'todos los profesores';
      case 'estudiante': return 'todos los estudiantes';
      case 'adultos': return 'estudiantes adultos';
      case 'niños': return 'estudiantes niños';
      default: return 'destinatarios seleccionados';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'exam': return <GraduationCap className="h-4 w-4" />;
      case 'course': return <Calendar className="h-4 w-4" />;
      case 'announcement': return <Bell className="h-4 w-4" />;
      case 'student-message': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-orange-100 text-orange-800';
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'announcement': return 'bg-purple-100 text-purple-800';
      case 'student-message': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exam': return 'Examen';
      case 'course': return 'Curso';
      case 'announcement': return 'Anuncio';
      case 'student-message': return 'Mensaje de Estudiante';
      default: return 'General';
    }
  };

  const getTargetLabel = (notification: Notification) => {
    if (notification.targetUserId) {
      const targetUser = users.find(u => u.id === notification.targetUserId);
      return targetUser ? `${targetUser.name}` : 'Usuario específico';
    }
    
    switch (notification.targetRole) {
      case 'all': return 'Todos';
      case 'profesor': return 'Profesores';
      case 'estudiante': return 'Estudiantes';
      case 'adultos': return 'Adultos';
      case 'niños': return 'Niños';
      default: return notification.targetRole;
    }
  };

  const filteredUsers = users.filter(u => {
    if (notificationData.targetRole === 'profesor') {
      return u.role === 'profesor';
    } else if (notificationData.targetRole === 'estudiante') {
      return u.role === 'estudiante';
    } else if (notificationData.targetRole === 'adultos') {
      return u.role === 'estudiante' && u.category === 'adultos';
    } else if (notificationData.targetRole === 'niños') {
      return u.role === 'estudiante' && u.category === 'niños';
    }
    return true;
  });

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers.map(u => u.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Notificaciones</h1>
          <p className="text-gray-600">Gestiona las comunicaciones del dojo</p>
          <p className="text-sm text-gray-500 mt-1">
            Envía notificaciones por email y dentro de la aplicación
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Notificación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enviar Notificación</DialogTitle>
              <DialogDescription>
                Crea y envía una notificación a los miembros del dojo
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={notificationData.title}
                    onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                    placeholder="Asunto de la notificación"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de notificación</Label>
                  <Select 
                    value={notificationData.type} 
                    onValueChange={(value: 'general' | 'announcement' | 'course' | 'exam') => 
                      setNotificationData({...notificationData, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="announcement">Anuncio Importante</SelectItem>
                      <SelectItem value="course">Curso/Evento</SelectItem>
                      <SelectItem value="exam">Relacionado con Exámenes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje *</Label>
                <Textarea
                  id="message"
                  value={notificationData.message}
                  onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                  placeholder="Contenido de la notificación..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Destinatarios</Label>
                <Select 
                  value={notificationData.targetRole} 
                  onValueChange={(value: 'all' | 'profesor' | 'estudiante' | 'adultos' | 'niños') => {
                    setNotificationData({...notificationData, targetRole: value});
                    setSelectedUsers([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los miembros</SelectItem>
                    <SelectItem value="profesor">Solo profesores</SelectItem>
                    <SelectItem value="estudiante">Todos los estudiantes</SelectItem>
                    <SelectItem value="adultos">Solo estudiantes adultos</SelectItem>
                    <SelectItem value="niños">Solo estudiantes niños</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Selección individual de usuarios */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Selección individual (opcional)</Label>
                  <div className="space-x-2">
                    <Button size="sm" variant="outline" onClick={selectAllUsers}>
                      Seleccionar todos
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearSelection}>
                      Limpiar selección
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg max-h-48 overflow-y-auto p-3">
                  <div className="grid grid-cols-1 gap-2">
                    {filteredUsers.map((targetUser) => (
                      <div key={targetUser.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${targetUser.id}`}
                          checked={selectedUsers.includes(targetUser.id)}
                          onCheckedChange={(checked) => handleUserSelection(targetUser.id, checked as boolean)}
                        />
                        <Label htmlFor={`user-${targetUser.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span>{targetUser.name}</span>
                            <div className="flex items-center space-x-1">
                              <Badge variant="outline" className="text-xs">
                                {targetUser.role === 'profesor' ? 'Sensei' : targetUser.grade.name}
                              </Badge>
                              {targetUser.role === 'estudiante' && (
                                <Badge variant="secondary" className="text-xs">
                                  {targetUser.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedUsers.length > 0 && (
                  <p className="text-sm text-blue-600">
                    {selectedUsers.length} usuario(s) seleccionado(s)
                  </p>
                )}
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Información de envío</span>
                </div>
                <p className="text-blue-700">
                  La notificación se enviará por email y aparecerá en la aplicación.
                  {selectedUsers.length > 0 
                    ? ` Se enviará a ${selectedUsers.length} usuario(s) seleccionado(s).`
                    : ` Se enviará a: ${getTargetDescription()}.`
                  }
                </p>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSendNotification} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Notificación
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notificaciones</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              Enviadas por el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {notifications.filter(n => {
                const notificationDate = new Date(n.date);
                const now = new Date();
                return notificationDate.getMonth() === now.getMonth() && 
                       notificationDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Notificaciones enviadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Pueden recibir notificaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes de Estudiantes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {notifications.filter(n => n.type === 'student-message').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Recibidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Notificaciones</CardTitle>
          <CardDescription>
            Notificaciones enviadas y mensajes recibidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const fromUser = notification.fromUserId 
                  ? users.find(u => u.id === notification.fromUserId)
                  : null;
                
                return (
                  <div key={notification.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium truncate">{notification.title}</h4>
                          <Badge className={getNotificationBadgeColor(notification.type)}>
                            {getTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>📅 {new Date(notification.date).toLocaleDateString()}</span>
                          <span>👥 {getTargetLabel(notification)}</span>
                          {fromUser && (
                            <span>👤 De: {fromUser.name}</span>
                          )}
                          {notification.emailSent && (
                            <span className="text-green-600">✉️ Email enviado</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay notificaciones</p>
              <p className="text-sm text-gray-400">
                Las notificaciones enviadas aparecerán aquí
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}