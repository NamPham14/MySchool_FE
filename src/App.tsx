import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import MainLayout from './components/layout/MainLayout';
import ClassesPage from './pages/ClassesPage';
import SubjectsPage from './pages/SubjectsPage';
import TimetablesPage from './pages/TimetablesPage';
import AssignmentsPage from './pages/AssignmentsPage';
import GradesPage from './pages/GradesPage';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import LeavesPage from './pages/LeavesPage';
import FeesPage from './pages/FeesPage';
import EventsPage from './pages/EventsPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import { useAuth } from './hooks/useAuth';

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth/login" />;
  return <Navigate to="/dashboard" />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth/login" />;
  return <>{children}</>;
}

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/auth/login" element={<AuthPage />} />
          <Route 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            } 
          >
            {/* All protected pages go here */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/timetables" element={<TimetablesPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/leaves" element={<LeavesPage />} />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/notifications" element={<div className="p-4 bg-white rounded-2xl shadow-sm h-96 flex items-center justify-center text-gray-400">Thông báo sẽ hiển thị ở đây</div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
