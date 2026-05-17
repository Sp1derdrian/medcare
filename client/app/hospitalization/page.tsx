"use client";

import { useEffect, useState } from "react";

export default function HospitalizationPage() {
  const [salas, setSalas] = useState([]);
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("");
  const [error, setError] = useState("");

  // Función para obtener las salas del backend
  const fetchSalas = async () => {
    try {
      // Obtenemos el token guardado tras iniciar sesión
      const token = localStorage.getItem("token"); 
      
      const res = await fetch("http://localhost:4000/api/salas/todos", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        setSalas(data);
      } else {
        setError(data.error || "Error al cargar las salas. Asegúrate de haber iniciado sesión.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    }
  };

  // Cargar las salas apenas se abra la página
  useEffect(() => {
    fetchSalas();
  }, []);

  // Función para crear una nueva sala
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/salas/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ numero, tipo }),
      });

      if (res.ok) {
        // Limpiamos el formulario si se guardó bien
        setNumero("");
        setTipo("");
        // Volvemos a consultar la base de datos para actualizar la vista
        fetchSalas(); 
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear la sala");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión al guardar la sala");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestión de Salas Médicas</h1>

      {/* Alerta de errores */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Formulario para registrar nueva sala */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Registrar Nueva Sala</h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">Número / Identificador</label>
            <input 
              type="text" 
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej. 101, URG-4"
              required 
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Sala</label>
            <select 
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              required
            >
              <option value="" disabled>Seleccione un tipo...</option>
              <option value="Consultorio">Consultorio</option>
              <option value="Quirófano">Quirófano</option>
              <option value="Urgencias">Urgencias</option>
              <option value="Habitación">Habitación</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Guardar Sala
          </button>
        </form>
      </div>

      {/* Cuadrícula (Grid) para mostrar las tarjetas de las salas */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Salas Existentes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {salas.map((sala: any) => (
            <div key={sala.id_sala} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border-l-4 border-l-blue-500">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500">{sala.tipo}</span>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{sala.numero}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}