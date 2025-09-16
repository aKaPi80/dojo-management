// User Types
export type UserRole = 'estudiante' | 'profesor' | 'chief_instructor';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email?: string;
  role: UserRole;
  grade: Grade;
  birthDate?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalInfo?: string;
  notes?: string;
  joinDate: string;
  attendancePercentage: number;
  isActive: boolean;
  mustChangePassword?: boolean;
  createdBy?: string;
  attendances: Attendance[];
  exams: Exam[];
  photo?: string;
  lastExamDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Grade Types
export interface GradeRequirements {
  minAttendance: number;
  minMonths: number;
  minAttendancePercentage?: number;
}

export interface Grade {
  id: string;
  name: string;
  beltColor: string;
  order: number;
  category: 'niños' | 'adultos';
  requirements?: GradeRequirements;
}

// Attendance Types
export type SessionType = 'normal' | 'especial' | 'curso_nacional' | 'curso_internacional';

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  present: boolean;
  sessionType?: SessionType;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// Exam Types
export interface Exam {
  id: string;
  userId: string;
  fromGradeId: string;
  toGradeId: string;
  examDate: string;
  result: 'passed' | 'failed' | 'pending';
  examinerIds: string[];
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// Club Settings Types
export interface ClubSettings {
  clubName: string;
  logo: string;
  backgroundImage: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

// Student Credentials Types
export interface StudentCredentials {
  username: string;
  password: string;
  studentName: string;
  webAppUrl: string;
  createdDate: string;
  chiefInstructorCode?: string;
}

// Default Settings
export const DEFAULT_CLUB_SETTINGS: ClubSettings = {
  clubName: 'Dojo de Artes Marciales',
  logo: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MA',
  backgroundImage: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  address: 'Calle Principal 123, Ciudad',
  phone: '+1 (555) 123-4567',
  email: 'contacto@dojo.com',
  website: 'https://www.dojo.com',
  description: 'Un dojo dedicado a la enseñanza tradicional de artes marciales',
  contactEmail: 'contacto@dojo.com',
  contactPhone: '+1 (555) 123-4567',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: ''
  }
};

// Grades Configuration
export const GRADES = {
  CHILDREN: [
    { id: 'child_10_kyu', name: '10º Kyu', beltColor: 'Blanco', order: 1, category: 'niños' as const, requirements: { minAttendance: 30, minMonths: 4 } },
    { id: 'child_9_kyu', name: '9º Kyu', beltColor: 'Amarillo', order: 2, category: 'niños' as const, requirements: { minAttendance: 35, minMonths: 4 } },
    { id: 'child_8_kyu', name: '8º Kyu', beltColor: 'Amarillo-Naranja', order: 3, category: 'niños' as const, requirements: { minAttendance: 40, minMonths: 4 } },
    { id: 'child_7_kyu', name: '7º Kyu', beltColor: 'Naranja', order: 4, category: 'niños' as const, requirements: { minAttendance: 45, minMonths: 5 } },
    { id: 'child_6_kyu', name: '6º Kyu', beltColor: 'Naranja-Verde', order: 5, category: 'niños' as const, requirements: { minAttendance: 50, minMonths: 5 } },
    { id: 'child_5_kyu', name: '5º Kyu', beltColor: 'Verde', order: 6, category: 'niños' as const, requirements: { minAttendance: 55, minMonths: 6 } },
    { id: 'child_4_kyu', name: '4º Kyu', beltColor: 'Verde-Azul', order: 7, category: 'niños' as const, requirements: { minAttendance: 60, minMonths: 6 } },
    { id: 'child_3_kyu', name: '3º Kyu', beltColor: 'Azul', order: 8, category: 'niños' as const, requirements: { minAttendance: 65, minMonths: 7 } },
    { id: 'child_2_kyu', name: '2º Kyu', beltColor: 'Azul-Marrón', order: 9, category: 'niños' as const, requirements: { minAttendance: 70, minMonths: 7 } },
    { id: 'child_1_kyu', name: '1º Kyu', beltColor: 'Marrón', order: 10, category: 'niños' as const, requirements: { minAttendance: 80, minMonths: 8 } },
    { id: 'child_1_kyu_1_dan', name: '1º Kyu-1º Dan', beltColor: 'Marrón-Negro', order: 11, category: 'niños' as const, requirements: { minAttendance: 90, minMonths: 10 } },
    { id: 'child_1_dan', name: '1º Dan', beltColor: 'Negro', order: 12, category: 'niños' as const, requirements: { minAttendance: 100, minMonths: 12 } }
  ],
  ADULTS: [
    { id: 'adult_6_kyu', name: '6º Kyu', beltColor: 'Blanco', order: 1, category: 'adultos' as const, requirements: { minAttendance: 40, minMonths: 6 } },
    { id: 'adult_5_kyu', name: '5º Kyu', beltColor: 'Amarillo', order: 2, category: 'adultos' as const, requirements: { minAttendance: 50, minMonths: 6 } },
    { id: 'adult_4_kyu', name: '4º Kyu', beltColor: 'Naranja', order: 3, category: 'adultos' as const, requirements: { minAttendance: 60, minMonths: 8 } },
    { id: 'adult_3_kyu', name: '3º Kyu', beltColor: 'Verde', order: 4, category: 'adultos' as const, requirements: { minAttendance: 70, minMonths: 8 } },
    { id: 'adult_2_kyu', name: '2º Kyu', beltColor: 'Azul', order: 5, category: 'adultos' as const, requirements: { minAttendance: 80, minMonths: 10 } },
    { id: 'adult_1_kyu', name: '1º Kyu', beltColor: 'Marrón', order: 6, category: 'adultos' as const, requirements: { minAttendance: 100, minMonths: 12 } },
    { id: 'adult_1_dan', name: '1º Dan', beltColor: 'Negro', order: 7, category: 'adultos' as const, requirements: { minAttendance: 120, minMonths: 18 } },
    { id: 'adult_2_dan', name: '2º Dan', beltColor: 'Negro', order: 8, category: 'adultos' as const, requirements: { minAttendance: 140, minMonths: 24 } },
    { id: 'adult_3_dan', name: '3º Dan', beltColor: 'Negro', order: 9, category: 'adultos' as const, requirements: { minAttendance: 160, minMonths: 36 } },
    { id: 'adult_4_dan', name: '4º Dan', beltColor: 'Negro', order: 10, category: 'adultos' as const, requirements: { minAttendance: 180, minMonths: 48 } },
    { id: 'adult_5_dan', name: '5º Dan', beltColor: 'Negro', order: 11, category: 'adultos' as const, requirements: { minAttendance: 200, minMonths: 60 } },
    { id: 'adult_6_dan', name: '6º Dan', beltColor: 'Negro', order: 12, category: 'adultos' as const, requirements: { minAttendance: 220, minMonths: 72 } },
    { id: 'adult_7_dan', name: '7º Dan', beltColor: 'Negro', order: 13, category: 'adultos' as const, requirements: { minAttendance: 240, minMonths: 84 } },
    { id: 'adult_8_dan', name: '8º Dan', beltColor: 'Negro', order: 14, category: 'adultos' as const, requirements: { minAttendance: 260, minMonths: 96 } },
    { id: 'adult_9_dan', name: '9º Dan', beltColor: 'Negro', order: 15, category: 'adultos' as const, requirements: { minAttendance: 280, minMonths: 120 } }
  ],
  ALL: [] as Grade[]
};

// Initialize ALL grades
GRADES.ALL = [...GRADES.CHILDREN, ...GRADES.ADULTS];

// Utility Functions
export const getAllUsers = (): User[] => {
  try {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem('users', JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

export const getAttendanceValue = (sessionType: SessionType): number => {
  const values = {
    normal: 1,
    especial: 2,
    curso_nacional: 3,
    curso_internacional: 6
  };
  return values[sessionType] || 1;
};

export const generateUsername = (name: string): string => {
  return name.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);
};

export const generatePassword = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const printCredentials = (credentials: StudentCredentials): void => {
  const printContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
      <h2 style="text-align: center; margin-bottom: 20px;">Credenciales de Acceso</h2>
      <div style="border: 2px solid #333; padding: 15px; margin: 10px 0;">
        <p><strong>Estudiante:</strong> ${credentials.studentName}</p>
        <p><strong>Usuario:</strong> ${credentials.username}</p>
        <p><strong>Contraseña:</strong> ${credentials.password}</p>
        <p><strong>URL:</strong> ${credentials.webAppUrl}</p>
        <p><strong>Fecha:</strong> ${new Date(credentials.createdDate).toLocaleDateString()}</p>
      </div>
      <p style="font-size: 12px; color: #666;">
        El estudiante debe cambiar su contraseña en el primer inicio de sesión.
      </p>
    </div>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }
};

export const sendCredentialsByEmail = async (credentials: StudentCredentials, email: string): Promise<void> => {
  // Simulate email sending
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Credentials sent to ${email}:`, credentials);
      resolve();
    }, 1000);
  });
};

export const isBirthday = (birthDate: string): boolean => {
  const today = new Date();
  const birth = new Date(birthDate);
  return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
};

export const getBirthdayMessage = (): string => {
  const messages = [
    '🎉 ¡Feliz cumpleaños!',
    '🎂 ¡Que tengas un día especial!',
    '🎈 ¡Celebremos juntos!',
    '🎊 ¡Muchas felicidades!'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};