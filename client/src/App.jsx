import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pomodoro from './pages/Pomodoro';
import Kanban from './pages/Kanban';
import HabitTracker from './pages/HabitTracker';
import SoundLounge from './pages/SoundLounge';
import Journal from './pages/Journal';
import ZenMode from './pages/ZenMode';
import Analytics from './pages/Analytics';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 15, 35, 0.95)',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                backdropFilter: 'blur(20px)',
              },
              success: { iconTheme: { primary: 'var(--accent, #8B5CF6)', secondary: '#fff' } },
              error: { iconTheme: { primary: '#EC4899', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Standalone Zen Mode route (No sidebar for ultra-clean focus) */}
            <Route
              path="/zen"
              element={
                <ProtectedRoute>
                  <ZenMode />
                </ProtectedRoute>
              }
            />

            {/* Protected routes with Standard Navigation layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="flex min-h-screen">
                    <Navbar />
                    <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                      <Dashboard />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/pomodoro"
              element={
                <ProtectedRoute>
                  <div className="flex min-h-screen">
                    <Navbar />
                    <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                      <Pomodoro />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/kanban"
              element={
                <ProtectedRoute>
                  <div className="flex min-h-screen">
                    <Navbar />
                    <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                      <Kanban />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/habits"
              element={
                <ProtectedRoute>
                  <div className="flex min-h-screen">
                    <Navbar />
                    <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                      <HabitTracker />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/lounge"
              element={
                <ProtectedRoute>
                  <div className="flex min-h-screen">
                    <Navbar />
                    <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                      <SoundLounge />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <div className="flex min-h-screen">
                    <Navbar />
                    <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                      <Journal />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <div className="flex min-h-screen">
                    <Navbar />
                    <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                      <Analytics />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
