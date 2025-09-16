import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, StudyMaterial, getAllUsers } from '@/types';
import { 
  BookOpen, 
  Plus, 
  Link as LinkIcon, 
  FileText, 
  Image, 
  Video,
  Download,
  Eye,
  Edit,
  Trash2,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudyMaterials() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    type: 'link' as 'video' | 'document' | 'image' | 'link',
    url: '',
    gradeLevel: '',
    category: '',
    audience: 'all' as 'all' | 'professors' | 'individual'
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);

    loadMaterials();
  }, [user, navigate]);

  const loadMaterials = () => {
    try {
      const savedMaterials = localStorage.getItem('studyMaterials');
      const allMaterials: StudyMaterial[] = savedMaterials ? JSON.parse(savedMaterials) : [];
      
      // Filter materials based on user role and audience
      let filteredMaterials = allMaterials;
      
      if (user?.role === 'estudiante') {
        filteredMaterials = allMaterials.filter(material => 
          material.audience === 'all' || 
          (material.audience === 'individual' && material.gradeLevel === user.grade.id)
        );
      } else if (user?.role === 'profesor') {
        filteredMaterials = allMaterials.filter(material => 
          material.audience === 'all' || 
          material.audience === 'professors' ||
          (material.audience === 'individual' && material.gradeLevel === user.grade.id)
        );
      }
      // Chief instructors see all materials
      
      setMaterials(filteredMaterials);
    } catch (error) {
      console.error('Error loading materials:', error);
      setMaterials([]);
    }
  };

  const saveMaterials = (updatedMaterials: StudyMaterial[]) => {
    localStorage.setItem('studyMaterials', JSON.stringify(updatedMaterials));
    loadMaterials(); // Reload to apply filters
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
      toast.error('No tienes permisos para añadir material');
      return;
    }

    if (!materialForm.title.trim() || !materialForm.url.trim()) {
      toast.error('Título y URL son obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      const savedMaterials = localStorage.getItem('studyMaterials');
      const allMaterials: StudyMaterial[] = savedMaterials ? JSON.parse(savedMaterials) : [];

      const newMaterial: StudyMaterial = {
        id: editingMaterial?.id || `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: materialForm.title.trim(),
        description: materialForm.description.trim(),
        type: materialForm.type,
        url: materialForm.url.trim(),
        gradeLevel: materialForm.gradeLevel,
        category: materialForm.category.trim(),
        audience: materialForm.audience,
        uploadDate: editingMaterial?.uploadDate || new Date().toISOString(),
        uploadedBy: user.name
      };

      let updatedMaterials;
      if (editingMaterial) {
        updatedMaterials = allMaterials.map(m => m.id === editingMaterial.id ? newMaterial : m);
        toast.success('Material actualizado exitosamente');
      } else {
        updatedMaterials = [...allMaterials, newMaterial];
        toast.success('Material añadido exitosamente');
      }

      saveMaterials(updatedMaterials);
      
      // Reset form
      setMaterialForm({
        title: '',
        description: '',
        type: 'link',
        url: '',
        gradeLevel: '',
        category: '',
        audience: 'all'
      });
      setShowAddForm(false);
      setEditingMaterial(null);

    } catch (error) {
      console.error('Error saving material:', error);
      toast.error('Error al guardar el material');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setMaterialForm({
      title: material.title,
      description: material.description,
      type: material.type,
      url: material.url,
      gradeLevel: material.gradeLevel || '',
      category: material.category,
      audience: material.audience || 'all'
    });
    setShowAddForm(true);
  };

  const handleDelete = (materialId: string) => {
    if (!user || (user.role !== 'chief_instructor' && user.role !== 'profesor')) {
      toast.error('No tienes permisos para eliminar material');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este material?')) {
      try {
        const savedMaterials = localStorage.getItem('studyMaterials');
        const allMaterials: StudyMaterial[] = savedMaterials ? JSON.parse(savedMaterials) : [];
        const updatedMaterials = allMaterials.filter(m => m.id !== materialId);
        
        saveMaterials(updatedMaterials);
        toast.success('Material eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting material:', error);
        toast.error('Error al eliminar el material');
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'link': return <LinkIcon className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'professors': return <Badge variant="default">Solo Profesores</Badge>;
      case 'individual': return <Badge variant="secondary">Específico</Badge>;
      case 'all': return <Badge variant="outline">Todos</Badge>;
      default: return <Badge variant="outline">Todos</Badge>;
    }
  };

  if (!user) {
    return null;
  }

  const canAddMaterial = user.role === 'chief_instructor' || user.role === 'profesor';

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
          <Tabs defaultValue="materials" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="materials">Ver Material</TabsTrigger>
              {canAddMaterial && (
                <TabsTrigger value="manage">Gestionar Material</TabsTrigger>
              )}
            </TabsList>

            {/* Materials View Tab */}
            <TabsContent value="materials">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Material Disponible</span>
                  </CardTitle>
                  <CardDescription>
                    Recursos de aprendizaje y estudio
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {materials.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No hay material disponible</h3>
                      <p>Los instructores subirán material de estudio próximamente.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {materials.map((material) => (
                        <Card key={material.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(material.type)}
                                <h3 className="font-medium text-sm">{material.title}</h3>
                              </div>
                              {canAddMaterial && (
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(material)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(material.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            {material.description && (
                              <p className="text-xs text-gray-600 mb-3">{material.description}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {getAudienceBadge(material.audience || 'all')}
                              {material.category && (
                                <Badge variant="outline" className="text-xs">
                                  {material.category}
                                </Badge>
                              )}
                              {material.gradeLevel && (
                                <Badge variant="secondary" className="text-xs">
                                  {material.gradeLevel}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <Button
                                size="sm"
                                onClick={() => window.open(material.url, '_blank')}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Button>
                              <span className="text-xs text-gray-500">
                                {material.uploadedBy}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manage Materials Tab */}
            {canAddMaterial && (
              <TabsContent value="manage">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Upload className="h-5 w-5" />
                        <span>Gestionar Material</span>
                      </span>
                      <Button onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Material
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    {showAddForm && (
                      <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Título *</Label>
                            <Input
                              id="title"
                              value={materialForm.title}
                              onChange={(e) => setMaterialForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Título del material"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Material</Label>
                            <Select value={materialForm.type} onValueChange={(value: any) => setMaterialForm(prev => ({ ...prev, type: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="link">Enlace Web</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="document">Documento</SelectItem>
                                <SelectItem value="image">Imagen</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="url">URL *</Label>
                            <Input
                              id="url"
                              type="url"
                              value={materialForm.url}
                              onChange={(e) => setMaterialForm(prev => ({ ...prev, url: e.target.value }))}
                              placeholder="https://..."
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="category">Categoría</Label>
                            <Input
                              id="category"
                              value={materialForm.category}
                              onChange={(e) => setMaterialForm(prev => ({ ...prev, category: e.target.value }))}
                              placeholder="Técnicas, Historia, etc."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="audience">Audiencia</Label>
                            <Select value={materialForm.audience} onValueChange={(value: any) => setMaterialForm(prev => ({ ...prev, audience: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos los usuarios</SelectItem>
                                <SelectItem value="professors">Solo profesores</SelectItem>
                                <SelectItem value="individual">Grado específico</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {materialForm.audience === 'individual' && (
                            <div className="space-y-2">
                              <Label htmlFor="gradeLevel">Grado Específico</Label>
                              <Input
                                id="gradeLevel"
                                value={materialForm.gradeLevel}
                                onChange={(e) => setMaterialForm(prev => ({ ...prev, gradeLevel: e.target.value }))}
                                placeholder="ID del grado (ej: k6, a1d)"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            value={materialForm.description}
                            onChange={(e) => setMaterialForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descripción del material..."
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowAddForm(false);
                              setEditingMaterial(null);
                              setMaterialForm({
                                title: '',
                                description: '',
                                type: 'link',
                                url: '',
                                gradeLevel: '',
                                category: '',
                                audience: 'all'
                              });
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : editingMaterial ? 'Actualizar' : 'Añadir Material'}
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Materials List for Management */}
                    <div className="space-y-3">
                      <h3 className="font-medium">Material Existente</h3>
                      {materials.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay material disponible</p>
                      ) : (
                        <div className="space-y-2">
                          {materials.map((material) => (
                            <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                {getTypeIcon(material.type)}
                                <div>
                                  <h4 className="font-medium">{material.title}</h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {getAudienceBadge(material.audience || 'all')}
                                    {material.category && (
                                      <Badge variant="outline" className="text-xs">
                                        {material.category}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(material)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(material.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}