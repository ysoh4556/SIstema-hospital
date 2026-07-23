import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import type { PatientCreateRequest, DocumentType, Sex } from '../api'
import { Heart } from 'lucide-react'
import { usePatientAuth } from './PatientAuthContext'
import { EmergencyNotice } from './EmergencyNotice'

export default function RegistroPaciente() {
  const navigate = useNavigate()
  const { login } = usePatientAuth()

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const patient = await api.createPatient(formData)
      login({
        id: patient.id,
        fullName: patient.fullName,
        patientCode: patient.patientCode,
        documentNumber: patient.documentNumber,
        documentType: patient.documentType,
      })
      navigate('/paciente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar paciente')
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
          <h2 className="text-2xl font-bold text-slate-900">Registro de Paciente</h2>
          <p className="text-sm text-slate-500 mt-1 text-center">Hospital Universitario San Andrés</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombres</label>
              <input required type="text" className={inputClass} value={formData.firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Apellidos</label>
              <input required type="text" className={inputClass} value={formData.lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de documento</label>
              <select className={inputClass} value={formData.documentType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, documentType: e.target.value as DocumentType })}>
                <option value="CI">Cédula de Identidad</option>
                <option value="PASSPORT">Pasaporte</option>
                <option value="FOREIGN_ID">Documento extranjero</option>
                <option value="NONE">Ninguno</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>N.º Documento</label>
              <input required type="text" className={inputClass} value={formData.documentNumber || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, documentNumber: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fecha nacimiento</label>
              <input required type="date" className={inputClass} value={formData.birthDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, birthDate: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Sexo</label>
              <select className={inputClass} value={formData.sex}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, sex: e.target.value as Sex })}>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })} />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#1c526d] hover:bg-[#164256] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm">
            {loading ? 'Registrando...' : 'Crear cuenta y continuar'}
          </button>

          <p className="text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/paciente/login" className="text-[#1c526d] font-semibold hover:underline">
              Inicia sesión
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