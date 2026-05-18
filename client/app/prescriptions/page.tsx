"use client"

import { useEffect, useState, useRef } from "react"
import {
  ClipboardList,
  Search,
  X,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react"

const API_URL = "http://localhost:4000"

interface Cita {
  id_cita: number
  fecha: string
  estado: string
  paciente_nombre: string
  doctor_nombre: string
  tipo_cita: string
}

interface Medicamento {
  id_medicamento: number
  nombre: string
}

interface LineaMed {
  key: number
  id_medicamento: string
  dosis: string
  frecuencia: string
  periodo_administracion: string
  observaciones: string
}

interface MedReceta {
  id_receta_medicamento: number
  id_medicamento: number
  nombre: string
  dosis: string
  frecuencia: string
  periodo_administracion: string | null
  observaciones: string | null
}

interface Receta {
  id_receta: number
  fecha: string
  medicamentos: MedReceta[]
}

const lineaVacia = (key: number): LineaMed => ({
  key,
  id_medicamento: "",
  dosis: "",
  frecuencia: "",
  periodo_administracion: "",
  observaciones: "",
})

const estadoColor: Record<string, string> = {
  Completada: "bg-accent/10 text-accent border-accent/30",
  Confirmada:  "bg-primary/10 text-primary border-primary/30",
  Pendiente:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  Cancelada:   "bg-destructive/10 text-destructive border-destructive/30",
}

export default function PrescriptionsPage() {
  const [citas, setCitas]                       = useState<Cita[]>([])
  const [medicamentos, setMedicamentos]         = useState<Medicamento[]>([])
  const [busqueda, setBusqueda]                 = useState("")
  const [mostrarDropdown, setMostrarDropdown]   = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [recetaExistente, setRecetaExistente]   = useState<Receta | null | undefined>(undefined)
  const [cargandoReceta, setCargandoReceta]     = useState(false)
  const [lineas, setLineas]                     = useState<LineaMed[]>([lineaVacia(0)])
  const [nextKey, setNextKey]                   = useState(1)
  const [guardando, setGuardando]               = useState(false)
  const [error, setError]                       = useState("")
  const [exito, setExito]                       = useState("")
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false)
  const searchRef                               = useRef<HTMLDivElement>(null)

  const obtenerHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  })

  const citasFiltradas = citas.filter((c) =>
    `${c.paciente_nombre} ${c.doctor_nombre}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()) && busqueda.length > 0
  )

  // Carga inicial: catálogo de citas y medicamentos en paralelo
  useEffect(() => {
    const cargarDatos = async () => {
      const headers = obtenerHeaders()
      try {
        const [resCitas, resMeds] = await Promise.all([
          fetch(`${API_URL}/api/recetas/citas`,        { headers }),
          fetch(`${API_URL}/api/recetas/medicamentos`, { headers }),
        ])
        if (resCitas.ok) setCitas(await resCitas.json())
        if (resMeds.ok)  setMedicamentos(await resMeds.json())
      } catch (err) {
        console.error("Error cargando datos iniciales:", err)
      }
    }
    cargarDatos()
  }, [])

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setMostrarDropdown(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const seleccionarCita = async (cita: Cita) => {
    setCitaSeleccionada(cita)
    setBusqueda("")
    setMostrarDropdown(false)
    setRecetaExistente(undefined)
    setLineas([lineaVacia(0)])
    setNextKey(1)
    setError("")
    setExito("")
    setMostrarFormularioNuevo(false)
    setCargandoReceta(true)
    try {
      const res = await fetch(`${API_URL}/api/recetas/cita/${cita.id_cita}`, {
        headers: obtenerHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        setRecetaExistente(data.receta) // null si no hay receta, objeto si existe
      }
    } catch (err) {
      console.error("Error verificando receta:", err)
    } finally {
      setCargandoReceta(false)
    }
  }

  const limpiarCita = () => {
    setCitaSeleccionada(null)
    setRecetaExistente(undefined)
    setLineas([lineaVacia(0)])
    setNextKey(1)
    setError("")
    setExito("")
    setMostrarFormularioNuevo(false)
  }

  const agregarLinea = () => {
    setLineas((prev) => [...prev, lineaVacia(nextKey)])
    setNextKey((k) => k + 1)
  }

  const eliminarLinea = (key: number) => {
    setLineas((prev) => prev.filter((l) => l.key !== key))
  }

  const actualizarLinea = (key: number, campo: keyof LineaMed, valor: string) => {
    setLineas((prev) =>
      prev.map((l) => (l.key === key ? { ...l, [campo]: valor } : l))
    )
  }

  const guardarReceta = async () => {
    setError("")
    setExito("")

    for (const linea of lineas) {
      if (!linea.id_medicamento || !linea.dosis.trim() || !linea.frecuencia.trim()) {
        setError("Completa el medicamento, dosis y frecuencia en todas las filas.")
        return
      }
    }

    setGuardando(true)
    try {
      const res = await fetch(`${API_URL}/api/recetas/crear`, {
        method: "POST",
        headers: obtenerHeaders(),
        body: JSON.stringify({
          id_cita: citaSeleccionada!.id_cita,
          medicamentos: lineas.map((l) => ({
            id_medicamento:        parseInt(l.id_medicamento),
            dosis:                 l.dosis.trim(),
            frecuencia:            l.frecuencia.trim(),
            periodo_administracion: l.periodo_administracion.trim() || null,
            observaciones:         l.observaciones.trim() || null,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al guardar la receta")

      setExito(`Receta #${data.id_receta} emitida con ${data.total_medicamentos} medicamento(s).`)

      // Recargar para mostrar la receta recién creada en modo lectura
      const resCheck = await fetch(
        `${API_URL}/api/recetas/cita/${citaSeleccionada!.id_cita}`,
        { headers: obtenerHeaders() }
      )
      if (resCheck.ok) {
        const d = await resCheck.json()
        setRecetaExistente(d.receta)
      }
      setMostrarFormularioNuevo(false)
      setLineas([lineaVacia(0)])
      setNextKey(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setGuardando(false)
    }
  }

  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Generador de Recetas</h1>
          <p className="text-sm text-muted-foreground">
            Emite recetas con múltiples medicamentos por cita médica
          </p>
        </div>
      </div>

      {/* ── Selector de cita ───────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        {citaSeleccionada ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">
                    Cita #{citaSeleccionada.id_cita} — {citaSeleccionada.paciente_nombre}
                  </p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${estadoColor[citaSeleccionada.estado] ?? ""}`}
                  >
                    {citaSeleccionada.estado}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dr. {citaSeleccionada.doctor_nombre} · {formatearFecha(citaSeleccionada.fecha)} · {citaSeleccionada.tipo_cita}
                </p>
              </div>
            </div>
            <button
              onClick={limpiarCita}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div ref={searchRef} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              placeholder="Buscar cita por nombre de paciente o doctor..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setMostrarDropdown(e.target.value.length > 0)
              }}
              onFocus={() => busqueda.length > 0 && setMostrarDropdown(true)}
            />
            {mostrarDropdown && citasFiltradas.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                {citasFiltradas.slice(0, 8).map((c) => (
                  <button
                    key={c.id_cita}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => seleccionarCita(c)}
                  >
                    <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{c.paciente_nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        Dr. {c.doctor_nombre} · {formatearFecha(c.fecha)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${estadoColor[c.estado] ?? ""}`}
                    >
                      {c.estado}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {mostrarDropdown && citasFiltradas.length === 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-lg">
                No se encontraron citas.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Contenido principal (solo con cita seleccionada) ───────── */}
      {citaSeleccionada && (
        <>
          {/* Skeleton mientras carga */}
          {cargandoReceta && (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          )}

          {/* Receta ya existente — vista de sólo lectura */}
          {!cargandoReceta && recetaExistente && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">
                  Receta #{recetaExistente.id_receta} — emitida el {formatearFecha(recetaExistente.fecha)}
                </h2>
              </div>

              {exito && (
                <div className="mb-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-foreground">
                  {exito}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Medicamento</th>
                      <th className="pb-3 font-medium text-muted-foreground">Dosis</th>
                      <th className="pb-3 font-medium text-muted-foreground">Frecuencia</th>
                      <th className="pb-3 font-medium text-muted-foreground">Periodo</th>
                      <th className="pb-3 font-medium text-muted-foreground">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recetaExistente.medicamentos.map((m) => (
                      <tr key={m.id_receta_medicamento} className="border-b border-border last:border-0">
                        <td className="py-3 font-medium text-foreground">{m.nombre}</td>
                        <td className="py-3 text-muted-foreground">{m.dosis}</td>
                        <td className="py-3 text-muted-foreground">{m.frecuencia}</td>
                        <td className="py-3 text-muted-foreground">{m.periodo_administracion ?? "—"}</td>
                        <td className="py-3 text-muted-foreground">{m.observaciones ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Botón para emitir otra receta sobre la misma cita */}
          {!cargandoReceta && recetaExistente && !mostrarFormularioNuevo && (
            <button
              onClick={() => { setMostrarFormularioNuevo(true); setError(""); setExito("") }}
              className="inline-flex items-center gap-2 self-start rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" />
              Nueva Receta para esta cita
            </button>
          )}

          {/* Formulario de nueva receta */}
          {!cargandoReceta && (recetaExistente === null || mostrarFormularioNuevo) && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Nueva Receta</h2>
                  <p className="text-sm text-muted-foreground">
                    Agrega uno o más medicamentos y completa los campos requeridos (*)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {mostrarFormularioNuevo && (
                    <button
                      onClick={() => { setMostrarFormularioNuevo(false); setError(""); setLineas([lineaVacia(0)]); setNextKey(1) }}
                      className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={agregarLinea}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar medicamento
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <div className="min-w-[860px]">
                  {/* Cabecera de columnas */}
                  <div className="mb-2 grid grid-cols-[2fr_1fr_1fr_1fr_2fr_40px] gap-3 px-1">
                    <span className="text-xs font-medium text-muted-foreground">Medicamento *</span>
                    <span className="text-xs font-medium text-muted-foreground">Dosis *</span>
                    <span className="text-xs font-medium text-muted-foreground">Frecuencia *</span>
                    <span className="text-xs font-medium text-muted-foreground">Periodo</span>
                    <span className="text-xs font-medium text-muted-foreground">Observaciones</span>
                    <span />
                  </div>

                  {/* Filas dinámicas */}
                  <div className="flex flex-col gap-2">
                    {lineas.map((linea) => (
                      <div
                        key={linea.key}
                        className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_40px] items-center gap-3 rounded-lg border border-border bg-muted/20 p-3"
                      >
                        <select
                          value={linea.id_medicamento}
                          onChange={(e) => actualizarLinea(linea.key, "id_medicamento", e.target.value)}
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Seleccionar...</option>
                          {medicamentos.map((m) => (
                            <option key={m.id_medicamento} value={m.id_medicamento}>
                              {m.nombre}
                            </option>
                          ))}
                        </select>

                        <input
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Ej. 500mg"
                          value={linea.dosis}
                          onChange={(e) => actualizarLinea(linea.key, "dosis", e.target.value)}
                        />

                        <input
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Ej. Cada 8h"
                          value={linea.frecuencia}
                          onChange={(e) => actualizarLinea(linea.key, "frecuencia", e.target.value)}
                        />

                        <input
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Ej. 5 días"
                          value={linea.periodo_administracion}
                          onChange={(e) => actualizarLinea(linea.key, "periodo_administracion", e.target.value)}
                        />

                        <input
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Opcional"
                          value={linea.observaciones}
                          onChange={(e) => actualizarLinea(linea.key, "observaciones", e.target.value)}
                        />

                        <button
                          onClick={() => eliminarLinea(linea.key)}
                          disabled={lineas.length === 1}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer del formulario */}
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {lineas.length} medicamento{lineas.length !== 1 ? "s" : ""} en la receta
                </span>
                <button
                  onClick={guardarReceta}
                  disabled={guardando}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle className="h-4 w-4" />
                  {guardando ? "Emitiendo..." : "Emitir Receta"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
