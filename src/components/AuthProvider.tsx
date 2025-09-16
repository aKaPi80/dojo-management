import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, GRADES } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getAllUsers: () => User[];
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize demo users if they don't exist
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
      const demoUsers: User[] = [
        {
          id: 'admin-demo',
          name: 'Administrador Demo',
          username: 'admin',
          password: 'admin123',
          email: 'admin@dojo.com',
          role: 'chief_instructor',
          grade: GRADES.ALL.find(g => g.id === 'dan_10') || GRADES.ALL[GRADES.ALL.length - 1],
          joinDate: new Date().toISOString(),
          lastExamDate: new Date().toISOString(),
          attendancePercentage: 100,
          isActive: true,
          attendances: [],
          exams: [],
          createdAt: new Date().toISOString(),
          photo: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=A'
        },
        {
          id: 'profesor-demo',
          name: 'Profesor Demo',
          username: 'profesor1',
          password: 'profesor123',
          email: 'profesor@dojo.com',
          role: 'profesor',
          grade: GRADES.ALL.find(g => g.id === 'dan_3') || GRADES.ALL[GRADES.ALL.length - 5],
          joinDate: new Date().toISOString(),
          lastExamDate: new Date().toISOString(),
          attendancePercentage: 95,
          isActive: true,
          attendances: [],
          exams: [],
          createdAt: new Date().toISOString(),
          photo: 'https://via.placeholder.com/150x150/22C55E/FFFFFF?text=P'
        },
        {
          id: 'estudiante-demo',
          name: 'Estudiante Demo',
          username: 'estudiante1',
          password: 'estudiante123',
          email: 'estudiante@dojo.com',
          role: 'estudiante',
          grade: GRADES.ALL.find(g => g.id === 'kyu_5') || GRADES.ALL[10],
          joinDate: new Date().toISOString(),
          lastExamDate: new Date().toISOString(),
          attendancePercentage: 85,
          isActive: true,
          attendances: [],
          exams: [],
          createdAt: new Date().toISOString(),
          photo: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=E'
        }
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
    }

    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: User) => 
        u.username === username && u.password === password && u.isActive
      );

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const getAllUsers = (): User[] => {
    try {
      return JSON.parse(localStorage.getItem('users') || '[]');
    } catch (error) {
      return [];
    }
  };

  const updateUser = (updatedUser: User) => {
    try {
      const users = getAllUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user if it's the same user
        if (user && user.id === updatedUser.id) {
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    getAllUsers,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};