
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InstagramButton from './components/InstagramButton';
import Home from './pages/Home';
import StudentArea from './pages/StudentArea';
import AdminPanel from './pages/AdminPanel';
import MuralAlunos from './pages/MuralAlunos';
import { AuthCallbackHandler } from './services/authCallbackHandler';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute'; // Import ProtectedRoute

import ErrorBoundary from './components/ErrorBoundary';
import { SCHOOL_INFO } from './constants/schoolInfo';

const App: React.FC = () => {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>

          <div className="flex flex-col min-h-screen bg-white">
            <ErrorBoundary>
              <Navbar />

              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/aluno" element={
                    <ProtectedRoute allowedRoles={['student', 'admin']}>
                      <StudentArea />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  } />
                  <Route path="/mural" element={
                    <ProtectedRoute allowedRoles={['student', 'admin']}>
                      <MuralAlunos />
                    </ProtectedRoute>
                  } />
                  <Route path="/auth/callback" element={<AuthCallbackHandler />} />
                </Routes>
              </main>

              <Footer />
            </ErrorBoundary>

            {/* Floating Elements */}
            <InstagramButton />
            <a
              href={`https://wa.me/${SCHOOL_INFO.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 left-6 z-[100] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.064-4.516 10.066-10.066.002-5.385-4.502-9.768-10.066-9.768-5.548 0-10.065 4.515-10.068 10.066-.001 1.847.487 3.655 1.413 5.23l-.999 3.647 3.735-.979z" />
              </svg>
            </a>
          </div>

        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;
