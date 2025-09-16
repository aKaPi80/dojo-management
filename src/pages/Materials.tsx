import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, GRADES } from '@/types';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Download, 
  ExternalLink,
  Award,
  Users,
  Clock,
  Plus,
  Trash2,
  Edit,
  Upload,
  Link,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Material {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'link' | 'file';
  url: string;
  duration?: string;
  targetAudience: 'todos' | 'profesores' | 'estudiantes';
  category: 'todos' | 'niños' | 'adultos';
  specificGrades: string[];
  createdBy: string;
  createdAt: string;
}

export default function Materials() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    title: '',
    description: '',
    type: 'video',
    url: '',
    duration: '',
    targetAudience: 'todos',
    category: 'todos',
    specificGrades: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);

    // Load materials from localStorage
    const savedMaterials = localStorage.getItem('materials');
    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    }
  }, [user, navigate]);

  const saveMaterials = (updatedMaterials: Material[]) => {
    setMaterials(updatedMaterials);
    localStorage.setItem('materials', JSON.stringify(updatedMaterials));
  };

  const handleGradeSelection = (gradeId: string, checked: boolean) => {
    setNewMaterial(prev => ({
      ...prev,
      specificGrades: checked 
        ? [...(prev.specificGrades || []), gradeId]
        : (prev.specificGrades || []).filter(id => id !== gradeId)
    }));
  };

  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.url) {
      toast.error('Por favor completa el título y la URL');
      return;
    }

    const material: Material = {
      id: `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newMaterial.title!,
      description: newMaterial.description || '',
      type: newMaterial.type!,
      url: newMaterial.url!,
      duration: newMaterial.duration,
      targetAudience: newMaterial.targetAudience!,
      category: newMaterial.category!,
      specificGrades: newMaterial.specificGrades || [],
      createdBy: user?.id || '',
      createdAt: new Date().toISOString()
    };

    const updatedMaterials = [...materials, material];
    saveMaterials(updatedMaterials);

    // Reset form
    setNewMaterial({
      title: '',
      description: '',
      type: 'video',
      url: '',
      duration: '',
      targetAudience: 'todos',
      category: 'todos',
      specificGrades: []
    });
    setIsAddingMaterial(false);
    toast.success('Material agregado exitosamente');
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este material?')) {
      const updatedMaterials = materials.filter(m => m.id !== materialId);
      saveMaterials(updatedMaterials);
      toast.success('Material eliminado');
    }
  };

  const canUserAccessMaterial = (material: Material) => {
    if (!user) return false;

    // Check target audience
    if (material.targetAudience === 'profesores' && user.role === 'estudiante') {
      return false;
    }

    // Check category
    if (material.category !== 'todos') {
      const userGradeCategory = user.grade.category;
      if (material.category !== userGradeCategory) {
        return false;
      }
    }

    // Check specific grades
    if (material.specificGrades.length > 0 && !material.specificGrades.includes(user.grade.id)) {
      return false;
    }

    return true;
  };

  const canUserManageMaterials = () => {
    return user && (user.role === 'chief_instructor' || user.role === 'profesor');
  };

  const filteredMaterials = materials.filter(canUserAccessMaterial);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5 text-red-600" />;
      case 'document': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'link': return <Link className="h-5 w-5 text-green-600" />;
      case 'file': return <Upload className="h-5 w-5 text-purple-600" />;
      default: return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'profesores': return <Badge variant="destructive">Profesores</Badge>;
      case 'estudiantes': return <Badge variant="secondary">Estudiantes</Badge>;
      default: return <Badge variant="outline">Todos</Badge>;
    }
  };

  const getGradeName = (gradeId: string) => {
    const allGrades = [...GRADES.CHILDREN, ...GRADES.ADULTS];
    const grade = allGrades.find(g => g.id === gradeId);
    return grade ? grade.name : gradeId;
  };

  if (!user) {
    return null;
  }

  const availableGrades = newMaterial.category === 'niños' ? GRADES.CHILDREN :
                         newMaterial.category === 'adultos' ? GRADES.ADULTS :
                         [...GRADES.CHILDREN, ...GRADES.ADULTS];

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
                  <p className="text-sm text-gray-500">Material de Estudio</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* User Grade Info */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Award className="h-12 w-12 text-blue-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">{user.grade.name}</Badge>
                      <Badge variant="outline">{user.grade.beltColor}</Badge>
                      {user.role !== 'estudiante' && (
                        <Badge variant="destructive">{user.role === 'chief_instructor' ? 'Chief Instructor' : 'Profesor'}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {canUserManageMaterials() && (
                  <Button onClick={() => setIsAddingMaterial(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Material
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add Material Modal */}
          {isAddingMaterial && (
            <Card className="mb-8 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Agregar Nuevo Material</span>
                </CardTitle>
                <CardDescription>
                  Sube videos, documentos, enlaces y archivos para tus estudiantes
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nombre del material"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Material</Label>
                    <Select 
                      value={newMaterial.type} 
                      onValueChange={(value) => setNewMaterial(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="document">Documento</SelectItem>
                        <SelectItem value="link">Enlace</SelectItem>
                        <SelectItem value="file">Archivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">URL o Enlace *</Label>
                    <Input
                      id="url"
                      value={newMaterial.url}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://ejemplo.com/video.mp4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración (opcional)</Label>
                    <Input
                      id="duration"
                      value={newMaterial.duration}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="15 min"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">Audiencia</Label>
                    <Select 
                      value={newMaterial.targetAudience} 
                      onValueChange={(value) => setNewMaterial(prev => ({ ...prev, targetAudience: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="estudiantes">Solo Estudiantes</SelectItem>
                        <SelectItem value="profesores">Solo Profesores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select 
                      value={newMaterial.category} 
                      onValueChange={(value) => setNewMaterial(prev => ({ ...prev, category: value as any, specificGrades: [] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas las edades</SelectItem>
                        <SelectItem value="niños">Solo Niños</SelectItem>
                        <SelectItem value="adultos">Solo Adultos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe el contenido del material..."
                    rows={3}
                  />
                </div>

                {/* Specific Grades Selection */}
                <div className="space-y-4">
                  <Label>Grados Específicos (opcional)</Label>
                  <p className="text-sm text-gray-600">
                    Si no seleccionas ningún grado, el material estará disponible para todos los grados de la categoría seleccionada.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                    {availableGrades.map((grade) => (
                      <div key={grade.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={grade.id}
                          checked={newMaterial.specificGrades?.includes(grade.id) || false}
                          onCheckedChange={(checked) => handleGradeSelection(grade.id, checked as boolean)}
                        />
                        <Label htmlFor={grade.id} className="text-sm cursor-pointer">
                          {grade.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  {newMaterial.specificGrades && newMaterial.specificGrades.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600">Seleccionados:</span>
                      {newMaterial.specificGrades.map(gradeId => (
                        <Badge key={gradeId} variant="outline" className="text-xs">
                          {getGradeName(gradeId)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setIsAddingMaterial(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddMaterial}>
                    Agregar Material
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Materials Grid */}
          {filteredMaterials.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay materiales disponibles
                </h3>
                <p className="text-gray-600 mb-4">
                  {canUserManageMaterials() 
                    ? 'Comienza agregando videos, documentos o enlaces para tus estudiantes.'
                    : 'Los profesores aún no han subido material de estudio.'
                  }
                </p>
                {canUserManageMaterials() && (
                  <Button onClick={() => setIsAddingMaterial(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Material
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      {getTypeIcon(material.type)}
                      <div className="flex flex-wrap gap-2">
                        {getAudienceBadge(material.targetAudience)}
                        {material.category !== 'todos' && (
                          <Badge variant="outline">{material.category}</Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <CardDescription>{material.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {material.duration && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{material.duration}</span>
                        </div>
                      )}

                      {material.specificGrades.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">Grados específicos:</p>
                          <div className="flex flex-wrap gap-1">
                            {material.specificGrades.slice(0, 3).map(gradeId => (
                              <Badge key={gradeId} variant="outline" className="text-xs">
                                {getGradeName(gradeId)}
                              </Badge>
                            ))}
                            {material.specificGrades.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{material.specificGrades.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Button 
                          size="sm" 
                          onClick={() => window.open(material.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {material.type === 'video' ? 'Ver Video' : 
                           material.type === 'document' ? 'Abrir Documento' : 'Abrir Enlace'}
                        </Button>
                        
                        {canUserManageMaterials() && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteMaterial(material.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Instructions for instructors */}
          {canUserManageMaterials() && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Guía para Profesores</CardTitle>
                <CardDescription>
                  Cómo gestionar el material de estudio
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Tipos de Material</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Videos:</strong> YouTube, Vimeo, archivos MP4</li>
                      <li>• <strong>Documentos:</strong> PDFs, Google Docs</li>
                      <li>• <strong>Enlaces:</strong> Sitios web, recursos online</li>
                      <li>• <strong>Archivos:</strong> Cualquier tipo de archivo</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Filtros de Acceso</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Audiencia:</strong> Todos, estudiantes, profesores</li>
                      <li>• <strong>Categoría:</strong> Niños, adultos, todos</li>
                      <li>• <strong>Grados específicos:</strong> Para niveles concretos</li>
                      <li>• <strong>Múltiples grados:</strong> Selecciona varios grados a la vez</li>
                    </ul>
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