import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
<<<<<<< HEAD
=======
import { PatientAuthProvider } from './paciente/PatientAuthContext' // ← Importar el context del paciente
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LandingPage } from './public/LandingPage'
import { LoginPage } from './public/LoginPage'
import Workspace from './Workspace'
<<<<<<< HEAD

// --- PORTAL DEL PACIENTE ---
=======
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06
import PortalPaciente from './paciente/PortalPaciente'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
<<<<<<< HEAD
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
=======
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
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06
      </AuthProvider>
    </BrowserRouter>
  )
}