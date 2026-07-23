import { ArrowLeft, Eye, EyeOff, HeartPulse, IdCard, LockKeyhole, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import heroImage from '../assets/siih-hero.png'
import { useAuth } from '../auth/auth-context'
import { demoPassword, demoProfiles } from '../auth/demoAccounts'
import { api } from '../api'
import type { DocumentType, PatientCreateRequest, Sex } from '../api'
import './PublicPages.css'

const PATIENT_STORAGE_KEY = 'siih_patient_session'

type AccessMode = 'staff' | 'patient'
type PatientView = 'login' | 'register'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState<AccessMode>('staff')

  // --- Estado: personal del hospital (sin cambios) ---
  const [username, setUsername] = useState('recepcion')
  const [password, setPassword] = useState(demoPassword)
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/app/inicio" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    const result = await login(username, password, remember)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    const destination = (location.state as { from?: string } | null)?.from ?? '/app/inicio'
    navigate(destination, { replace: true })
  }

  return (
    <main className="login-page">
      <section className="login-visual" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="login-visual-shade" aria-hidden="true" />
        <Link className="public-brand login-brand" to="/">
          <span className="public-brand-mark"><HeartPulse aria-hidden="true" /></span>
          <span><strong>SIIH</strong><small>Hospital Universitario San Andrés</small></span>
        </Link>
        <div className="login-visual-copy">
          <span className="landing-kicker">Atención conectada</span>
          <h1>La información clínica y operativa, donde se necesita.</h1>
          <p>Acceso controlado para admisión, atención clínica, laboratorio, farmacia, caja, dirección y pacientes.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <Link className="login-back" to="/"><ArrowLeft aria-hidden="true" /> Volver al inicio</Link>

          {/* Selector de tipo de acceso */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6 mt-2">
            <button
              type="button"
              onClick={() => setMode('staff')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'staff' ? 'bg-white text-[#0f2e3d] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Stethoscope size={16} />
              Personal del hospital
            </button>
            <button
              type="button"
              onClick={() => setMode('patient')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'patient' ? 'bg-white text-[#0f2e3d] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserRound size={16} />
              Soy paciente
            </button>
          </div>

          {mode === 'staff' ? (
            <>
              <div className="login-heading">
                <span className="login-security"><ShieldCheck aria-hidden="true" /> Entorno académico protegido</span>
                <h2>Ingresar al SIIH</h2>
                <p>Utiliza tu cuenta institucional para continuar.</p>
              </div>

              <form className="login-form" onSubmit={(event) => void submit(event)}>
                <label>
                  Perfil de demostración
                  <select value={username} onChange={(event) => setUsername(event.target.value)}>
                    {demoProfiles.map((profile) => <option value={profile.username} key={profile.username}>{profile.displayName} · {profile.username}</option>)}
                  </select>
                </label>
                <label>
                  Usuario
                  <span className="login-input"><UserRound aria-hidden="true" /><input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} /></span>
                </label>
                <label>
                  Contraseña
                  <span className="login-input"><LockKeyhole aria-hidden="true" /><input autoComplete="current-password" required type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button></span>
                </label>
                <label className="remember-field"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Recordar sesión en este equipo</span></label>
                {error && <div className="login-error" role="alert">{error}</div>}
                <button className="login-submit" type="submit" disabled={submitting}>{submitting ? 'Verificando acceso...' : 'Ingresar al sistema'}</button>
              </form>

              <div className="demo-note"><strong>Clave del entorno:</strong> <code>{demoPassword}</code></div>
              <p className="login-legal">No utilices datos reales de pacientes en este entorno académico.</p>
            </>
          ) : (
            <PatientAccess />
          )}
        </div>
      </section>
    </main>
  )
}

function PatientAccess() {
  const [view, setView] = useState<PatientView>('login')
  return view === 'login' ? <PatientLoginForm onSwitch={() => setView('register')} /> : <PatientRegisterForm onSwitch={() => setView('login')} />
}

function saveSessionAndGo(navigate: ReturnType<typeof useNavigate>, session: Record<string, unknown>) {
  localStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(session))
  navigate('/paciente', { replace: true })
}

function PatientLoginForm({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate()
  const [documentType, setDocumentType] = useState<DocumentType>('CI')
  const [documentNumber, setDocumentNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputClass = 'w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1c526d]/40 focus:border-[#1c526d] transition'
  const labelClass = 'block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const results = await api.getPatients(documentNumber, 0, 5)
      const match = results.content.find(
        (p) => p.documentNumber === documentNumber && p.documentType === documentType
      )
      if (!match) {
        setError('No encontramos un paciente con ese documento. Verifica los datos o crea una cuenta.')
        return
      }
      saveSessionAndGo(navigate, {
        id: match.id,
        fullName: match.fullName,
        patientCode: match.patientCode,
        documentNumber: match.documentNumber,
        documentType: match.documentType,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c526d] bg-[#1c526d]/10 px-2.5 py-1 rounded-full mb-3">
          <ShieldCheck size={13} /> Portal del paciente
        </span>
        <h2 className="text-2xl font-bold text-slate-900">Ingresar a Mi Salud</h2>
        <p className="text-sm text-slate-500 mt-1">Agenda tus citas y revisa tu información médica.</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label className={labelClass}>Tipo de documento</label>
          <select
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c526d]/40 focus:border-[#1c526d] transition"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          >
            <option value="CI">Cédula de Identidad</option>
            <option value="PASSPORT">Pasaporte</option>
            <option value="FOREIGN_ID">Documento extranjero</option>
            <option value="NONE">Ninguno</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Número de documento</label>
          <div className="relative">
            <IdCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              required
              type="text"
              className={inputClass}
              placeholder="Ej. 8451236"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1c526d] hover:bg-[#164256] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
        >
          {loading ? 'Verificando...' : 'Ingresar'}
        </button>

        <p className="text-center text-sm text-slate-500">
          ¿Aún no tienes cuenta?{' '}
          <button type="button" onClick={onSwitch} className="text-[#1c526d] font-semibold hover:underline">
            Regístrate aquí
          </button>
        </p>
      </form>

      <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-6">
        <p className="text-xs text-red-700">
          ¿Es una emergencia? Llama al <a href="tel:911" className="font-bold underline">911</a> o Urgencias:{' '}
          <a href="tel:+59122345678" className="font-bold underline">(2) 234-5678</a>
        </p>
      </div>
    </div>
  )
}

function PatientRegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<PatientCreateRequest>({
    firstName: '',
    lastName: '',
    documentType: 'CI' as DocumentType,
    documentNumber: '',
    birthDate: '',
    sex: 'NOT_DECLARED' as Sex,
    phone: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputClass = 'w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1c526d]/40 focus:border-[#1c526d] transition'
  const labelClass = 'block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const patient = await api.createPatient(formData)
      saveSessionAndGo(navigate, {
        id: patient.id,
        fullName: patient.fullName,
        patientCode: patient.patientCode,
        documentNumber: patient.documentNumber,
        documentType: patient.documentType,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar paciente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c526d] bg-[#1c526d]/10 px-2.5 py-1 rounded-full mb-3">
          <ShieldCheck size={13} /> Portal del paciente
        </span>
        <h2 className="text-2xl font-bold text-slate-900">Crear cuenta de paciente</h2>
        <p className="text-sm text-slate-500 mt-1">Regístrate para agendar citas y ver tus resultados.</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nombres</label>
            <input required type="text" className={inputClass} value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Apellidos</label>
            <input required type="text" className={inputClass} value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Tipo de documento</label>
            <select className={inputClass} value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value as DocumentType })}>
              <option value="CI">Cédula de Identidad</option>
              <option value="PASSPORT">Pasaporte</option>
              <option value="FOREIGN_ID">Documento extranjero</option>
              <option value="NONE">Ninguno</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>N.º Documento</label>
            <input required type="text" className={inputClass} value={formData.documentNumber || ''}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Fecha nacimiento</label>
            <input required type="date" className={inputClass} value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Sexo</label>
            <select className={inputClass} value={formData.sex}
              onChange={(e) => setFormData({ ...formData, sex: e.target.value as Sex })}>
              <option value="FEMALE">Femenino</option>
              <option value="MALE">Masculino</option>
              <option value="INTERSEX">Intersex</option>
              <option value="NOT_DECLARED">Prefiero no decir</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Correo electrónico</label>
          <input type="email" className={inputClass} value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1c526d] hover:bg-[#164256] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
        >
          {loading ? 'Registrando...' : 'Crear cuenta y continuar'}
        </button>

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <button type="button" onClick={onSwitch} className="text-[#1c526d] font-semibold hover:underline">
            Inicia sesión
          </button>
        </p>
      </form>
    </div>
  )
}