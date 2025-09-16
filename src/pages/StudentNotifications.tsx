import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Notification } from '@/types';

export default function StudentNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'exam' | 'course'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const allNotifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    const myNotifications = allNotifications
      .filter(n => n.targetRole === 'all' || n.targetRole === 'estudiante')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setNotifications(myNotifications);
  };

  const markAsRead = (notificationId: string) => {
    const allNotifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = allNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    loadNotifications();
  };

  const markAllAsRead = () => {
    const allNotifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = allNotifications.map(n => 
      (n.targetRole === 'all' || n.targetRole === 'estudiante') ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    loadNotifications();
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'exam':
        return notifications.filter(n => n.type === 'exam');
      case 'course':
        return notifications.filter(n => n.type === 'course');
      default:
        return notifications;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return <GraduationCap className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'announcement': return <Bell className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'announcement': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exam': return 'Examen';
      case 'course': return 'Curso';
      case 'announcement': return 'Anuncio';
      default: return 'General';
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Notificaciones</h1>
          <p className="text-gray-600">Mantente al día con las novedades del dojo</p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar todas como leídas ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Sin leer ({unreadCount})
        </Button>
        <Button
          variant={filter === 'exam' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('exam')}
        >
          <GraduationCap className="h-3 w-3 mr-1" />
          Exámenes
        </Button>
        <Button
          variant={filter === 'course' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('course')}
        >
          <BookOpen className="h-3 w-3 mr-1" />
          Cursos
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`${!notification.read ? 'border-blue-200 bg-blue-50/30' : ''} transition-all hover:shadow-md`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(notification.type)}
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <CardDescription>
                    {new Date(notification.date).toLocaleDateString()} a las{' '}
                    {new Date(notification.date).toLocaleTimeString()}
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(notification.type)}>
                    {getTypeLabel(notification.type)}
                  </Badge>
                  {!notification.read && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{notification.message}</p>
              
              {notification.type === 'exam' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Información importante sobre examen
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Asegúrate de prepararte adecuadamente y confirmar tu asistencia.
                  </p>
                </div>
              )}
              
              {notification.type === 'course' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Nuevo curso disponible
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Consulta con tu instructor para más detalles sobre inscripción.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'all' ? 'No hay notificaciones' : 
                 filter === 'unread' ? 'No hay notificaciones sin leer' :
                 `No hay notificaciones de ${filter === 'exam' ? 'exámenes' : 'cursos'}`}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Las nuevas notificaciones aparecerán aquí
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}