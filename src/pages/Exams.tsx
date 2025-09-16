import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, User, ExamRecord, GRADES } from '@/types';
import { Calendar, Award, Save, Eye, Filter, CheckCircle, XCircle, Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function Exams() {
  const { user, getAllUsers, updateUser } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'register' | 'history'>('register');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<'all' | 'estudiante' | 'profesor'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');
  
  // Exam registration form
  const [examForm, setExamForm] = useState({
    date: new Date().toISOString().split('T')[0],
    location: '',
    examiner: '',
    notes: '',
    selectedStudents: [] as string[]
  });

  // Exam results for each student
  const [examResults, setExamResults] = useState<{[userId: string]: {
    result: 'passed' | 'failed' | 'pending',
    newGradeId: string,
    notes: string
  }}>({});

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

  const loadUsers = () => {
    const users = getAllUsers();
    setAllUsers(users);
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

  // Get next grade for a user
  const getNextGrade = (user: User) => {
    const currentGrade = user.grade;
    const grades = currentGrade.category === 'niños' ? GRADES.CHILDREN : GRADES.ADULTS;
    
    const currentIndex = grades.findIndex(g => g.id === currentGrade.id);
    if (currentIndex === -1 || currentIndex === grades.length - 1) {
      return null; // No next grade
    }
    
    return grades[currentIndex + 1];
  };

  // Handle student selection for exam
  const handleStudentSelection = (userId: string, selected: boolean) => {
    if (selected) {
      setExamForm(prev => ({
        ...prev,
        selectedStudents: [...prev.selectedStudents, userId]
      }));
      
      // Initialize exam result for this student
      const user = allUsers.find(u => u.id === userId);
      if (user) {
        const nextGrade = getNextGrade(user);
        setExamResults(prev => ({
          ...prev,
          [userId]: {
            result: 'pending',
            newGradeId: nextGrade?.id || user.grade.id,
            notes: ''
          }
        }));
      }
    } else {
      setExamForm(prev => ({
        ...prev,
        selectedStudents: prev.selectedStudents.filter(id => id !== userId)
      }));
      
      // Remove exam result for this student
      setExamResults(prev => {
        const newResults = { ...prev };
        delete newResults[userId];
        return newResults;
      });
    }
  };

  // Handle exam result change
  const handleExamResultChange = (userId: string, field: string, value: string) => {
    setExamResults(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  // Submit exam registration
  const handleSubmitExam = async () => {
    if (examForm.selectedStudents.length === 0) {
      toast.error('Selecciona al menos un estudiante para el examen');
      return;
    }

    if (!examForm.date || !examForm.location || !examForm.examiner) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      let updatedCount = 0;

      for (const userId of examForm.selectedStudents) {
        const user = allUsers.find(u => u.id === userId);
        const result = examResults[userId];
        
        if (user && result) {
          const examRecord: ExamRecord = {
            id: `${userId}_${examForm.date}_${Date.now()}`,
            userId,
            date: examForm.date,
            location: examForm.location,
            examiner: examForm.examiner,
            previousGrade: user.grade,
            newGrade: result.result === 'passed' ? 
              [...GRADES.CHILDREN, ...GRADES.ADULTS].find(g => g.id === result.newGradeId) || user.grade :
              user.grade,
            result: result.result as 'passed' | 'failed',
            notes: result.notes,
            examinerNotes: examForm.notes
          };

          // Update user with exam record
          const updatedExams = [...(user.exams || []), examRecord];
          
          let updatedUser: User = {
            ...user,
            exams: updatedExams
          };

          // If exam passed, update grade and reset attendance counter
          if (result.result === 'passed') {
            const newGrade = [...GRADES.CHILDREN, ...GRADES.ADULTS].find(g => g.id === result.newGradeId);
            if (newGrade) {
              updatedUser = {
                ...updatedUser,
                grade: newGrade,
                lastExamDate: examForm.date
              };
            }
          }

          await updateUser(updatedUser);
          updatedCount++;
        }
      }

      toast.success(`Examen registrado para ${updatedCount} estudiantes`);
      
      // Reset form
      setExamForm({
        date: new Date().toISOString().split('T')[0],
        location: '',
        examiner: '',
        notes: '',
        selectedStudents: []
      });
      setExamResults({});
      
      // Reload users
      loadUsers();
      
    } catch (error) {
      console.error('Error registering exam:', error);
      toast.error('Error al registrar el examen');
    } finally {
      setIsLoading(false);
    }
  };

  // Get all exam history
  const getAllExamHistory = () => {
    const allExams: (ExamRecord & { studentName: string })[] = [];
    
    allUsers.forEach(user => {
      if (user.exams) {
        user.exams.forEach(exam => {
          allExams.push({
            ...exam,
            studentName: user.name
          });
        });
      }
    });

    return allExams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
    return null;
  }

  const examHistory = getAllExamHistory();

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
                  <p className="text-sm text-gray-500">Gestión de Exámenes</p>
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
                <Plus className="h-4 w-4 mr-2" />
                Registrar Examen
              </Button>
              <Button
                variant={viewMode === 'history' ? 'default' : 'outline'}
                onClick={() => setViewMode('history')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Historial de Exámenes
              </Button>
            </div>
          </div>

          {viewMode === 'register' ? (
            <div className="space-y-6">
              {/* Exam Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Detalles del Examen</span>
                  </CardTitle>
                  <CardDescription>
                    Configura la información general del examen
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="examDate">Fecha del Examen *</Label>
                      <Input
                        id="examDate"
                        type="date"
                        value={examForm.date}
                        onChange={(e) => setExamForm(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Lugar del Examen *</Label>
                      <Input
                        id="location"
                        value={examForm.location}
                        onChange={(e) => setExamForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Dojo Principal, Gimnasio, etc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="examiner">Examinador *</Label>
                      <Input
                        id="examiner"
                        value={examForm.examiner}
                        onChange={(e) => setExamForm(prev => ({ ...prev, examiner: e.target.value }))}
                        placeholder="Nombre del examinador"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examNotes">Notas del Examen</Label>
                    <Textarea
                      id="examNotes"
                      value={examForm.notes}
                      onChange={(e) => setExamForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Observaciones generales del examen..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Student Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Seleccionar Estudiantes</CardTitle>
                  <CardDescription>
                    Elige los estudiantes que participarán en el examen
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="flex space-x-4 items-center">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los roles</SelectItem>
                        <SelectItem value="estudiante">Estudiantes</SelectItem>
                        <SelectItem value="profesor">Profesores</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Student List */}
                  <div className="space-y-3">
                    {filteredUsers.map((member) => {
                      const isSelected = examForm.selectedStudents.includes(member.id);
                      const nextGrade = getNextGrade(member);
                      const result = examResults[member.id];

                      return (
                        <div key={member.id} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-4 mb-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleStudentSelection(member.id, e.target.checked)}
                              className="h-4 w-4"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-medium">{member.name}</h4>
                                <Badge variant="secondary">{member.grade.name}</Badge>
                                <Badge variant={
                                  member.role === 'chief_instructor' ? 'destructive' :
                                  member.role === 'profesor' ? 'default' : 'outline'
                                }>
                                  {member.role === 'chief_instructor' ? 'Chief' :
                                   member.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                                </Badge>
                                {nextGrade && (
                                  <Badge variant="outline" className="text-blue-600">
                                    Próximo: {nextGrade.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Exam Result Form (only if selected) */}
                          {isSelected && result && (
                            <div className="ml-8 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                              <div className="space-y-2">
                                <Label>Resultado</Label>
                                <Select 
                                  value={result.result} 
                                  onValueChange={(value) => handleExamResultChange(member.id, 'result', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pendiente</SelectItem>
                                    <SelectItem value="passed">Aprobado</SelectItem>
                                    <SelectItem value="failed">Reprobado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {result.result === 'passed' && (
                                <div className="space-y-2">
                                  <Label>Nuevo Grado</Label>
                                  <Select 
                                    value={result.newGradeId} 
                                    onValueChange={(value) => handleExamResultChange(member.id, 'newGradeId', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(member.grade.category === 'niños' ? GRADES.CHILDREN : GRADES.ADULTS).map((grade) => (
                                        <SelectItem key={grade.id} value={grade.id}>
                                          {grade.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label>Notas del Estudiante</Label>
                                <Input
                                  value={result.notes}
                                  onChange={(e) => handleExamResultChange(member.id, 'notes', e.target.value)}
                                  placeholder="Observaciones específicas..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {examForm.selectedStudents.length > 0 && (
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSubmitExam} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Registrando...' : `Registrar Examen (${examForm.selectedStudents.length} estudiantes)`}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Exam History */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Historial de Exámenes</span>
                </CardTitle>
                <CardDescription>
                  Registro completo de todos los exámenes realizados
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {examHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay exámenes registrados
                  </div>
                ) : (
                  <div className="space-y-4">
                    {examHistory.map((exam) => (
                      <div key={exam.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium">{exam.studentName}</h4>
                            <Badge variant="secondary">{new Date(exam.date).toLocaleDateString()}</Badge>
                            <Badge variant={exam.result === 'passed' ? 'default' : 'destructive'}>
                              {exam.result === 'passed' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {exam.result === 'passed' ? 'Aprobado' : 'Reprobado'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {exam.location} • {exam.examiner}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Grado anterior:</span> {exam.previousGrade.name}
                          </div>
                          <div>
                            <span className="font-medium">Grado nuevo:</span> {exam.newGrade.name}
                          </div>
                          {exam.notes && (
                            <div className="md:col-span-2">
                              <span className="font-medium">Notas:</span> {exam.notes}
                            </div>
                          )}
                          {exam.examinerNotes && (
                            <div className="md:col-span-2">
                              <span className="font-medium">Observaciones del examinador:</span> {exam.examinerNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}