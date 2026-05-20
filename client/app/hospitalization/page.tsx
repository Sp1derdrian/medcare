"use client";

import { useState, useEffect } from "react";

export default function HospitalizationPage() {
  const [internados, setInternados] = useState([]);
  const [cargando, setCargando] = useState(true);

  // --- ESTADOS: MODAL NUEVO INGRESO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listaPacientes, setListaPacientes] = useState([]);
  const [listaSalas, setListaSalas] = useState([]);
  const [formData, setFormData] = useState({
    id_paciente: "", id_sala: "", fecha_ingreso: new Date().toISOString().split('T')[0]
  });

  // --- ESTADOS: MODAL DE CONSUMOS ---
  const [isConsumosModalOpen, setIsConsumosModalOpen] = useState(false);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<number | null>(null);
  const [listaMedicamentos, setListaMedicamentos] = useState([]);
  const [listaProcedimientos, setListaProcedimientos] = useState([]);
  const [tipoConsumo, setTipoConsumo] = useState("medicamento"); // 'medicamento' o 'procedimiento'
  const [consumoForm, setConsumoForm] = useState({
    id_item: "", periodo_administracion: "", observaciones: ""
  });

  // 1. CARGAR PACIENTES INTERNADOS (TABLA)
  const cargarInternados = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:4000/api/hospitalizaciones/activas", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setInternados(await response.json());
    } catch (error) {
      console.error("Error al cargar hospitalizaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  // 2. CATÁLOGOS PARA NUEVO INGRESO
  const cargarCatalogosIngreso = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const resSalas = await fetch("http://localhost:4000/api/salas/todos", { headers });
      if (resSalas.ok) setListaSalas(await resSalas.json());
      const resPacientes = await fetch("http://localhost:4000/api/pacientes/get/todos", { headers });
      if (resPacientes.ok) setListaPacientes(await resPacientes.json());
    } catch (error) {
      console.error("Error al cargar catálogos de ingreso:", error);
    }
  };

  // 3. CATÁLOGOS PARA CONSUMOS (APIs de Diego)
  const cargarCatalogosConsumos = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const resMed = await fetch("http://localhost:4000/api/catalogos/medicamentos", { headers });
      if (resMed.ok) setListaMedicamentos(await resMed.json());
      const resProc = await fetch("http://localhost:4000/api/catalogos/procedimientos", { headers });
      if (resProc.ok) setListaProcedimientos(await resProc.json());
    } catch (error) {
      console.error("Error al cargar catálogos de consumos:", error);
    }
  };

  // 4. GUARDAR NUEVO INGRESO (POST)
  const handleGuardarIngreso = async () => {
    if (!formData.id_paciente || !formData.id_sala) {
      alert("Por favor selecciona un paciente y una sala."); return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:4000/api/hospitalizaciones/ingreso", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ id_paciente: "", id_sala: "", fecha_ingreso: new Date().toISOString().split('T')[0] });
        cargarInternados();
      }
    } catch (error) {
      console.error("Error POST ingreso:", error);
    }
  };

  // 5. DAR DE ALTA (PUT)
  const handleDarDeAlta = async (id_hospitalizacion: number) => {
    if (!window.confirm("¿Estás seguro de que deseas dar de alta a este paciente?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/hospitalizaciones/alta/${id_hospitalizacion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ fecha_alta: new Date().toISOString().split('T')[0] })
      });
      if (response.ok) cargarInternados();
    } catch (error) {
      console.error("Error PUT alta:", error);
    }
  };

  // 6. GUARDAR CONSUMO (POST)
  const handleGuardarConsumo = async () => {
    if (!consumoForm.id_item) { alert("Selecciona un medicamento o procedimiento."); return; }
    
    try {
      const token = localStorage.getItem('token');
      const isMedicamento = tipoConsumo === "medicamento";
      const url = isMedicamento 
        ? "http://localhost:4000/api/hospitalizaciones/consumo-medicamento"
        : "http://localhost:4000/api/hospitalizaciones/consumo-procedimiento";
      
      const bodyPayload = isMedicamento 
        ? {
            id_hospitalizacion: pacienteSeleccionadoId,
            id_medicamento: consumoForm.id_item,
            periodo_administracion: consumoForm.periodo_administracion,
            observaciones: consumoForm.observaciones
          }
        : {
            id_hospitalizacion: pacienteSeleccionadoId,
            id_procedimiento: consumoForm.id_item
          };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(bodyPayload)
      });

      if (response.ok) {
        alert("Consumo registrado correctamente.");
        setIsConsumosModalOpen(false);
        setConsumoForm({ id_item: "", periodo_administracion: "", observaciones: "" });
      } else {
        alert("Error al registrar el consumo.");
      }
    } catch (error) {
      console.error("Error POST consumo:", error);
    }
  };

  // ABRIR MODALES
  const abrirModalIngreso = () => { cargarCatalogosIngreso(); setIsModalOpen(true); };
  const abrirModalConsumos = (id_hospitalizacion: number) => {
    setPacienteSeleccionadoId(id_hospitalizacion);
    cargarCatalogosConsumos();
    setIsConsumosModalOpen(true);
  };

  useEffect(() => { cargarInternados(); }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard de Piso</h1>
          <p className="text-gray-500 mt-2">Gestiona los pacientes internados, sus salas y consumos.</p>
        </div>
        <button onClick={abrirModalIngreso} className="bg-[#00b4d8] hover:bg-[#0096c7] text-white px-6 py-2 rounded-md font-semibold transition-colors shadow-sm">
          + Nuevo Ingreso
        </button>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
              <th className="p-4 font-semibold">Paciente</th>
              <th className="p-4 font-semibold">Sala</th>
              <th className="p-4 font-semibold">Fecha de Ingreso</th>
              <th className="p-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cargando ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">Cargando...</td></tr>
            : internados.length === 0 ? <tr><td colSpan={4} className="p-12 text-center text-gray-500">No hay pacientes internados.</td></tr>
            : internados.map((item: any) => (
                <tr key={item.id_hospitalizacion} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{item.paciente_nombre}</td>
                  <td className="p-4"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">{item.sala_numero} - {item.sala_tipo}</span></td>
                  <td className="p-4 text-gray-600">{new Date(item.fecha_ingreso).toLocaleDateString()}</td>
                  <td className="p-4 space-x-2">
                    <button onClick={() => abrirModalConsumos(item.id_hospitalizacion)} className="text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded transition-colors font-medium">
                      Consumos
                    </button>
                    <button onClick={() => handleDarDeAlta(item.id_hospitalizacion)} className="text-sm bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-3 py-1.5 rounded font-bold transition-colors">
                      Dar de Alta
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL: NUEVO INGRESO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Registrar Nuevo Ingreso</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                <select className="w-full border border-gray-300 rounded-md p-2" value={formData.id_paciente} onChange={(e) => setFormData({...formData, id_paciente: e.target.value})}>
                  <option value="">Selecciona un paciente...</option>
                  {listaPacientes.map((p: any) => <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} {p.apellido}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sala a asignar</label>
                <select className="w-full border border-gray-300 rounded-md p-2" value={formData.id_sala} onChange={(e) => setFormData({...formData, id_sala: e.target.value})}>
                  <option value="">Selecciona una sala...</option>
                  {listaSalas.map((s: any) => <option key={s.id_sala} value={s.id_sala}>Sala {s.numero} ({s.tipo})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                <input type="date" className="w-full border border-gray-300 rounded-md p-2" value={formData.fecha_ingreso} onChange={(e) => setFormData({...formData, fecha_ingreso: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
              <button onClick={handleGuardarIngreso} className="px-4 py-2 bg-[#00b4d8] text-white rounded-md">Guardar Ingreso</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: REGISTRAR CONSUMOS --- */}
      {isConsumosModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Registrar Consumo</h2>
            <div className="space-y-4">
              
              {/* Selector de tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Consumo</label>
                <select className="w-full border border-gray-300 rounded-md p-2" value={tipoConsumo} onChange={(e) => { setTipoConsumo(e.target.value); setConsumoForm({ id_item: "", periodo_administracion: "", observaciones: "" }); }}>
                  <option value="medicamento">Medicamento</option>
                  <option value="procedimiento">Procedimiento</option>
                </select>
              </div>

              {/* Selector Dinámico (Medicamento o Procedimiento) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar {tipoConsumo}</label>
                <select className="w-full border border-gray-300 rounded-md p-2" value={consumoForm.id_item} onChange={(e) => setConsumoForm({...consumoForm, id_item: e.target.value})}>
                  <option value="">Selecciona una opción...</option>
                  {tipoConsumo === "medicamento" 
                    ? listaMedicamentos.map((m: any) => <option key={m.id} value={m.id}>{m.nombre}</option>)
                    : listaProcedimientos.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)
                  }
                </select>
              </div>

              {/* Campos extra SOLO si es medicamento (Como lo pide tu Base de Datos) */}
              {tipoConsumo === "medicamento" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Periodo de Administración</label>
                    <input type="text" placeholder="Ej. Cada 8 horas" className="w-full border border-gray-300 rounded-md p-2" value={consumoForm.periodo_administracion} onChange={(e) => setConsumoForm({...consumoForm, periodo_administracion: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                    <input type="text" placeholder="Ej. Tomar con alimentos" className="w-full border border-gray-300 rounded-md p-2" value={consumoForm.observaciones} onChange={(e) => setConsumoForm({...consumoForm, observaciones: e.target.value})} />
                  </div>
                </>
              )}

            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setIsConsumosModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
              <button onClick={handleGuardarConsumo} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium">Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}