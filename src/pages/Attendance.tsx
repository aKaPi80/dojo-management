import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, User, AttendanceRecord, getAttendanceValue, GRADES } from '@/types';
import { Calendar, Users, Save, Eye, Filter, CalendarDays, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Attendance() {
  const { user, getAllUsers, updateUser } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'register' | 'calendar'>('register');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState<'normal' | 'curso_nacional' | 'curso_internacional' | 'especial'>('normal');
  const [attendanceData, setAttendanceData] = useState<{[userId: string]: {present: boolean, notes: string}}>({});
  const [filterRole, setFilterRole] = useState<'all' | 'estudiante' | 'profesor'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');
  
  // Calendar view state
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendeesForDate, setAttendeesForDate] = useState<User[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
      navigate('/dashboard');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);

    loadUsers();
  }, [user, navigate]);

  useEffect(() => {
    applyFilters();
  }, [allUsers, filterRole, filterStatus]);

  useEffect(() => {
    if (viewMode === 'calendar') {
      loadAttendeesForDate();
    }
  }, [calendarDate, allUsers, viewMode]);

  const loadUsers = () => {
    const users = getAllUsers();
    setAllUsers(users);
    
    // Initialize attendance data
    const initialAttendance: {[userId: string]: {present: boolean, notes: string}} = {};
    users.forEach(u => {
      initialAttendance[u.id] = { present: false, notes: '' };
    });
    setAttendanceData(initialAttendance);
  };

  const applyFilters = () => {
    let filtered = allUsers;

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(u => u.isActive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(u => !u.isActive);
    }

    setFilteredUsers(filtered);
  };

  const loadAttendeesForDate = () => {
    const attendees = allUsers.filter(user => {
      const attendances = user.attendances || [];
      return attendances.some(att => att.date === calendarDate && att.present);
    });
    setAttendeesForDate(attendees);
  };

  // Calculate attendance since last exam or start
  const getAttendanceSinceLastExam = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return 0;

    const exams = user.exams || [];
    const attendances = user.attendances || [];
    
    if (exams.length === 0) {
      // No exams, count all attendances
      return attendances.filter(att => att.present).length;
    }

    // Find last exam date
    const lastExam = exams
      .filter(exam => exam.result === 'passed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastExam) {
      return attendances.filter(att => att.present).length;
    }

    // Count attendances after last exam
    const lastExamDate = new Date(lastExam.date);
    return attendances.filter(att => 
      att.present && new Date(att.date) > lastExamDate
    ).length;
  };

  // Calculate months since last exam or start
  const getMonthsSinceLastExam = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return 0;

    const exams = user.exams || [];
    
    if (exams.length === 0) {
      // No exams, calculate from join date
      const joinDate = new Date(user.joinDate);
      const now = new Date();
      return Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    }

    // Find last exam date
    const lastExam = exams
      .filter(exam => exam.result === 'passed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastExam) {
      const joinDate = new Date(user.joinDate);
      const now = new Date();
      return Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    }

    const lastExamDate = new Date(lastExam.date);
    const now = new Date();
    return Math.floor((now.getTime() - lastExamDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  };

  // Get next grade for user
  const getNextGrade = (user: User) => {
    const currentGrade = user.grade;
    const grades = currentGrade.category === 'niños' ? 
      GRADES.CHILDREN : 
      GRADES.ADULTS;
    
    const currentIndex = grades.findIndex(g => g.id === currentGrade.id);
    if (currentIndex === -1 || currentIndex === grades.length - 1) {
      return null; // No next grade
    }
    
    return grades[currentIndex + 1];
  };

  // Check if user is ready for next exam
  const isReadyForExam = (user: User) => {
    const nextGrade = getNextGrade(user);
    if (!nextGrade || !nextGrade.requirements) return false;

    const attendanceCount = getAttendanceSinceLastExam(user.id);
    const monthsCount = getMonthsSinceLastExam(user.id);

    return attendanceCount >= nextGrade.requirements.minAttendance && 
           monthsCount >= nextGrade.requirements.minMonths;
  };

  // Calculate next exam date (estimated)
  const getNextExamDate = (user: User) => {
    const nextGrade = getNextGrade(user);
    if (!nextGrade || !nextGrade.requirements) return null;

    const attendanceCount = getAttendanceSinceLastExam(user.id);
    const monthsCount = getMonthsSinceLastExam(user.id);

    const attendanceNeeded = Math.max(0, nextGrade.requirements.minAttendance - attendanceCount);
    const monthsNeeded = Math.max(0, nextGrade.requirements.minMonths - monthsCount);

    // Estimate based on months needed (assuming 2 classes per week)
    const weeksNeeded = Math.max(attendanceNeeded / 2, monthsNeeded * 4);
    const daysNeeded = weeksNeeded * 7;

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysNeeded);

    return estimatedDate.toISOString().split('T')[0];
  };

  const handleAttendanceChange = (userId: string, present: boolean) => {
    setAttendanceData(prev => ({
      ...prev,
      [userId]: { ...prev[userId], present }
    }));
  };

  const handleNotesChange = (userId: string, notes: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [userId]: { ...prev[userId], notes }
    }));
  };

  const handleSaveAttendance = async () => {
    setIsLoading(true);
    try {
      const attendanceValue = getAttendanceValue(sessionType);
      let updatedCount = 0;

      for (const userId in attendanceData) {
        const attendance = attendanceData[userId];
        if (attendance.present) {
          const user = allUsers.find(u => u.id === userId);
          if (user) {
            const newAttendanceRecord: AttendanceRecord = {
              id: `${userId}_${selectedDate}_${Date.now()}`,
              userId,
              date: selectedDate,
              present: true,
              notes: attendance.notes,
              sessionType,
              attendanceValue
            };

            const updatedAttendances = [...(user.attendances || []), newAttendanceRecord];
            
            // Calculate new attendance percentage
            const totalSessions = updatedAttendances.length;
            const presentSessions = updatedAttendances.filter(a => a.present).length;
            const newPercentage = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;

            const updatedUser: User = {
              ...user,
              attendances: updatedAttendances,
              attendancePercentage: newPercentage
            };

            await updateUser(updatedUser);
            updatedCount++;
          }
        }
      }

      toast.success(`Asistencia registrada para ${updatedCount} miembros`);
      
      // Reset form
      const resetAttendance: {[userId: string]: {present: boolean, notes: string}} = {};
      allUsers.forEach(u => {
        resetAttendance[u.id] = { present: false, notes: '' };
      });
      setAttendanceData(resetAttendance);
      
      // Reload users to get updated data
      loadUsers();
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Error al guardar la asistencia');
    } finally {
      setIsLoading(false);
    }
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
                  <p className="text-sm text-gray-500">Control de Asistencias</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'register' ? 'default' : 'outline'}
                onClick={() => setViewMode('register')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Registrar Asistencia
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                onClick={() => setViewMode('calendar')}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Historial por Fecha
              </Button>
            </div>
          </div>

          {viewMode === 'register' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Registrar Asistencia</span>
                </CardTitle>
                <CardDescription>
                  Marca la asistencia de los miembros para la fecha seleccionada
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Session Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha de la sesión</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionType">Tipo de sesión</Label>
                    <Select value={sessionType} onValueChange={(value: any) => setSessionType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Clase Normal (1x)</SelectItem>
                        <SelectItem value="especial">Clase Especial (2x)</SelectItem>
                        <SelectItem value="curso_nacional">Curso Nacional (3x)</SelectItem>
                        <SelectItem value="curso_internacional">Curso Internacional (6x)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Filtros</Label>
                    <div className="flex space-x-2">
                      <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los roles</SelectItem>
                          <SelectItem value="estudiante">Estudiantes</SelectItem>
                          <SelectItem value="profesor">Profesores</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="active">Activos</SelectItem>
                          <SelectItem value="inactive">Inactivos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Attendance List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Lista de Asistencia ({filteredUsers.length} miembros)</h3>
                  
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay miembros que coincidan con los filtros seleccionados
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredUsers.map((member) => {
                        const attendanceSinceExam = getAttendanceSinceLastExam(member.id);
                        const monthsSinceExam = getMonthsSinceLastExam(member.id);
                        const nextGrade = getNextGrade(member);
                        const readyForExam = isReadyForExam(member);
                        const nextExamDate = getNextExamDate(member);

                        return (
                          <div key={member.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                            <input
                              type="checkbox"
                              checked={attendanceData[member.id]?.present || false}
                              onChange={(e) => handleAttendanceChange(member.id, e.target.checked)}
                              className="h-4 w-4"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div>
                                  <h4 className="font-medium">{member.name}</h4>
                                  <p className="text-sm text-gray-500">@{member.username}</p>
                                </div>
                                <Badge variant="secondary">{member.grade.name}</Badge>
                                <Badge variant={
                                  member.role === 'chief_instructor' ? 'destructive' :
                                  member.role === 'profesor' ? 'default' : 'outline'
                                }>
                                  {member.role === 'chief_instructor' ? 'Chief' :
                                   member.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                                </Badge>
                              </div>
                              
                              {/* Exam Information */}
                              <div className="text-xs text-gray-600 space-y-1">
                                <div className="flex items-center space-x-4">
                                  <span>📊 {attendanceSinceExam} asistencias desde último examen</span>
                                  <span>📅 {monthsSinceExam} meses de entrenamiento</span>
                                </div>
                                {nextGrade && (
                                  <div className="flex items-center space-x-2">
                                    <span>🎯 Próximo grado: {nextGrade.name}</span>
                                    {readyForExam ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className={readyForExam ? 'text-green-600' : 'text-red-600'}>
                                      {readyForExam ? 'Listo para examen' : 'No cumple requisitos'}
                                    </span>
                                  </div>
                                )}
                                {nextExamDate && (
                                  <div>
                                    <span>📆 Fecha estimada próximo examen: {new Date(nextExamDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="w-48">
                              <textarea
                                placeholder="Notas (opcional)"
                                value={attendanceData[member.id]?.notes || ''}
                                onChange={(e) => handleNotesChange(member.id, e.target.value)}
                                className="w-full text-sm p-2 border rounded resize-none"
                                rows={2}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {filteredUsers.length > 0 && (
                  <div className="flex justify-end">
                    <Button onClick={handleSaveAttendance} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Guardando...' : 'Guardar Asistencia'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5" />
                  <span>Historial de Asistencias por Fecha</span>
                </CardTitle>
                <CardDescription>
                  Selecciona una fecha para ver quién asistió ese día
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Date Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="calendarDate">Seleccionar fecha</Label>
                    <Input
                      id="calendarDate"
                      type="date"
                      value={calendarDate}
                      onChange={(e) => setCalendarDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Attendees for selected date */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Asistentes del {new Date(calendarDate).toLocaleDateString()} ({attendeesForDate.length} personas)
                    </h3>
                    
                    {attendeesForDate.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No hay registros de asistencia para esta fecha
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Children Section */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Niños ({attendeesForDate.filter(u => u.grade.category === 'niños').length})
                          </h4>
                          <div className="space-y-2">
                            {attendeesForDate
                              .filter(user => user.grade.category === 'niños')
                              .map((member) => {
                                const attendanceSinceExam = getAttendanceSinceLastExam(member.id);
                                const monthsSinceExam = getMonthsSinceLastExam(member.id);
                                const nextGrade = getNextGrade(member);
                                const readyForExam = isReadyForExam(member);
                                const nextExamDate = getNextExamDate(member);

                                return (
                                  <div key={member.id} className="p-3 border rounded-lg bg-blue-50">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium">{member.name}</h5>
                                      <Badge variant="secondary">{member.grade.name}</Badge>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <div>📊 {attendanceSinceExam} asistencias • 📅 {monthsSinceExam} meses</div>
                                      {nextGrade && (
                                        <div className="flex items-center space-x-1">
                                          <span>🎯 Próximo: {nextGrade.name}</span>
                                          {readyForExam ? (
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <XCircle className="h-3 w-3 text-red-500" />
                                          )}
                                        </div>
                                      )}
                                      {nextExamDate && (
                                        <div>📆 Próximo examen: {new Date(nextExamDate).toLocaleDateString()}</div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Adults Section */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Adultos ({attendeesForDate.filter(u => u.grade.category === 'adultos').length})
                          </h4>
                          <div className="space-y-2">
                            {attendeesForDate
                              .filter(user => user.grade.category === 'adultos')
                              .map((member) => {
                                const attendanceSinceExam = getAttendanceSinceLastExam(member.id);
                                const monthsSinceExam = getMonthsSinceLastExam(member.id);
                                const nextGrade = getNextGrade(member);
                                const readyForExam = isReadyForExam(member);
                                const nextExamDate = getNextExamDate(member);

                                return (
                                  <div key={member.id} className="p-3 border rounded-lg bg-green-50">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <h5 className="font-medium">{member.name}</h5>
                                        <Badge variant={
                                          member.role === 'chief_instructor' ? 'destructive' :
                                          member.role === 'profesor' ? 'default' : 'outline'
                                        } className="text-xs">
                                          {member.role === 'chief_instructor' ? 'Chief' :
                                           member.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                                        </Badge>
                                      </div>
                                      <Badge variant="secondary">{member.grade.name}</Badge>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <div>📊 {attendanceSinceExam} asistencias • 📅 {monthsSinceExam} meses</div>
                                      {nextGrade && (
                                        <div className="flex items-center space-x-1">
                                          <span>🎯 Próximo: {nextGrade.name}</span>
                                          {readyForExam ? (
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <XCircle className="h-3 w-3 text-red-500" />
                                          )}
                                        </div>
                                      )}
                                      {nextExamDate && (
                                        <div>📆 Próximo examen: {new Date(nextExamDate).toLocaleDateString()}</div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}