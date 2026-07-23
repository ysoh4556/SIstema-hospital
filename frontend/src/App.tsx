import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LandingPage } from './public/LandingPage'
import { LoginPage } from './public/LoginPage'
import Workspace from './Workspace'

// --- PORTAL DEL PACIENTE ---
import PortalPaciente from './paciente/PortalPaciente'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas y del Personal */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/acceso" element={<LoginPage />} />
          <Route path="/app" element={<Navigate to="/app/inicio" replace />} />
          <Route path="/app/:view" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />

          {/* Portal del Paciente: login, registro y dashboard viven TODOS dentro de PortalPaciente */}
          <Route path="/paciente/*" element={<PortalPaciente />} />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}