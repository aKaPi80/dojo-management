import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, 
  Video, 
  BookOpen, 
  Calendar, 
  ExternalLink,
  User
} from 'lucide-react';
import { StudentMaterial, Grade } from '@/types';
import { useAuth } from '@/components/AuthProvider';

export default function TechniqueCalendar() {
  const { user } = useAuth();
  const [myMaterials, setMyMaterials] = useState<StudentMaterial[]>([]);

  useEffect(() => {
    if (user) {
      loadMyMaterials();
    }
  }, [user]);

  const loadMyMaterials = () => {
    if (!user) return;
    
    const allMaterials: StudentMaterial[] = JSON.parse(localStorage.getItem('studentMaterials') || '[]');
    const studentMaterials = allMaterials.filter(m => m.studentId === user.id);
    setMyMaterials(studentMaterials.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
  };

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'kamoku': return <BookOpen className="h-5 w-5" />;
      case 'howa': return <Calendar className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getMaterialTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Vídeo Técnico';
      case 'document': return 'Documento';
      case 'kamoku': return 'Kamoku';
      case 'howa': return 'Howa (Filosofía)';
      default: return type;
    }
  };

  const getMaterialTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'kamoku': return 'bg-purple-100 text-purple-800';
      case 'howa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeBadgeColor = (grade: Grade) => {
    if (grade.dan) return 'bg-black text-white';
    switch (grade.beltColor) {
      case 'Blanco': return 'bg-gray-100 text-gray-800';
      case 'Amarillo': return 'bg-yellow-100 text-yellow-800';
      case 'Naranja': return 'bg-orange-100 text-orange-800';
      case 'Verde': return 'bg-green-100 text-green-800';
      case 'Azul': return 'bg-blue-100 text-blue-800';
      case 'Marrón': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Agrupar materiales por tipo
  const materialsByType = myMaterials.reduce((acc, material) => {
    if (!acc[material.type]) {
      acc[material.type] = [];
    }
    acc[material.type].push(material);
    return acc;
  }, {} as Record<string, StudentMaterial[]>);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.photo} alt={user.name} />
          <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-600">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Material de Estudio</h1>
          <p className="text-gray-600">{user.name}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge className={getGradeBadgeColor(user.grade)}>
              {user.grade.name} - {user.grade.beltColor}
            </Badge>
            <Badge variant="outline">
              {user.category}
            </Badge>
            <Badge variant="secondary">
              {myMaterials.length} material{myMaterials.length !== 1 ? 'es' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {myMaterials.length > 0 ? (
        <div className="space-y-6">
          {/* Materiales por tipo */}
          {Object.entries(materialsByType).map(([type, materials]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getMaterialTypeIcon(type)}
                  <span>{getMaterialTypeLabel(type)}</span>
                  <Badge variant="secondary">{materials.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Material personalizado asignado por tus senseis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.map((material) => (
                    <div key={material.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getMaterialTypeIcon(material.type)}
                            <h3 className="font-medium">{material.title}</h3>
                          </div>
                          
                          <Badge className={getMaterialTypeBadgeColor(material.type)}>
                            {getMaterialTypeLabel(material.type)}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {material.description}
                      </p>
                      
                      {material.fileContent && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm font-sans text-gray-700 max-h-40 overflow-y-auto">
                            {material.fileContent}
                          </pre>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Añadido: {new Date(material.uploadDate).toLocaleDateString()}
                        </p>
                        
                        {material.url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={material.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {material.type === 'video' ? 'Ver Vídeo' : 'Abrir Documento'}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Resumen de progreso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Mi Progreso</span>
              </CardTitle>
              <CardDescription>
                Resumen de tu desarrollo en el Shorinji Kempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <Video className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">
                    {materialsByType.video?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Vídeos Técnicos</p>
                </div>
                
                <div className="text-center p-3 border rounded-lg">
                  <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    {materialsByType.kamoku?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Kamokus</p>
                </div>
                
                <div className="text-center p-3 border rounded-lg">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {materialsByType.howa?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Howa (Filosofía)</p>
                </div>
                
                <div className="text-center p-3 border rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {materialsByType.document?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Documentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes material asignado
            </h3>
            <p className="text-gray-500 mb-4">
              Tus senseis añadirán material personalizado según tu progreso en el Shorinji Kempo
            </p>
            <div className="text-sm text-gray-400">
              <p>El material puede incluir:</p>
              <ul className="mt-2 space-y-1">
                <li>• Vídeos de técnicas específicas para tu grado</li>
                <li>• Kamokus (textos técnicos)</li>
                <li>• Howa (enseñanzas filosóficas)</li>
                <li>• Documentos de apoyo</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}