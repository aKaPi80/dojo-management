import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import Students from './pages/Students';
import CreateStudent from './pages/CreateStudent';
import EditStudent from './pages/EditStudent';
import InactiveStudents from './pages/InactiveStudents';
import Settings from './pages/Settings';
import TransferRole from './pages/TransferRole';
import Materials from './pages/Materials';
import ImportData from './pages/ImportData';
import ExamList from './pages/ExamList';
import AccountSettings from './pages/AccountSettings';
import ClubRegistration from './pages/ClubRegistration';
import { AuthProvider } from './components/AuthProvider';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/club-registration" element={<ClubRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/students" element={<Students />} />
            <Route path="/create-student" element={<CreateStudent />} />
            <Route path="/edit-student/:studentId" element={<EditStudent />} />
            <Route path="/inactive-students" element={<InactiveStudents />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/transfer-role" element={<TransferRole />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/import-data" element={<ImportData />} />
            <Route path="/exam-list" element={<ExamList />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;