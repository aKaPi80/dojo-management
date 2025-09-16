import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { BookOpen, Video, FileText, Star, Plus, Search, Download, Eye } from 'lucide-react';

interface Material {
  id: string;
  title: string;
  description: string;
  type: 'documento' | 'video' | 'kamoku' | 'howa';
  url: string;
  category: string;
  addedBy: string;
  addedDate: string;
  gradeLevel?: string;
}

export default function StudentMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    type: 'documento' as Material['type'],
    url: '',
    category: '',
    gradeLevel: ''
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const canAddMaterials = user?.role === 'chief_instructor' || user?.role === 'profesor';

  const loadMaterials = () => {
    const storedMaterials: Material[] = JSON.parse(localStorage.getItem('materials') || '[]');
    setMaterials(storedMaterials);
  };

  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.description || !newMaterial.url) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const material: Material = {
      id: Date.now().toString(),
      ...newMaterial,
      addedBy: user?.name || 'Desconocido',
      addedDate: new Date().toISOString()
    };

    const updatedMaterials = [...materials, material];
    setMaterials(updatedMaterials);
    localStorage.setItem('materials', JSON.stringify(updatedMaterials));
    
    toast.success('Material añadido correctamente');
    
    setNewMaterial({
      title: '',
      description: '',
      type: 'documento',
      url: '',
      category: '',
      gradeLevel: ''
    });
    setIsAddDialogOpen(false);
  };

  const getTypeIcon = (type: Material['type']) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'kamoku': return <Star className="h-5 w-5" />;
      case 'howa': return <BookOpen className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: Material['type']) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'kamoku': return 'bg-yellow-100 text-yellow-800';
      case 'howa': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || material.type === filterType;
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = [...new Set(materials.map(m => m.category))].filter(Boolean);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Materiales de Estudio</h1>
        <p className="text-gray-600">
          Recursos educativos para el entrenamiento de Shorinji Kempo
        </p>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar materiales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Tipo de material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="documento">Documentos</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="kamoku">Kamoku (Técnicas)</SelectItem>
            <SelectItem value="howa">Howa (Filosofía)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canAddMaterials && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Añadir Material</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Material</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo recurso educativo para los estudiantes
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    placeholder="Título del material"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={newMaterial.type} onValueChange={(value: Material['type']) => setNewMaterial({ ...newMaterial, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="documento">Documento</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="kamoku">Kamoku (Técnicas)</SelectItem>
                      <SelectItem value="howa">Howa (Filosofía)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    value={newMaterial.url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                    placeholder="Ej: Principiantes, Avanzado, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Nivel de Grado</Label>
                  <Input
                    id="gradeLevel"
                    value={newMaterial.gradeLevel}
                    onChange={(e) => setNewMaterial({ ...newMaterial, gradeLevel: e.target.value })}
                    placeholder="Ej: Minarai, 1º Dan, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    placeholder="Descripción del material"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleAddMaterial} className="flex-1">
                    Añadir Material
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Materials Grid */}
      <div className="space-y-4">
        {filteredMaterials.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay materiales</h3>
              <p className="text-gray-600 mb-4">
                {materials.length === 0 
                  ? 'Aún no se han añadido materiales de estudio.'
                  : 'No se encontraron materiales con los filtros aplicados.'
                }
              </p>
              {canAddMaterials && materials.length === 0 && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  Añadir Primer Material
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(material.type)}`}>
                        {getTypeIcon(material.type)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{material.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className={getTypeColor(material.type)}>
                        {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                      </Badge>
                      {material.category && (
                        <Badge variant="outline">{material.category}</Badge>
                      )}
                      {material.gradeLevel && (
                        <Badge variant="outline">{material.gradeLevel}</Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>Añadido por: {material.addedBy}</p>
                      <p>Fecha: {new Date(material.addedDate).toLocaleDateString('es-ES')}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(material.url, '_blank')}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(material.url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{materials.filter(m => m.type === 'documento').length}</div>
            <p className="text-xs text-muted-foreground">Documentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Video className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{materials.filter(m => m.type === 'video').length}</div>
            <p className="text-xs text-muted-foreground">Videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{materials.filter(m => m.type === 'kamoku').length}</div>
            <p className="text-xs text-muted-foreground">Kamoku</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{materials.filter(m => m.type === 'howa').length}</div>
            <p className="text-xs text-muted-foreground">Howa</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}