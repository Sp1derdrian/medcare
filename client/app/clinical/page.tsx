"use client"

import { useEffect, useState, useRef } from "react"
import { FileText, Search, User, X, Clock, PlusCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Paciente {
  id_paciente: number
  nombre: string
  apellido: string
  telefono?: string
  email?: string
  sangre_nombre?: string
}

interface NotaHistorial {
  id_historial_medico: number
  id_paciente: number
  descripcion: string
  fecha: string
}

export default function ClinicalPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [mostrarDropdown, setMostrarDropdown] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [historial, setHistorial] = useState<NotaHistorial[]>([])
  const [nuevaNota, setNuevaNota] = useState("")
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) && busqueda.length > 0
  )

  useEffect(() => {
    const cargarPacientes = async () => {
      const token = localStorage.getItem("token")
      if (!token) return
      try {
        const res = await fetch("http://localhost:4000/api/pacientes/get/todos", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) setPacientes(await res.json())
      } catch (err) {
        console.error("Error cargando pacientes:", err)
      }
    }
    cargarPacientes()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setMostrarDropdown(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const cargarHistorial = async (id: number) => {
    const token = localStorage.getItem("token")
    if (!token) return
    setCargandoHistorial(true)
    try {
      const res = await fetch(`http://localhost:4000/api/historial/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setHistorial(await res.json())
    } catch (err) {
      console.error("Error cargando historial:", err)
    } finally {
      setCargandoHistorial(false)
    }
  }

  const seleccionarPaciente = async (paciente: Paciente) => {
    setPacienteSeleccionado(paciente)
    setBusqueda("")
    setMostrarDropdown(false)
    setHistorial([])
    setNuevaNota("")
    await cargarHistorial(paciente.id_paciente)
  }

  const guardarNota = async () => {
    if (!pacienteSeleccionado || !nuevaNota.trim()) return
    const token = localStorage.getItem("token")
    if (!token) return
    setGuardando(true)
    try {
      const res = await fetch("http://localhost:4000/api/historial/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_paciente: pacienteSeleccionado.id_paciente, descripcion: nuevaNota.trim() }),
      })
      if (res.ok) {
        setNuevaNota("")
        await cargarHistorial(pacienteSeleccionado.id_paciente)
      } else {
        const errData = await res.json().catch(() => null)
        console.error(`Error ${res.status}:`, errData)
        alert(`Error ${res.status}: ${errData?.error ?? "Error al guardar la nota"}`)
      }
    } catch (err) {
      console.error("Error guardando nota:", err)
    } finally {
      setGuardando(false)
    }
  }

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO)
    return {
      fecha: fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }),
      hora: fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historial Clínico</h1>
          <p className="text-sm text-muted-foreground">Consulta y registra notas de evolución por paciente</p>
        </div>
      </div>

      {/* Patient Selector */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          {pacienteSeleccionado ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pacienteSeleccionado.email || "Sin correo"} · {pacienteSeleccionado.telefono || "Sin teléfono"}
                  </p>
                </div>
                {pacienteSeleccionado.sangre_nombre && (
                  <Badge variant="outline" className="ml-2 border-destructive/30 bg-destructive/5 text-destructive">
                    {pacienteSeleccionado.sangre_nombre}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => { setPacienteSeleccionado(null); setHistorial([]); setNuevaNota("") }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div ref={searchRef} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente por nombre..."
                className="pl-10"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setMostrarDropdown(e.target.value.length > 0) }}
                onFocus={() => busqueda.length > 0 && setMostrarDropdown(true)}
              />
              {mostrarDropdown && pacientesFiltrados.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                  {pacientesFiltrados.slice(0, 8).map((p) => (
                    <button
                      key={p.id_paciente}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => seleccionarPaciente(p)}
                    >
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="font-medium text-foreground">{p.nombre} {p.apellido}</span>
                      {p.telefono && (
                        <span className="ml-auto text-xs text-muted-foreground">{p.telefono}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {mostrarDropdown && pacientesFiltrados.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-lg">
                  No se encontraron pacientes.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main content: shown only after selecting a patient */}
      {pacienteSeleccionado && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Timeline – wider column */}
          <div className="lg:col-span-3">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Notas de Evolución ({historial.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cargandoHistorial ? (
                  <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                    ))}
                  </div>
                ) : historial.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-3 h-8 w-8 opacity-30" />
                    <p className="text-sm">Sin notas registradas para este paciente.</p>
                  </div>
                ) : (
                  <div className="relative ml-2">
                    {/* Vertical line connecting all dots */}
                    <div className="absolute left-2.5 top-0 h-full w-px bg-border" />
                    <div className="flex flex-col">
                      {historial.map((nota, index) => {
                        const { fecha, hora } = formatearFecha(nota.fecha)
                        const esMasReciente = index === 0
                        return (
                          <div key={nota.id_historial_medico} className="relative pb-6 pl-8 last:pb-0">
                            <div className={`absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 ${
                              esMasReciente ? "border-primary bg-primary/20" : "border-border bg-card"
                            }`} />
                            <div className={`rounded-lg border p-3.5 ${
                              esMasReciente ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"
                            }`}>
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <span className={`text-xs font-medium ${esMasReciente ? "text-primary" : "text-muted-foreground"}`}>
                                  {fecha}
                                </span>
                                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                  {hora}
                                </Badge>
                              </div>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                {nota.descripcion}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* New note form – sticky narrower column */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <Card className="border-border bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <PlusCircle className="h-4 w-4 text-primary" />
                    Nueva Nota de Evolución
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nota">Nota clínica</Label>
                    <Textarea
                      id="nota"
                      placeholder="Redacta la nota de evolución del paciente..."
                      className="min-h-[220px] resize-none"
                      value={nuevaNota}
                      onChange={(e) => setNuevaNota(e.target.value)}
                    />
                    <p className="text-right text-xs text-muted-foreground">{nuevaNota.length} caracteres</p>
                  </div>
                  <Button
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!nuevaNota.trim() || guardando}
                    onClick={guardarNota}
                  >
                    <PlusCircle className="h-4 w-4" />
                    {guardando ? "Guardando..." : "Guardar Nota"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
