"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Plus,
  Save,
  X,
  UserRound,
  Stethoscope,
  Clock,
  ClipboardList,
  RefreshCcw,
  Search,
  Filter,
} from "lucide-react"

type Paciente = {
  id_paciente: number
  nombre: string
  apellido: string
  telefono?: string | null
  email?: string | null
}

type Doctor = {
  id: number
  nombre: string
  apellido: string
  cedula_profesional: string
  telefono: string | null
}

type TipoCita = {
  id: number
  descripcion: string
}

type EstadoCita = "Pendiente" | "Confirmada" | "Cancelada" | "Completada"

type Cita = {
  id: number
  id_paciente: number
  id_doctor: number
  id_usuario: number
  id_tipo_cita: number
  fecha: string
  estado: EstadoCita
  paciente_nombre: string
  paciente_apellido: string
  paciente: string
  doctor_nombre: string
  doctor_apellido: string
  doctor: string
  tipo_cita: string
  usuario_registro: string
}

type CitaForm = {
  id_paciente: string
  pacienteBusqueda: string
  id_doctor: string
  id_tipo_cita: string
  fecha: string
}

const API_URL = "http://localhost:4000"

const estadosCita: EstadoCita[] = [
  "Pendiente",
  "Confirmada",
  "Completada",
  "Cancelada",
]

const formInicial: CitaForm = {
  id_paciente: "",
  pacienteBusqueda: "",
  id_doctor: "",
  id_tipo_cita: "",
  fecha: "",
}

export default function AppointmentsPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [doctores, setDoctores] = useState<Doctor[]>([])
  const [tiposCita, setTiposCita] = useState<TipoCita[]>([])
  const [form, setForm] = useState<CitaForm>(formInicial)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarSugerenciasPacientes, setMostrarSugerenciasPacientes] = useState(false)

  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroTipoCita, setFiltroTipoCita] = useState("")
  const [limiteCitas, setLimiteCitas] = useState(5)
  const [paginaActual, setPaginaActual] = useState(1)

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [actualizandoEstadoId, setActualizandoEstadoId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")

  const obtenerHeaders = () => {
    const token = localStorage.getItem("token")

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  const cargarCitas = async () => {
    const response = await fetch(`${API_URL}/api/citas/get/todas`, {
      headers: obtenerHeaders(),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || "No se pudieron cargar las citas")
    }

    const data = await response.json()
    setCitas(data)
  }

  const cargarPacientes = async () => {
    const response = await fetch(`${API_URL}/api/pacientes/get/todos`, {
      headers: obtenerHeaders(),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || "No se pudieron cargar los pacientes")
    }

    const data = await response.json()
    setPacientes(data)
  }

  const cargarDoctores = async () => {
    const response = await fetch(`${API_URL}/api/doctores/get/todos`, {
      headers: obtenerHeaders(),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || "No se pudieron cargar los doctores")
    }

    const data = await response.json()
    setDoctores(data)
  }

  const cargarTiposCita = async () => {
    const response = await fetch(`${API_URL}/api/catalogos/tipos-cita`, {
      headers: obtenerHeaders(),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || "No se pudieron cargar los tipos de cita")
    }

    const data = await response.json()
    setTiposCita(data)
  }

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError("")
      setMensaje("")

      await Promise.all([
        cargarCitas(),
        cargarPacientes(),
        cargarDoctores(),
        cargarTiposCita(),
      ])
    } catch (error) {
      console.error("Error cargando datos:", error)
      setError(error instanceof Error ? error.message : "Error al cargar datos")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    setPaginaActual(1)
  }, [filtroTexto, filtroEstado, filtroTipoCita, limiteCitas])

  const pacientesCoincidentes = useMemo(() => {
    const busqueda = form.pacienteBusqueda.trim().toLowerCase()

    if (!busqueda) {
      return []
    }

    return pacientes
      .filter((paciente) => {
        const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`.toLowerCase()
        const telefono = paciente.telefono?.toLowerCase() || ""
        const email = paciente.email?.toLowerCase() || ""

        return (
          nombreCompleto.includes(busqueda) ||
          telefono.includes(busqueda) ||
          email.includes(busqueda)
        )
      })
      .slice(0, 8)
  }, [form.pacienteBusqueda, pacientes])

  const citasFiltradas = useMemo(() => {
    const texto = filtroTexto.trim().toLowerCase()
    const ahora = new Date().getTime()

    return citas
      .filter((cita) => {
        const coincideTexto =
          !texto ||
          cita.paciente.toLowerCase().includes(texto) ||
          cita.doctor.toLowerCase().includes(texto) ||
          cita.tipo_cita.toLowerCase().includes(texto) ||
          cita.estado.toLowerCase().includes(texto)

        const coincideEstado =
          !filtroEstado || cita.estado === filtroEstado

        const coincideTipo =
          !filtroTipoCita || String(cita.id_tipo_cita) === filtroTipoCita

        return coincideTexto && coincideEstado && coincideTipo
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fecha).getTime()
        const fechaB = new Date(b.fecha).getTime()

        const aEsProxima = fechaA >= ahora
        const bEsProxima = fechaB >= ahora

        if (aEsProxima && bEsProxima) {
          return fechaA - fechaB
        }

        if (!aEsProxima && !bEsProxima) {
          return fechaB - fechaA
        }

        return aEsProxima ? -1 : 1
      })
  }, [citas, filtroTexto, filtroEstado, filtroTipoCita])

  const totalPaginas = Math.max(1, Math.ceil(citasFiltradas.length / limiteCitas))

  const citasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * limiteCitas
    const fin = inicio + limiteCitas

    return citasFiltradas.slice(inicio, fin)
  }, [citasFiltradas, limiteCitas, paginaActual])

  const limpiarFormulario = () => {
    setForm(formInicial)
    setMostrarFormulario(false)
    setMostrarSugerenciasPacientes(false)
    setError("")
    setMensaje("")
  }

  const abrirFormulario = () => {
    setForm(formInicial)
    setMostrarFormulario(true)
    setMostrarSugerenciasPacientes(false)
    setError("")
    setMensaje("")
  }

  const manejarCambio = (campo: keyof CitaForm, valor: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const manejarBusquedaPaciente = (valor: string) => {
    setForm((prev) => ({
      ...prev,
      pacienteBusqueda: valor,
      id_paciente: "",
    }))

    setMostrarSugerenciasPacientes(true)
  }

  const seleccionarPaciente = (paciente: Paciente) => {
    setForm((prev) => ({
      ...prev,
      id_paciente: String(paciente.id_paciente),
      pacienteBusqueda: `${paciente.nombre} ${paciente.apellido}`,
    }))

    setMostrarSugerenciasPacientes(false)
  }

  const validarFormulario = () => {
    if (!form.id_paciente) {
      return "Selecciona un paciente de la lista de coincidencias"
    }

    if (!form.id_doctor) {
      return "Selecciona un doctor"
    }

    if (!form.id_tipo_cita) {
      return "Selecciona un tipo de cita"
    }

    if (!form.fecha) {
      return "Selecciona fecha y hora"
    }

    return ""
  }

  const crearCita = async (event: React.FormEvent) => {
    event.preventDefault()

    const errorValidacion = validarFormulario()

    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    try {
      setGuardando(true)
      setError("")
      setMensaje("")

      const response = await fetch(`${API_URL}/api/citas/crear`, {
        method: "POST",
        headers: obtenerHeaders(),
        body: JSON.stringify({
          id_paciente: Number(form.id_paciente),
          id_doctor: Number(form.id_doctor),
          id_tipo_cita: Number(form.id_tipo_cita),
          fecha: form.fecha,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear la cita")
      }

      setMensaje("Cita agendada exitosamente")
      await cargarCitas()
      setPaginaActual(1)

      setTimeout(() => {
        limpiarFormulario()
      }, 600)
    } catch (error) {
      console.error("Error creando cita:", error)
      setError(error instanceof Error ? error.message : "Error al crear cita")
    } finally {
      setGuardando(false)
    }
  }

  const actualizarEstado = async (idCita: number, estado: EstadoCita) => {
    try {
      setActualizandoEstadoId(idCita)
      setError("")
      setMensaje("")

      const response = await fetch(`${API_URL}/api/citas/actualizar-estado/${idCita}`, {
        method: "PUT",
        headers: obtenerHeaders(),
        body: JSON.stringify({ estado }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar el estado")
      }

      setMensaje("Estado actualizado correctamente")
      await cargarCitas()
    } catch (error) {
      console.error("Error actualizando estado:", error)
      setError(error instanceof Error ? error.message : "Error al actualizar estado")
    } finally {
      setActualizandoEstadoId(null)
    }
  }

  const formatearFecha = (fecha: string) => {
    const fechaObj = new Date(fecha)

    if (Number.isNaN(fechaObj.getTime())) {
      return fecha
    }

    return fechaObj.toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  const obtenerClaseEstado = (estado: EstadoCita) => {
    if (estado === "Pendiente") {
      return "bg-muted text-muted-foreground"
    }

    if (estado === "Confirmada") {
      return "bg-primary/10 text-primary"
    }

    if (estado === "Completada") {
      return "bg-accent/10 text-foreground"
    }

    return "bg-destructive/10 text-destructive"
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
              <CalendarDays className="h-8 w-8 text-primary" />
              Agenda y Citas
            </h1>
            <p className="mt-1 text-muted-foreground">
              Agenda nuevas citas y administra el estado de atención.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={cargarDatos}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              type="button"
            >
              <RefreshCcw className="h-4 w-4" />
              Recargar
            </button>

            <button
              onClick={abrirFormulario}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Agendar cita
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="mb-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground">
            {mensaje}
          </div>
        )}

        {mostrarFormulario && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Agendar cita
                </h2>
                <p className="text-sm text-muted-foreground">
                  Escribe el nombre del paciente y selecciona una coincidencia.
                </p>
              </div>

              <button
                onClick={limpiarFormulario}
                className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={crearCita} className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Paciente
                  </label>

                  <input
                    value={form.pacienteBusqueda}
                    onChange={(event) => manejarBusquedaPaciente(event.target.value)}
                    onFocus={() => setMostrarSugerenciasPacientes(true)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                    placeholder="Escribe nombre, teléfono o correo"
                  />

                  {mostrarSugerenciasPacientes && form.pacienteBusqueda && (
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                      {pacientesCoincidentes.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          No hay pacientes coincidentes.
                        </div>
                      ) : (
                        pacientesCoincidentes.map((paciente) => (
                          <button
                            key={paciente.id_paciente}
                            type="button"
                            onClick={() => seleccionarPaciente(paciente)}
                            className="block w-full border-b border-border px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-muted"
                          >
                            <p className="font-medium text-foreground">
                              {paciente.nombre} {paciente.apellido}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {paciente.telefono || "Sin teléfono"}
                              {paciente.email ? ` · ${paciente.email}` : ""}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {form.id_paciente && (
                    <p className="mt-2 text-xs text-primary">
                      Paciente seleccionado correctamente.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Doctor
                  </label>
                  <select
                    value={form.id_doctor}
                    onChange={(event) => manejarCambio("id_doctor", event.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Selecciona un doctor</option>
                    {doctores.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.nombre} {doctor.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Tipo de cita
                  </label>
                  <select
                    value={form.id_tipo_cita}
                    onChange={(event) => manejarCambio("id_tipo_cita", event.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Selecciona un tipo de cita</option>
                    {tiposCita.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Fecha y hora
                  </label>
                  <input
                    type="datetime-local"
                    value={form.fecha}
                    onChange={(event) => manejarCambio("fecha", event.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {guardando ? "Guardando..." : "Guardar cita"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-5 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Filtros de citas
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={filtroTexto}
                  onChange={(event) => setFiltroTexto(event.target.value)}
                  className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                  placeholder="Buscar por paciente, doctor, tipo o estado"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(event) => setFiltroEstado(event.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                <option value="">Todos</option>
                {estadosCita.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Tipo de cita
              </label>
              <select
                value={filtroTipoCita}
                onChange={(event) => setFiltroTipoCita(event.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                <option value="">Todos</option>
                {tiposCita.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando página {paginaActual} de {totalPaginas}. Total: {citasFiltradas.length} citas coincidentes.
            </p>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">
                Ver:
              </label>
              <select
                value={limiteCitas}
                onChange={(event) => {
                  setLimiteCitas(Number(event.target.value))
                  setPaginaActual(1)
                }}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                <option value={5}>5 citas</option>
                <option value={20}>20 citas</option>
                <option value={50}>50 citas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/30 p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <ClipboardList className="h-5 w-5" />
              Citas programadas
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Primero se muestran las próximas citas; después, las citas pasadas de la más reciente a la más antigua.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-xs uppercase text-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Fecha/Hora</th>
                  <th className="px-6 py-4 font-semibold">Paciente</th>
                  <th className="px-6 py-4 font-semibold">Doctor</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {cargando ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      Cargando citas...
                    </td>
                  </tr>
                ) : citasPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No hay citas que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  citasPaginadas.map((cita) => (
                    <tr key={cita.id} className="transition hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">
                              {formatearFecha(cita.fecha)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {cita.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {cita.paciente}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {cita.doctor}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {cita.tipo_cita}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${obtenerClaseEstado(cita.estado)}`}
                          >
                            {cita.estado}
                          </span>

                          <select
                            value={cita.estado}
                            disabled={actualizandoEstadoId === cita.id}
                            onChange={(event) =>
                              actualizarEstado(cita.id, event.target.value as EstadoCita)
                            }
                            className="w-fit rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {estadosCita.map((estado) => (
                              <option key={estado} value={estado}>
                                {estado}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Página {paginaActual} de {totalPaginas}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>

            <button
              type="button"
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}