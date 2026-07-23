import { ShieldAlert, Phone } from 'lucide-react'

export function EmergencyNotice() {
  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
      <ShieldAlert size={20} className="text-red-500 shrink-0" />
      <p className="text-sm text-red-700">
        ¿Es una emergencia? Llama de inmediato al{' '}
        <a href="tel:911" className="font-bold underline">911</a> o comunícate con Urgencias:{' '}
        <a href="tel:+59122345678" className="font-bold underline">(2) 234-5678</a>
      </p>
    </div>
  )
}

export function EmergencyStrip() {
  return (
    <div className="bg-red-600 text-white text-xs sm:text-sm">
      <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-center gap-2">
        <Phone size={14} />
        <span>Emergencias 24/7: <a href="tel:911" className="font-bold underline">911</a> · Ambulancia: <a href="tel:+59122345678" className="font-bold underline">(2) 234-5678</a></span>
      </div>
    </div>
  )
}