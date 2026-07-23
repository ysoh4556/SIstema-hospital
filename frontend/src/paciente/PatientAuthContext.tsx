import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Patient } from '../api'

type PatientSession = Pick<Patient, 'id' | 'fullName' | 'patientCode' | 'documentNumber' | 'documentType'>

type PatientAuthContextType = {
  patient: PatientSession | null
  login: (session: PatientSession) => void
  logout: () => void
}

const STORAGE_KEY = 'siih_patient_session'

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined)

export function PatientAuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<PatientSession | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setPatient(JSON.parse(raw))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const login = (session: PatientSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setPatient(session)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setPatient(null)
  }

  return (
    <PatientAuthContext.Provider value={{ patient, login, logout }}>
      {children}
    </PatientAuthContext.Provider>
  )
}

export function usePatientAuth() {
  const ctx = useContext(PatientAuthContext)
  if (!ctx) throw new Error('usePatientAuth debe usarse dentro de PatientAuthProvider')
  return ctx
}