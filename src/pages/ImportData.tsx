import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DEFAULT_CLUB_SETTINGS, User, GRADES } from '@/types';
import { 
  Upload, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Users,
  Link,
  Globe,
  Key
} from 'lucide-react';
import { toast } from 'sonner';

export default function ImportData() {
  const { user, getAllUsers, createUser } = useAuth();
  const navigate = useNavigate();
  const [clubSettings, setClubSettings] = useState(DEFAULT_CLUB_SETTINGS);
  const [csvData, setCsvData] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'chief_instructor') {
      navigate('/dashboard');
      return;
    }

    const settings = JSON.parse(localStorage.getItem('clubSettings') || JSON.stringify(DEFAULT_CLUB_SETTINGS));
    setClubSettings(settings);
  }, [user, navigate]);

  if (!user || user.role !== 'chief_instructor') {
    return null;
  }

  const parseCSVData = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  };

  const findGradeByName = (gradeName: string) => {
    const allGrades = [...GRADES.CHILDREN, ...GRADES.ADULTS];
    return allGrades.find(g => 
      g.name.toLowerCase().includes(gradeName.toLowerCase()) ||
      gradeName.toLowerCase().includes(g.name.toLowerCase())
    ) || GRADES.ADULTS[0]; // Default to first adult grade
  };

  const validateAndCreateUser = (userData: any): { success: boolean; error?: string; user?: User } => {
    try {
      // Required fields validation
      if (!userData.name && !userData.nombre) {
        return { success: false, error: 'Nombre es requerido' };
      }
      
      if (!userData.username && !userData.usuario) {
        return { success: false, error: 'Usuario es requerido' };
      }

      if (!userData.email && !userData.correo) {
        return { success: false, error: 'Email es requerido' };
      }

      // Check if user already exists
      const existingUsers = getAllUsers();
      const username = userData.username || userData.usuario;
      const email = userData.email || userData.correo;
      
      if (existingUsers.find(u => u.username === username)) {
        return { success: false, error: `Usuario ${username} ya existe` };
      }

      if (existingUsers.find(u => u.email === email)) {
        return { success: false, error: `Email ${email} ya existe` };
      }

      // Find grade
      const gradeName = userData.grade || userData.grado || userData.cinturon || 'blanco';
      const grade = findGradeByName(gradeName);

      // Create user object
      const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        username,
        password: userData.password || userData.contraseña || 'temporal123',
        name: userData.name || userData.nombre,
        email,
        role: 'estudiante',
        grade,
        birthDate: userData.birthDate || userData.fechaNacimiento || '2000-01-01',
        phone: userData.phone || userData.telefono || '',
        address: userData.address || userData.direccion || '',
        emergencyContact: userData.emergencyContact || userData.contactoEmergencia || '',
        emergencyPhone: userData.emergencyPhone || userData.telefonoEmergencia || '',
        medicalInfo: userData.medicalInfo || userData.infoMedica || '',
        notes: userData.notes || userData.notas || '',
        joinDate: userData.joinDate || userData.fechaIngreso || new Date().toISOString().split('T')[0],
        lastExamDate: userData.lastExamDate || userData.ultimoExamen || '',
        attendancePercentage: parseInt(userData.attendancePercentage || userData.asistencia || '0') || 0,
        isActive: true,
        mustChangePassword: true,
        createdBy: user.id,
        attendances: [],
        exams: [],
        photo: userData.photo || userData.foto || ''
      };

      const createdUser = createUser(newUser);
      return { success: true, user: createdUser };

    } catch (error) {
      return { success: false, error: `Error procesando datos: ${error}` };
    }
  };

  const handleCSVImport = async () => {
    if (!csvData.trim()) {
      toast.error('Por favor ingresa datos CSV');
      return;
    }

    setIsProcessing(true);
    const results = { success: 0, errors: [] as string[] };

    try {
      const parsedData = parseCSVData(csvData);
      
      for (const row of parsedData) {
        const result = validateAndCreateUser(row);
        if (result.success) {
          results.success++;
        } else {
          results.errors.push(result.error || 'Error desconocido');
        }
      }

      setImportResults(results);
      toast.success(`Importación completada: ${results.success} usuarios creados`);
      
    } catch (error) {
      toast.error('Error procesando archivo CSV');
      results.errors.push('Error procesando archivo CSV');
      setImportResults(results);
    }

    setIsProcessing(false);
  };

  const handleJSONImport = async () => {
    if (!jsonData.trim()) {
      toast.error('Por favor ingresa datos JSON');
      return;
    }

    setIsProcessing(true);
    const results = { success: 0, errors: [] as string[] };

    try {
      const parsedData = JSON.parse(jsonData);
      const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      
      for (const item of dataArray) {
        const result = validateAndCreateUser(item);
        if (result.success) {
          results.success++;
        } else {
          results.errors.push(result.error || 'Error desconocido');
        }
      }

      setImportResults(results);
      toast.success(`Importación completada: ${results.success} usuarios creados`);
      
    } catch (error) {
      toast.error('Error procesando datos JSON');
      results.errors.push('JSON inválido');
      setImportResults(results);
    }

    setIsProcessing(false);
  };

  const handleGoogleSheetsImport = async () => {
    if (!googleSheetsUrl.trim()) {
      toast.error('Por favor ingresa la URL de Google Sheets');
      return;
    }

    if (!googleEmail.trim()) {
      toast.error('Por favor ingresa tu email de Google');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Extract sheet ID from URL
      const sheetIdMatch = googleSheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        throw new Error('URL de Google Sheets inválida');
      }

      const sheetId = sheetIdMatch[1];
      
      // Convert to CSV export URL
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
      
      toast.info('Conectando con Google Sheets...');
      
      // In a real implementation, you would:
      // 1. Use Google Sheets API with proper authentication
      // 2. Handle CORS and authentication properly
      // 3. Process the actual data from the sheet
      
      // For demo purposes, we'll simulate the process
      setTimeout(() => {
        const results = { success: 0, errors: ['Funcionalidad de Google Sheets en desarrollo. Por favor usa CSV o JSON por ahora.'] as string[] };
        setImportResults(results);
        toast.warning('Google Sheets: Funcionalidad en desarrollo');
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      toast.error('Error conectando con Google Sheets');
      setImportResults({ success: 0, errors: ['Error conectando con Google Sheets'] });
      setIsProcessing(false);
    }
  };

  const generateSampleCSV = () => {
    const sampleCSV = `name,username,email,grade,phone,birthDate,address,emergencyContact,emergencyPhone
Juan Pérez,juan.perez,juan@email.com,2º Kyu,600123456,1995-03-15,Calle Principal 123,María Pérez,600654321
Ana García,ana.garcia,ana@email.com,1º Kyu,600789012,1998-07-22,Avenida Central 456,Carlos García,600987654
Luis Martín,luis.martin,luis@email.com,3º Kyu,600345678,1992-11-08,Plaza Mayor 789,Elena Martín,600234567`;
    
    setCsvData(sampleCSV);
    toast.success('Datos de ejemplo cargados en CSV');
  };

  const generateSampleJSON = () => {
    const sampleJSON = `[
  {
    "name": "María López",
    "username": "maria.lopez",
    "email": "maria@email.com",
    "grade": "1º Dan",
    "phone": "600111222",
    "birthDate": "1990-05-12",
    "address": "Calle Nueva 321",
    "emergencyContact": "Pedro López",
    "emergencyPhone": "600333444"
  },
  {
    "name": "Carlos Ruiz",
    "username": "carlos.ruiz", 
    "email": "carlos@email.com",
    "grade": "5º Kyu",
    "phone": "600555666",
    "birthDate": "1985-09-30",
    "address": "Avenida Norte 654",
    "emergencyContact": "Laura Ruiz",
    "emergencyPhone": "600777888"
  }
]`;
    
    setJsonData(sampleJSON);
    toast.success('Datos de ejemplo cargados en JSON');
  };

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
                  <p className="text-sm text-gray-500">Importar Datos</p>
                </div>
              </div>
              
              <Navigation clubSettings={clubSettings} />
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-6 w-6 text-blue-600" />
                <span>Importar Datos de Estudiantes</span>
              </CardTitle>
              <CardDescription>
                Importa estudiantes desde archivos CSV, JSON o Google Sheets con cualquier cuenta de Google
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Import Results */}
          {importResults && (
            <Alert className={`mb-8 ${importResults.success > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  {importResults.success > 0 && (
                    <p className="text-green-700 font-medium">
                      ✅ {importResults.success} estudiantes importados exitosamente
                    </p>
                  )}
                  {importResults.errors.length > 0 && (
                    <div>
                      <p className="text-red-700 font-medium mb-2">❌ Errores encontrados:</p>
                      <ul className="text-red-600 text-sm space-y-1">
                        {importResults.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {importResults.errors.length > 5 && (
                          <li>• ... y {importResults.errors.length - 5} errores más</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="csv" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="csv">CSV</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
            </TabsList>

            {/* CSV Import */}
            <TabsContent value="csv">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Importar desde CSV</span>
                  </CardTitle>
                  <CardDescription>
                    Pega los datos CSV o carga un archivo. Campos: name, username, email, grade, phone, birthDate, address, emergencyContact, emergencyPhone
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="csv-data">Datos CSV</Label>
                    <Button variant="outline" size="sm" onClick={generateSampleCSV}>
                      Cargar Ejemplo
                    </Button>
                  </div>
                  
                  <Textarea
                    id="csv-data"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="name,username,email,grade,phone,birthDate&#10;Juan Pérez,juan.perez,juan@email.com,2º Kyu,600123456,1995-03-15"
                    rows={10}
                    className="font-mono text-sm"
                  />
                  
                  <Button 
                    onClick={handleCSVImport} 
                    disabled={isProcessing || !csvData.trim()}
                    className="w-full"
                  >
                    {isProcessing ? 'Procesando...' : 'Importar CSV'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* JSON Import */}
            <TabsContent value="json">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Importar desde JSON</span>
                  </CardTitle>
                  <CardDescription>
                    Pega los datos JSON. Puede ser un objeto o array de objetos con los campos de estudiante.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="json-data">Datos JSON</Label>
                    <Button variant="outline" size="sm" onClick={generateSampleJSON}>
                      Cargar Ejemplo
                    </Button>
                  </div>
                  
                  <Textarea
                    id="json-data"
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    placeholder='[{"name": "Juan Pérez", "username": "juan.perez", "email": "juan@email.com", "grade": "2º Kyu"}]'
                    rows={10}
                    className="font-mono text-sm"
                  />
                  
                  <Button 
                    onClick={handleJSONImport} 
                    disabled={isProcessing || !jsonData.trim()}
                    className="w-full"
                  >
                    {isProcessing ? 'Procesando...' : 'Importar JSON'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Google Sheets Import */}
            <TabsContent value="sheets">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Importar desde Google Sheets</span>
                  </CardTitle>
                  <CardDescription>
                    Conecta con cualquier cuenta de Google para importar datos desde Google Sheets
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">Configuración requerida:</p>
                        <ol className="text-sm space-y-1 ml-4">
                          <li>1. Asegúrate de que tu Google Sheet sea público o compartido</li>
                          <li>2. La primera fila debe contener los encabezados de columna</li>
                          <li>3. Usa cualquier cuenta de Google (no solo skbcgipuzkoa@gmail.com)</li>
                        </ol>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="google-email">Tu Email de Google</Label>
                      <Input
                        id="google-email"
                        type="email"
                        value={googleEmail}
                        onChange={(e) => setGoogleEmail(e.target.value)}
                        placeholder="tu-email@gmail.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sheets-url">URL de Google Sheets</Label>
                      <Input
                        id="sheets-url"
                        value={googleSheetsUrl}
                        onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/1ABC123.../edit"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleGoogleSheetsImport} 
                    disabled={isProcessing || !googleSheetsUrl.trim() || !googleEmail.trim()}
                    className="w-full"
                  >
                    {isProcessing ? 'Conectando...' : 'Importar desde Google Sheets'}
                  </Button>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Nota:</strong> La integración completa con Google Sheets requiere configuración adicional de API. 
                      Por ahora, usa CSV o JSON para importar datos.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Field Mapping Guide */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Guía de Campos</CardTitle>
              <CardDescription>
                Mapeo de campos para importación de datos
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Campos Requeridos</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>name/nombre:</strong> Nombre completo del estudiante</li>
                    <li>• <strong>username/usuario:</strong> Nombre de usuario único</li>
                    <li>• <strong>email/correo:</strong> Dirección de email</li>
                    <li>• <strong>grade/grado/cinturon:</strong> Grado actual (ej: "2º Kyu")</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Campos Opcionales</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>phone/telefono:</strong> Número de teléfono</li>
                    <li>• <strong>birthDate/fechaNacimiento:</strong> Fecha de nacimiento</li>
                    <li>• <strong>address/direccion:</strong> Dirección</li>
                    <li>• <strong>emergencyContact/contactoEmergencia:</strong> Contacto de emergencia</li>
                    <li>• <strong>password/contraseña:</strong> Contraseña (por defecto: temporal123)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}