import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { api } from '../api'
import type { DocumentType } from '../api'
import { usePatientAuth } from './PatientAuthContext'
import { EmergencyNotice } from './EmergencyNotice'

export default function PacienteLogin() {
  const navigate = useNavigate()
  const { login } = usePatientAuth()
  const [documentType, setDocumentType] = useState<DocumentType>('CI')
  const [documentNumber, setDocumentNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      login({
        id: match.id,
        fullName: match.fullName,
        patientCode: match.patientCode,
        documentNumber: match.documentNumber,
        documentType: match.documentType,
      })
      navigate('/paciente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1c526d]/40 focus:border-[#1c526d] transition'
  const labelClass = 'block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5'

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0f2e3d] flex items-center justify-center mb-4 shadow-lg">
            <Heart size={26} className="text-[#9ad3d6]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Ingresar a Mi Salud</h2>
          <p className="text-sm text-slate-500 mt-1 text-center">Hospital Universitario San Andrés</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5">
          <div>
            <label className={labelClass}>Tipo de documento</label>
            <select
              className={inputClass}
              value={documentType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDocumentType(e.target.value as DocumentType)}
            >
              <option value="CI">Cédula de Identidad</option>
              <option value="PASSPORT">Pasaporte</option>
              <option value="FOREIGN_ID">Documento extranjero</option>
              <option value="NONE">Ninguno</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Número de documento</label>
            <input
              required
              type="text"
              className={inputClass}
              placeholder="Ej. 8451236"
              value={documentNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocumentNumber(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1c526d] hover:bg-[#164256] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-slate-500">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/paciente/registro" className="text-[#1c526d] font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </form>

        <div className="mt-6">
          <EmergencyNotice />
        </div>
      </div>
    </div>
  )
}