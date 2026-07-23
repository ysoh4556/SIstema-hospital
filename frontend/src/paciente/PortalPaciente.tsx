import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { Calendar, FileText, Activity, LogOut, Heart, User } from 'lucide-react'
import { api } from '../api'
import type { Specialty, Professional, AppointmentCreateRequest } from '../api'

export default function PortalPaciente() {
  const location = useLocation()

  const navItems = [
    { to: '/paciente/agendar', label: 'Citas', icon: Calendar },
    { to: '/paciente/resultados', label: 'Resultados', icon: Activity },
    { to: '/paciente/recetas', label: 'Recetas', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#0f2e3d] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1c526d] flex items-center justify-center">
              <Heart size={20} className="text-[#9ad3d6]" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Mi Salud</h1>
              <p className="text-xs text-[#9ad3d6] tracking-wide">Hospital Universitario San Andrés</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#1c526d] text-white shadow-inner'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 ml-2 transition-colors"
            >
              <LogOut size={16} />
              Salir
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <Routes>
          <Route path="agendar" element={<AgendarCita />} />
          <Route path="resultados" element={<PlaceholderCard text="Tus resultados de laboratorio validados aparecerán aquí pronto." />} />
          <Route path="recetas" element={<PlaceholderCard text="Tus recetas médicas activas aparecerán aquí pronto." />} />
          <Route path="*" element={<AgendarCita />} />
        </Routes>
      </main>
    </div>
  )
}

function PlaceholderCard({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
      {text}
    </div>
  )
}

function AgendarCita() {
  const [especialidades, setEspecialidades] = useState<Specialty[]>([])
  const [medicos, setMedicos] = useState<Professional[]>([])

  const [formData, setFormData] = useState({
    patientId: 'UUID-DEL-PACIENTE-LOGUEADO',
    specialtyId: '',
    professionalId: '',
    fecha: '',
    hora: '',
    reason: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getSpecialties().then(setEspecialidades).catch(console.error)
    api.getProfessionals().then(setMedicos).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: AppointmentCreateRequest = {
        patientId: formData.patientId,
        specialtyId: formData.specialtyId,
        professionalId: formData.professionalId,
        startsAt: `${formData.fecha}T${formData.hora}:00Z`,
        endsAt: `${formData.fecha}T${formData.hora}:30Z`,
        reason: formData.reason,
        idempotencyKey: crypto.randomUUID()
      }

      await api.createAppointment(payload)
      alert('¡Tu cita médica ha sido agendada con éxito!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hubo un error al agendar la cita.'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1c526d]/40 focus:border-[#1c526d] transition'

  const labelClass = 'block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#1c526d] uppercase tracking-widest mb-1">Portal del paciente</p>
        <h2 className="text-2xl font-bold text-slate-900">Agendar nueva cita</h2>
        <p className="text-sm text-slate-500 mt-1">Completa los datos para reservar tu consulta médica.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Especialidad</label>
            <select
              required
              className={inputClass}
              value={formData.specialtyId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, specialtyId: e.target.value })}
            >
              <option value="">Seleccione una especialidad</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>{esp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Médico</label>
            <select
              required
              className={inputClass}
              value={formData.professionalId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, professionalId: e.target.value })}
            >
              <option value="">Seleccione un médico</option>
              {medicos.map((med) => (
                <option key={med.id} value={med.id}>{med.displayName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Fecha</label>
            <input
              required
              type="date"
              className={inputClass}
              value={formData.fecha}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fecha: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Hora</label>
            <input
              required
              type="time"
              className={inputClass}
              value={formData.hora}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, hora: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Motivo (opcional)</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder="Describe brevemente el motivo de tu consulta"
            value={formData.reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1c526d] hover:bg-[#164256] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
        >
          {loading ? 'Procesando...' : 'Confirmar cita médica'}
        </button>
      </form>
    </div>
  )
}