import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { LoginPage } from './pages/LoginPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { QuestionEditor } from './pages/QuestionEditor';
import { GameSession } from './pages/GameSession';
import { ResultsPage } from './pages/ResultsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SessionLobby } from './pages/SessionLobby';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'student' | 'teacher' }) {
  const { state } = useApp();
  if (!state.currentUser) return <Navigate to="/login" replace />;
  if (role && state.currentUser.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { state } = useApp();

  return (
    <Routes>
      <Route path="/login" element={state.currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={
        state.currentUser ? (
          state.currentUser.role === 'teacher' ? <Navigate to="/teacher" replace /> : <Navigate to="/student" replace />
        ) : <Navigate to="/login" replace />
      } />
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/questions" element={<ProtectedRoute role="teacher"><QuestionEditor /></ProtectedRoute>} />
      <Route path="/teacher/analytics" element={<ProtectedRoute role="teacher"><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/teacher/lobby/:sessionId" element={<ProtectedRoute role="teacher"><SessionLobby /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/game/:sessionId" element={<ProtectedRoute role="student"><GameSession /></ProtectedRoute>} />
      <Route path="/student/results/:sessionId" element={<ProtectedRoute role="student"><ResultsPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
