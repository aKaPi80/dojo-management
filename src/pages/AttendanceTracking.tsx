import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Calendar, Users, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { User, AttendanceRecord } from '@/types';

export default function AttendanceTracking() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: { present: boolean; notes: string } }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'adultos' | 'niños'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [existingRecords, setExistingRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    loadStudents();
    loadAttendanceRecords();
  }, [selectedDate]);

  const loadStudents = () => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const studentList = users.filter((u: User) => u.role === 'estudiante' && u.isActive);
      setStudents(studentList);
      
      // Initialize attendance state
      const initialAttendance: { [key: string]: { present: boolean; notes: string } } = {};
      studentList.forEach((student: User) => {
        initialAttendance[student.id] = { present: false, notes: '' };
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Error al cargar estudiantes');
    }
  };

  const loadAttendanceRecords = () => {
    try {
      const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      const dateRecords = records.filter((record: AttendanceRecord) => 
        record.date === selectedDate
      );
      setExistingRecords(dateRecords);

      // Update attendance state with existing records
      const updatedAttendance = { ...attendance };
      dateRecords.forEach((record: AttendanceRecord) => {
        updatedAttendance[record.userId] = {
          present: record.present,
          notes: record.notes || ''
        };
      });
      setAttendance(updatedAttendance);
    } catch (error) {
      console.error('Error loading attendance records:', error);
    }
  };

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        present
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const saveAttendance = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      
      // Remove existing records for this date
      const filteredRecords = records.filter((record: AttendanceRecord) => 
        record.date !== selectedDate
      );

      // Add new records
      const newRecords: AttendanceRecord[] = [];
      Object.entries(attendance).forEach(([studentId, data]) => {
        newRecords.push({
          id: `${studentId}-${selectedDate}-${Date.now()}`,
          userId: studentId,
          date: selectedDate,
          present: data.present,
          notes: data.notes,
          recordedBy: user.id
        });
      });

      const updatedRecords = [...filteredRecords, ...newRecords];
      localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));

      // Update attendance percentages
      updateAttendancePercentages();

      toast.success('Asistencia guardada correctamente');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Error al guardar la asistencia');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAttendancePercentages = () => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');

      const updatedUsers = users.map((user: User) => {
        if (user.role === 'estudiante') {
          const userRecords = records.filter((record: AttendanceRecord) => record.userId === user.id);
          const totalClasses = userRecords.length;
          const attendedClasses = userRecords.filter((record: AttendanceRecord) => record.present).length;
          
          const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
          
          return {
            ...user,
            attendancePercentage: percentage
          };
        }
        return user;
      });

      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error updating attendance percentages:', error);
    }
  };

  const markAllPresent = () => {
    const updatedAttendance = { ...attendance };
    filteredStudents.forEach(student => {
      updatedAttendance[student.id] = {
        ...updatedAttendance[student.id],
        present: true
      };
    });
    setAttendance(updatedAttendance);
  };

  const markAllAbsent = () => {
    const updatedAttendance = { ...attendance };
    filteredStudents.forEach(student => {
      updatedAttendance[student.id] = {
        ...updatedAttendance[student.id],
        present: false
      };
    });
    setAttendance(updatedAttendance);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || student.grade.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const presentCount = Object.values(attendance).filter(a => a.present).length;
  const totalCount = filteredStudents.length;

  if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Registro de Asistencias
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Registra la asistencia de los estudiantes para cada clase
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Configuración de Clase</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm">Fecha de la clase</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm">Buscar estudiante</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nombre o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Filtrar por categoría</Label>
              <Select value={filterCategory} onValueChange={(value: 'all' | 'adultos' | 'niños') => setFilterCategory(value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="adultos">Adultos</SelectItem>
                  <SelectItem value="niños">Niños</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Acciones rápidas</Label>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllPresent}
                  className="flex-1 text-xs"
                >
                  Todos Presentes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAbsent}
                  className="flex-1 text-xs"
                >
                  Todos Ausentes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Estudiantes</p>
                <p className="text-xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Presentes</p>
                <p className="text-xl font-bold text-green-600">{presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Ausentes</p>
                <p className="text-xl font-bold text-red-600">{totalCount - presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Asistencia</CardTitle>
          <CardDescription>
            Marca la asistencia de cada estudiante y añade notas si es necesario
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron estudiantes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={attendance[student.id]?.present || false}
                        onCheckedChange={(checked) => 
                          handleAttendanceChange(student.id, checked as boolean)
                        }
                      />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>@{student.username}</span>
                          <Badge variant="outline" className="text-xs">
                            {student.grade.name}
                          </Badge>
                          <Badge 
                            variant={student.grade.category === 'adultos' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {student.grade.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {attendance[student.id]?.present ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Presente
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Ausente
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${student.id}`} className="text-sm">
                      Notas (opcional)
                    </Label>
                    <Textarea
                      id={`notes-${student.id}`}
                      placeholder="Añade notas sobre la asistencia o rendimiento..."
                      value={attendance[student.id]?.notes || ''}
                      onChange={(e) => handleNotesChange(student.id, e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredStudents.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={saveAttendance} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Guardar Asistencia
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}