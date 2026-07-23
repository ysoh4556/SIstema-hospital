import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { PatientAuthProvider } from './paciente/PatientAuthContext' // ← Importar el context del paciente
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LandingPage } from './public/LandingPage'
import { LoginPage } from './public/LoginPage'
import Workspace from './Workspace'
import PortalPaciente from './paciente/PortalPaciente'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PatientAuthProvider> {/* ← Envolver la app aquí */}
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/acceso" element={<LoginPage />} />

            {/* Rutas del Personal / Hospital */}
            <Route path="/app" element={<Navigate to="/app/inicio" replace />} />
            <Route path="/app/:view" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />

            {/* Portal del Paciente */}
            <Route path="/paciente/*" element={<PortalPaciente />} />

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PatientAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}