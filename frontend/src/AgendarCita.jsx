import React, { useState } from 'react';
import { UserCheck, Stethoscope, Calendar, Clock, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

export default function AgendarCita() {
  const [paso, setPaso] = useState(1);
  
  // Estado para capturar la reserva
  const [formData, setFormData] = useState({
    documento: '',
    nombrePaciente: '',
    especialidadId: '',
    medicoId: '',
    fecha: '',
    hora: '',
    motivo: ''
  });

  // Datos de ejemplo (Luego los conectarás con tu API en el backend)
  const especialidades = [
    { id: '1', nombre: 'Medicina General' },
    { id: '2', nombre: 'Pediatría' },
    { id: '3', nombre: 'Cardiología' },
    { id: '4', nombre: 'Traumatología' }
  ];

  const medicos = [
    { id: '101', especialidadId: '1', nombre: 'Dr. Carlos Mendoza' },
    { id: '102', especialidadId: '2', nombre: 'Dra. Ana Gutiérrez' },
    { id: '103', especialidadId: '3', nombre: 'Dr. Roberto Siles' }
  ];

  const horariosDisponibles = ['08:00', '09:00', '10:30', '14:00', '15:30', '17:00'];

  const handleNext = () => setPaso((prev) => Math.min(prev + 1, 4));
  const handleBack = () => setPaso((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. CONSTRUCCIÓN DEL OBJETO (Con la estructura exacta que pide la base de datos)
  const payload = {
    documentNumber: formData.documento,
    specialtyId: formData.especialidadId,
    professionalId: formData.medicoId,
    // Combinamos la fecha y la hora en formato ISO que requiere Java/PostgreSQL
    startsAt: `${formData.fecha}T${formData.hora}:00.000Z`,
    endsAt: `${formData.fecha}T${formData.hora}:30:00.000Z`, // Asumimos 30 min de consulta
    reason: formData.motivo || 'Consulta médica general'
  };

  try {
    // 2. ENVÍO DEL JSON A LA API (Spring Boot)
    const response = await fetch('http://localhost:8080/api/v1/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Le avisa al servidor que estamos enviando un JSON
      },
      body: JSON.stringify(payload) // Convierte el objeto JavaScript a texto JSON
    });

    if (response.ok) {
      const data = await response.json();
      alert(`¡Cita agendada con éxito! Código de confirmación: ${data.appointmentCode || 'OK'}`);
    } else {
      alert('Error al agendar la cita. Verifique que los datos sean correctos.');
    }
  } catch (error) {
    console.error('Error al conectar con el servidor:', error);
    alert('No se pudo conectar con el backend de Spring Boot.');
  }
};

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md font-sans">
      <h1 className="text-2xl font-bold text-center text-blue-900 mb-2">
        Hospital Universitario San Andrés
      </h1>
      <p className="text-center text-gray-600 mb-6">Reserva de Citas Médicas en Línea</p>

      {/* Indicador de Pasos */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        {[
          { num: 1, label: 'Identificación', icon: UserCheck },
          { num: 2, label: 'Especialidad', icon: Stethoscope },
          { num: 3, label: 'Fecha y Hora', icon: Calendar },
          { num: 4, label: 'Confirmar', icon: CheckCircle },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = paso >= item.num;
          return (
            <div key={item.num} className={`flex items-center gap-2 ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                <Icon size={18} />
              </div>
              <span className="hidden sm:inline text-sm">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Contenido según el Paso */}
      <form onSubmit={handleSubmit}>
        {/* PASO 1: Identificación del Paciente */}
        {paso === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-800">1. Ingrese sus Datos Personales</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cédula de Identidad (C.I.) / Documento</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: 1234567"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: Juan Pérez"
                value={formData.nombrePaciente}
                onChange={(e) => setFormData({ ...formData, nombrePaciente: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* PASO 2: Selección de Especialidad y Médico */}
        {paso === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-800">2. Seleccione la Especialidad y Médico</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Especialidad Médica</label>
              <select
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.especialidadId}
                onChange={(e) => setFormData({ ...formData, especialidadId: e.target.value, medicoId: '' })}
              >
                <option value="">-- Seleccionar Especialidad --</option>
                {especialidades.map((esp) => (
                  <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                ))}
              </select>
            </div>

            {formData.especialidadId && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Médico Especialista</label>
                <select
                  required
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.medicoId}
                  onChange={(e) => setFormData({ ...formData, medicoId: e.target.value })}
                >
                  <option value="">-- Seleccionar Médico --</option>
                  {medicos
                    .filter((m) => m.especialidadId === formData.especialidadId)
                    .map((med) => (
                      <option key={med.id} value={med.id}>{med.nombre}</option>
                    ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* PASO 3: Fecha y Hora */}
        {paso === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-800">3. Seleccione Fecha y Turno</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha de Atención</label>
              <input
                type="date"
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Horarios Disponibles</label>
              <div className="grid grid-cols-3 gap-2">
                {horariosDisponibles.map((hora) => (
                  <button
                    key={hora}
                    type="button"
                    onClick={() => setFormData({ ...formData, hora })}
                    className={`p-2 text-sm rounded-md border text-center transition ${
                      formData.hora === hora ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {hora} hrs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Motivo de la Cita (Opcional)</label>
              <textarea
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                rows={2}
                placeholder="Breve descripción del malestar..."
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* PASO 4: Confirmación Resumen */}
        {paso === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-800">4. Resumen y Confirmación</h2>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm text-blue-900">
              <p><strong>Paciente:</strong> {formData.nombrePaciente} (C.I.: {formData.documento})</p>
              <p><strong>Fecha y Hora:</strong> {formData.fecha} a las {formData.hora} hrs</p>
              <p><strong>Motivo:</strong> {formData.motivo || 'Consulta general'}</p>
            </div>
          </div>
        )}

        {/* Botones de Navegación */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t">
          {paso > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 border rounded-md hover:bg-gray-100"
            >
              <ChevronLeft size={16} /> Atrás
            </button>
          ) : <div />}

          {paso < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (paso === 1 && (!formData.documento || !formData.nombrePaciente)) ||
                (paso === 2 && (!formData.especialidadId || !formData.medicoId)) ||
                (paso === 3 && (!formData.fecha || !formData.hora))
              }
              className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 text-sm bg-green-600 text-white font-medium rounded-md hover:bg-green-700 shadow"
            >
              Confirmar Cita
            </button>
          )}
        </div>
      </form>
    </div>
  );
}