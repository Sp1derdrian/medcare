"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Stethoscope,
  Plus,
  Edit2,
  X,
  Save,
  Phone,
  BadgeCheck,
  ClipboardList,
  Filter,
} from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { PERMISOS } from "@/lib/utils"

type Especialidad = {
  id: number
  nombre: string
}

type Doctor = {
  id: number
  nombre: string
  apellido: string
  cedula_profesional: string
  telefono: string | null
  especialidades: Especialidad[]
}

type DoctorForm = {
  nombre: string
  apellido: string
  cedula_profesional: string
  telefono: string
  especialidades: number[]
}

const API_URL = "http://localhost:4000"

const formInicial: DoctorForm = {
  nombre: "",
  apellido: "",
  cedula_profesional: "",
  telefono: "",
  especialidades: [],
}

export default function DoctorsPage() {
  const [doctores, setDoctores] = useState<Doctor[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [form, setForm] = useState<DoctorForm>(formInicial)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [doctorEditandoId, setDoctorEditandoId] = useState<number | null>(null)

  const [filtroEspecialidad, setFiltroEspecialidad] = useState("")

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")

  const obtenerHeaders = () => {
    const token = localStorage.getItem("token")

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  const cargarDoctores = async () => {
    try {
      const response = await fetch(`${API_URL}/api/doctores/get/todos`, {
        headers: obtenerHeaders(),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "No se pudieron cargar los doctores")
      }

      const data = await response.json()
      setDoctores(data)
    } catch (error) {
      console.error("Error cargando doctores:", error)
      setError(error instanceof Error ? error.message : "Error al cargar doctores")
    }
  }

  const cargarEspecialidades = async () => {
    try {
      const response = await fetch(`${API_URL}/api/catalogos/especialidades`, {
        headers: obtenerHeaders(),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "No se pudieron cargar las especialidades")
      }

      const data = await response.json()
      setEspecialidades(data)
    } catch (error) {
      console.error("Error cargando especialidades:", error)
      setError(error instanceof Error ? error.message : "Error al cargar especialidades")
    }
  }

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError("")

      await Promise.all([
        cargarDoctores(),
        cargarEspecialidades(),
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

  const especialidadesOrdenadas = useMemo(() => {
    return [...especialidades].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
    )
  }, [especialidades])

  const doctoresFiltradosOrdenados = useMemo(() => {
    return doctores
      .filter((doctor) => {
        if (!filtroEspecialidad) {
          return true
        }

        return doctor.especialidades.some(
          (especialidad) => String(especialidad.id) === filtroEspecialidad
        )
      })
      .sort((a, b) => {
        const nombreA = `${a.nombre} ${a.apellido}`
        const nombreB = `${b.nombre} ${b.apellido}`

        return nombreA.localeCompare(nombreB, "es", { sensitivity: "base" })
      })
  }, [doctores, filtroEspecialidad])

  const limpiarFormulario = () => {
    setForm(formInicial)
    setDoctorEditandoId(null)
    setMostrarFormulario(false)
    setError("")
    setMensaje("")
  }

  const abrirFormularioCrear = () => {
    setForm(formInicial)
    setDoctorEditandoId(null)
    setMostrarFormulario(true)
    setError("")
    setMensaje("")
  }

  const abrirFormularioEditar = (doctor: Doctor) => {
    setForm({
      nombre: doctor.nombre,
      apellido: doctor.apellido,
      cedula_profesional: doctor.cedula_profesional,
      telefono: doctor.telefono || "",
      especialidades: doctor.especialidades.map((especialidad) => especialidad.id),
    })

    setDoctorEditandoId(doctor.id)
    setMostrarFormulario(true)
    setError("")
    setMensaje("")
  }

  const manejarCambioTexto = (campo: keyof DoctorForm, valor: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const manejarEspecialidad = (idEspecialidad: number) => {
    setForm((prev) => {
      const yaSeleccionada = prev.especialidades.includes(idEspecialidad)

      return {
        ...prev,
        especialidades: yaSeleccionada
          ? prev.especialidades.filter((id) => id !== idEspecialidad)
          : [...prev.especialidades, idEspecialidad],
      }
    })
  }

  const validarFormulario = () => {
    if (!form.nombre.trim()) {
      return "El nombre es obligatorio"
    }

    if (!form.apellido.trim()) {
      return "El apellido es obligatorio"
    }

    if (!form.cedula_profesional.trim()) {
      return "La cédula profesional es obligatoria"
    }

    if (form.especialidades.length === 0) {
      return "Selecciona al menos una especialidad"
    }

    return ""
  }

  const guardarDoctor = async (event: React.FormEvent) => {
    event.preventDefault()

    const errorValidacion = validarFormulario()

    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    setGuardando(true)
    setError("")
    setMensaje("")

    try {
      const esEdicion = doctorEditandoId !== null

      const url = esEdicion
        ? `${API_URL}/api/doctores/actualizar/${doctorEditandoId}`
        : `${API_URL}/api/doctores/crear`

      const method = esEdicion ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: obtenerHeaders(),
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          cedula_profesional: form.cedula_profesional.trim(),
          telefono: form.telefono.trim() || null,
          especialidades: form.especialidades,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar doctor")
      }

      setMensaje(esEdicion ? "Doctor actualizado exitosamente" : "Doctor creado exitosamente")
      await cargarDoctores()

      setTimeout(() => {
        limpiarFormulario()
      }, 600)
    } catch (error) {
      console.error("Error guardando doctor:", error)
      setError(error instanceof Error ? error.message : "Error al guardar doctor")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <RoleGuard permisoRequerido={PERMISOS.DOCTOR}>
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                <Stethoscope className="h-8 w-8 text-primary" />
                Módulo de Doctores
              </h1>
              <p className="mt-1 text-muted-foreground">
                Administra el directorio médico y sus especialidades.
              </p>
            </div>

            <button
              onClick={abrirFormularioCrear}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Nuevo doctor
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="mb-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-foreground">
              {mensaje}
            </div>
          )}

          {mostrarFormulario && (
            <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {doctorEditandoId ? "Editar doctor" : "Registrar nuevo doctor"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Completa los datos del médico y selecciona sus especialidades.
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

              <form onSubmit={guardarDoctor} className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Nombre
                    </label>
                    <input
                      value={form.nombre}
                      onChange={(event) => manejarCambioTexto("nombre", event.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                      placeholder="Ej. Luis"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Apellido
                    </label>
                    <input
                      value={form.apellido}
                      onChange={(event) => manejarCambioTexto("apellido", event.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                      placeholder="Ej. Hernández"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Cédula profesional
                    </label>
                    <input
                      value={form.cedula_profesional}
                      onChange={(event) => manejarCambioTexto("cedula_profesional", event.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                      placeholder="Ej. CED123456"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Teléfono
                    </label>
                    <input
                      value={form.telefono}
                      onChange={(event) => manejarCambioTexto("telefono", event.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                      placeholder="Ej. 3312345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-foreground">
                    Especialidades
                  </label>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {especialidades.map((especialidad) => {
                      const seleccionada = form.especialidades.includes(especialidad.id)

                      return (
                        <label
                          key={especialidad.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                            seleccionada
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:bg-muted/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={seleccionada}
                            onChange={() => manejarEspecialidad(especialidad.id)}
                            className="h-4 w-4 accent-primary"
                          />
                          {especialidad.nombre}
                        </label>
                      )
                    })}
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
                    {guardando ? "Guardando..." : doctorEditandoId ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/30 p-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <ClipboardList className="h-5 w-5" />
                Doctores registrados
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-muted-foreground">
                <thead className="bg-muted/50 text-xs uppercase text-foreground">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nombre</th>
                    <th className="px-6 py-4 font-semibold">Cédula</th>
                    <th className="px-6 py-4 font-semibold">Teléfono</th>
                    <th className="px-6 py-4 font-semibold">Especialidades</th>
                    <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {cargando ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Cargando doctores...
                      </td>
                    </tr>
                  ) : doctores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No hay doctores registrados.
                      </td>
                    </tr>
                  ) : (
                    doctores.map((doctor) => (
                      <tr key={doctor.id} className="transition hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Stethoscope className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {doctor.nombre} {doctor.apellido}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ID: {doctor.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                            {doctor.cedula_profesional}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {doctor.telefono || "Sin teléfono"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {doctor.especialidades.length === 0 ? (
                              <span className="text-muted-foreground italic">
                                Sin especialidades
                              </span>
                            ) : (
                              doctor.especialidades.map((especialidad) => (
                                <span
                                  key={especialidad.id}
                                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                >
                                  {especialidad.nombre}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => abrirFormularioEditar(doctor)}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}