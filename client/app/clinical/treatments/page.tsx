"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Plus, Trash2, Stethoscope, CalendarDays, AlertTriangle } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Paciente {
  id_paciente: number
  nombre: string
  apellido: string
}

interface Procedimiento {
  id: number
  nombre: string
}

interface Tratamiento {
  id_tratamiento: number
  descripcion: string
  fecha_inicio: string
  fecha_fin: string | null
  procedimientos: { id_procedimiento: number; nombre: string }[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function authHeaders() {
  const token = localStorage.getItem("token")
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function isActive(t: Tratamiento) {
  if (!t.fecha_fin) return true
  return new Date(t.fecha_fin + "T00:00:00") >= new Date()
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TratamientosPage() {
  // Patient search
  const [query, setQuery] = useState("")
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [showDrop, setShowDrop] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // Catalog
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([])

  // Treatments list
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [loadingTrat, setLoadingTrat] = useState(false)

  // Form
  const [descripcion, setDescripcion] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [seleccionados, setSeleccionados] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Date validation
  const fechaFinInvalida = !!fechaFin && !!fechaInicio && fechaFin < fechaInicio

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch(`${API}/api/catalogos/procedimientos`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setProcedimientos(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setPacientes([]); setShowDrop(false); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/pacientes/get/todos`, { headers: authHeaders() })
        const all: Paciente[] = await res.json()
        const q = query.toLowerCase()
        const filtered = all.filter(p =>
          `${p.nombre} ${p.apellido}`.toLowerCase().includes(q)
        )
        setPacientes(filtered.slice(0, 8))
        setShowDrop(true)
      } catch { /* ignore */ }
    }, 280)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDrop(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function cargarTratamientos(id: number) {
    setLoadingTrat(true)
    try {
      const res = await fetch(`${API}/api/tratamientos/paciente/${id}`, { headers: authHeaders() })
      const data = await res.json()
      setTratamientos(Array.isArray(data) ? data : [])
    } catch { setTratamientos([]) }
    finally { setLoadingTrat(false) }
  }

  function seleccionarPaciente(p: Paciente) {
    setPacienteSeleccionado(p)
    setQuery(`${p.nombre} ${p.apellido}`)
    setShowDrop(false)
    resetForm()
    cargarTratamientos(p.id_paciente)
  }

  function resetForm() {
    setDescripcion("")
    setFechaInicio("")
    setFechaFin("")
    setSeleccionados([])
    setSuccessMsg("")
    setErrorMsg("")
  }

  function toggleProcedimiento(id: number) {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pacienteSeleccionado || fechaFinInvalida) return
    setSaving(true)
    setErrorMsg("")
    setSuccessMsg("")
    try {
      const res = await fetch(`${API}/api/tratamientos/crear`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          id_paciente: pacienteSeleccionado.id_paciente,
          descripcion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin || undefined,
          procedimientos: seleccionados,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setErrorMsg(`Error ${res.status}: ${err?.error ?? "Error desconocido"}`)
        return
      }
      setSuccessMsg("Tratamiento registrado correctamente.")
      resetForm()
      cargarTratamientos(pacienteSeleccionado.id_paciente)
    } catch {
      setErrorMsg("No se pudo conectar con el servidor.")
    } finally {
      setSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const activos   = tratamientos.filter(isActive)
  const pasados   = tratamientos.filter(t => !isActive(t))

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tratamientos a Largo Plazo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registra y consulta los planes de tratamiento de cada paciente.
        </p>
      </div>

      {/* Patient search */}
      <div className="relative" ref={dropRef}>
        <label className="block text-sm font-medium text-foreground mb-1">Seleccionar paciente</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Buscar por nombre…"
            value={query}
            onChange={e => { setQuery(e.target.value); setPacienteSeleccionado(null) }}
          />
        </div>
        {showDrop && pacientes.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg text-sm overflow-hidden">
            {pacientes.map(p => (
              <li key={p.id_paciente}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => seleccionarPaciente(p)}
                >
                  {p.nombre} {p.apellido}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pacienteSeleccionado && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── New Treatment Form ─────────────────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Nuevo tratamiento
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Descripcion */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Descripción</label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Describe el plan de tratamiento…"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={fechaInicio}
                    onChange={e => setFechaInicio(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Fecha fin <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      fechaFinInvalida ? "border-destructive focus:ring-destructive" : "border-input"
                    }`}
                    value={fechaFin}
                    onChange={e => setFechaFin(e.target.value)}
                  />
                </div>
              </div>

              {/* Date warning */}
              {fechaFinInvalida && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  La fecha de fin no puede ser anterior a la fecha de inicio.
                </div>
              )}

              {/* Procedimientos */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Procedimientos médicos
                  {seleccionados.length > 0 && (
                    <span className="ml-2 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                      {seleccionados.length} seleccionado{seleccionados.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </label>
                <div className="rounded-lg border border-input bg-background max-h-44 overflow-y-auto divide-y divide-border">
                  {procedimientos.map(proc => (
                    <label
                      key={proc.id}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                    >
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={seleccionados.includes(proc.id)}
                        onChange={() => toggleProcedimiento(proc.id)}
                      />
                      {proc.nombre}
                    </label>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {successMsg && (
                <p className="text-xs text-green-600 dark:text-green-400">{successMsg}</p>
              )}
              {errorMsg && (
                <p className="text-xs text-destructive">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={saving || fechaFinInvalida || !descripcion.trim() || !fechaInicio}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando…" : "Registrar tratamiento"}
              </button>
            </form>
          </div>

          {/* ── Treatments List ────────────────────────────────────────────── */}
          <div className="space-y-4">
            {loadingTrat ? (
              <p className="text-sm text-muted-foreground">Cargando tratamientos…</p>
            ) : tratamientos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Este paciente aún no tiene tratamientos registrados.
              </div>
            ) : (
              <>
                {activos.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                      Activos ({activos.length})
                    </h3>
                    <ul className="space-y-3">
                      {activos.map(t => (
                        <TratamientoCard key={t.id_tratamiento} t={t} />
                      ))}
                    </ul>
                  </section>
                )}
                {pasados.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Finalizados ({pasados.length})
                    </h3>
                    <ul className="space-y-3">
                      {pasados.map(t => (
                        <TratamientoCard key={t.id_tratamiento} t={t} muted />
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Card component ───────────────────────────────────────────────────────────

function TratamientoCard({ t, muted = false }: { t: Tratamiento; muted?: boolean }) {
  return (
    <li className={`rounded-xl border p-4 space-y-2 ${muted ? "border-border bg-muted/30" : "border-primary/30 bg-card"}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-medium leading-snug ${muted ? "text-muted-foreground" : "text-foreground"}`}>
          {t.descripcion}
        </p>
        {!muted && (
          <span className="shrink-0 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5 font-medium">
            Activo
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          Inicio: {formatDate(t.fecha_inicio)}
        </span>
        {t.fecha_fin && (
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            Fin: {formatDate(t.fecha_fin)}
          </span>
        )}
      </div>

      {t.procedimientos.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {t.procedimientos.map(p => (
            <span
              key={p.id_procedimiento}
              className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground"
            >
              <Stethoscope className="h-3 w-3" />
              {p.nombre}
            </span>
          ))}
        </div>
      )}
    </li>
  )
}
