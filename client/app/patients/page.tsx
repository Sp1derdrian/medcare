"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Search,
  Plus,
  Eye,
  Pencil,
  Shield // <-- ¡Nuevo icono de escudo para los seguros!
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Patient {
  id_paciente: number
  nombre: string
  apellido: string
  telefono: string
  email: string
  fecha_nacimiento: string
  id_sexo: number
  id_estado_civil: number
  id_grupo_sanguineo: number
  id_seguro: number // <-- Adrián ya lo tenía contemplado
  sexo_nombre?: string
  ecivil_nombre?: string
  sangre_nombre?: string
}

const bloodTypeColors: Record<string, string> = {
  "O+": "bg-destructive/10 text-destructive border-destructive/20",
  "O-": "bg-destructive/10 text-destructive border-destructive/20",
  "A+": "bg-primary/10 text-primary border-primary/20",
  "A-": "bg-primary/10 text-primary border-primary/20",
  "B+": "bg-accent/10 text-accent border-accent/20",
  "B-": "bg-accent/10 text-accent border-accent/20",
  "AB+": "bg-secondary/10 text-secondary-foreground border-secondary/20",
  "AB-": "bg-secondary/10 text-secondary-foreground border-secondary/20",
}

const sexColors: Record<string, string> = {
  Masculino: "bg-primary/10 text-primary border-primary/20",
  Femenino: "bg-pink-100 text-pink-700 border-pink-200",
}

export default function PatientsContent() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [sex, setSex] = useState<any[]>([])
  const [civil, setCivil] = useState<any[]>([])
  const [blood, setBlood] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // --- NUEVOS ESTADOS PARA SEGUROS (PBI 3) ---
  const [seguroModalOpen, setSeguroModalOpen] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Patient | null>(null)
  const [aseguradoras, setAseguradoras] = useState<any[]>([])
  const [tiposSeguro, setTiposSeguro] = useState<any[]>([])
  const [seguroFormData, setSeguroFormData] = useState({
    id_aseguradora: "",
    id_tipo_seguro: "",
    numero_poliza: ""
  })

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    id_sexo: "",
    id_estado_civil: "",
    id_grupo_sanguineo: "",
  })

  const filteredPatients = patients.filter((patient) => {
    const nombreCompleto = `${patient.nombre || ""} ${patient.apellido || ""}`.toLowerCase()
    const telefono = patient.telefono || ""
    const query = searchQuery.toLowerCase()
    return nombreCompleto.includes(query) || telefono.includes(query)
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const config = { headers: { "Authorization": `Bearer ${token}` } };
        
        const resPacientes = await fetch("http://localhost:4000/api/pacientes/get/todos", config);
        if (resPacientes.ok) setPatients(await resPacientes.json());
        
        const resSexo= await fetch("http://localhost:4000/api/pacientes/get/sex", config);
        if (resSexo.ok) setSex(await resSexo.json());
        
        const resCivil= await fetch("http://localhost:4000/api/pacientes/get/civilstate", config);
        if (resCivil.ok) setCivil(await resCivil.json());

        const resBlood= await fetch("http://localhost:4000/api/pacientes/get/bloodgroup", config);
        if (resBlood.ok) setBlood(await resBlood.json());

      } catch (error) {
        console.error("Error cargando datos:", error);
      }
  };

  // --- FUNCIÓN PARA CARGAR CATÁLOGOS DE SEGUROS ---
  const cargarCatalogosSeguros = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      
      const resAseg = await fetch("http://localhost:4000/api/seguros/aseguradoras", config);
      if (resAseg.ok) setAseguradoras(await resAseg.json());

      const resTipos = await fetch("http://localhost:4000/api/seguros/tipos", config);
      if (resTipos.ok) setTiposSeguro(await resTipos.json());
    } catch (error) {
      console.error("Error cargando catálogos de seguros:", error);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [])

  const handleEdit = (patient: Patient) => {
    setFormData({
        nombre: patient.nombre,
        apellido: patient.apellido,
        email: patient.email || "",
        telefono: patient.telefono || "",
        fecha_nacimiento: patient.fecha_nacimiento ? patient.fecha_nacimiento.split('T')[0] : "",
        id_sexo: patient.id_sexo.toString(),
        id_estado_civil: patient.id_estado_civil ? patient.id_estado_civil.toString() : "",
        id_grupo_sanguineo: patient.id_grupo_sanguineo ? patient.id_grupo_sanguineo.toString() : "",
    })
    setEditingId(patient.id_paciente)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
        const token = localStorage.getItem("token");
        const url = editingId 
        ? `http://localhost:4000/api/pacientes/actualizar/${editingId}` 
        : "http://localhost:4000/api/pacientes/crear";
        
        const method = editingId ? "PUT" : "POST";

        const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData)
        });

        if (response.ok) {
          setDialogOpen(false); 
          await cargarDatos(); 
          setFormData({ nombre: "", apellido: "", email: "", telefono: "", fecha_nacimiento: "", id_sexo: "", id_estado_civil: "", id_grupo_sanguineo: "" });
          setEditingId(null);
          alert(editingId ? "¡Paciente actualizado!" : "¡Paciente registrado!");
        } else {
          alert("Error al guardar");
        }
    } catch (error) {
        console.error("Error:", error);
    }
  };

 const abrirModalSeguros = async (patient: Patient) => {
    setPacienteSeleccionado(patient);
    await cargarCatalogosSeguros();
    
    // Si el paciente ya tiene seguro, rescatamos la información de la BD
    if (patient.id_seguro) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/api/seguros/poliza/${patient.id_seguro}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const poliza = await res.json();
          if (poliza) {
            // Pre-llenamos el formulario con los datos actuales
            setSeguroFormData({
              id_aseguradora: poliza.id_aseguradora.toString(),
              id_tipo_seguro: poliza.id_tipo_seguro.toString(),
              numero_poliza: poliza.numero_poliza
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar la póliza actual:", error);
      }
    } else {
      // Si no tiene, limpiamos el formulario para un registro limpio
      setSeguroFormData({ id_aseguradora: "", id_tipo_seguro: "", numero_poliza: "" });
    }
    setSeguroModalOpen(true);
  }

  const handleAgregarAseguradora = async () => {
    const nombre = window.prompt("Ingrese el nombre de la nueva Aseguradora:");
    if (!nombre) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/seguros/aseguradoras", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ nombre })
      });
      if (res.ok) {
        alert("Aseguradora agregada con éxito");
        cargarCatalogosSeguros(); // Refrescamos el select
      }
    } catch (error) {
      console.error("Error al agregar aseguradora", error);
    }
  }

 const handleVincularSeguro = async () => {
    if (!seguroFormData.id_aseguradora || !seguroFormData.id_tipo_seguro || !seguroFormData.numero_poliza) {
      alert("Por favor llena todos los campos de la póliza."); return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

      if (pacienteSeleccionado?.id_seguro) {
        // --- MODO EDICIÓN: Actualizar póliza existente ---
        const resUpdate = await fetch(`http://localhost:4000/api/seguros/poliza/${pacienteSeleccionado.id_seguro}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(seguroFormData)
        });
        
        if (resUpdate.ok) {
          alert("¡Póliza actualizada con éxito!");
          setSeguroModalOpen(false);
          cargarDatos(); // Refrescamos la tabla principal
        } else {
          alert("Error al actualizar la póliza.");
        }
      } else {
        // --- MODO CREACIÓN: Crear nueva póliza y vincular ---
        const resPoliza = await fetch("http://localhost:4000/api/seguros/poliza", {
          method: "POST", headers, body: JSON.stringify(seguroFormData)
        });
        
        if (!resPoliza.ok) throw new Error("No se pudo crear la póliza");
        const polizaCreada = await resPoliza.json();

        const resVincular = await fetch("http://localhost:4000/api/seguros/vincular-paciente", {
          method: "PUT", headers, body: JSON.stringify({
            id_paciente: pacienteSeleccionado?.id_paciente,
            id_seguro: polizaCreada.id_seguro
          })
        });

        if (resVincular.ok) {
          alert("¡Póliza creada y vinculada al paciente exitosamente!");
          setSeguroModalOpen(false);
          setSeguroFormData({ id_aseguradora: "", id_tipo_seguro: "", numero_poliza: "" });
          cargarDatos();
        }
      }
    } catch (error) {
      console.error("Error al procesar seguro:", error);
      alert("Ocurrió un error al procesar el seguro.");
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Directorio de Pacientes</h1>
            <p className="text-sm text-muted-foreground">Gestiona la información de todos los pacientes</p>
          </div>
        </div>

        {/* Modal de Crear/Editar Paciente original */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editingId ? "Editar Paciente" : "Registrar Nuevo Paciente"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" placeholder="Ingrese el nombre" value={formData.nombre} onChange={(e) => handleInputChange("nombre", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellidos</Label>
                <Input id="apellido" placeholder="Ingrese los apellidos" value={formData.apellido} onChange={(e) => handleInputChange("apellido", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" type="tel" placeholder="10 dígitos" value={formData.telefono} onChange={(e) => handleInputChange("telefono", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input id="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={(e) => handleInputChange("fecha_nacimiento", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_sexo">Sexo</Label>
                <Select value={formData.id_sexo.toString()} onValueChange={(value) => handleInputChange("id_sexo", value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {sex.map((s: any)=> (<SelectItem key={s.id_sexo} value={s.id_sexo.toString()}>{s.descripcion}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_estado_civil">Estado Civil</Label>
                <Select value={formData.id_estado_civil} onValueChange={(value) => handleInputChange("id_estado_civil", value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {civil.map((c: any)=>(<SelectItem key={c.id_estado_civil} value={c.id_estado_civil.toString()}>{c.descripcion}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_grupo_sanguineo">Grupo Sanguíneo</Label>
                <Select value={formData.id_grupo_sanguineo} onValueChange={(value) => handleInputChange("id_grupo_sanguineo", value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {blood.map((b: any)=>(<SelectItem key={b.id_grupo_sanguineo} value={b.id_grupo_sanguineo.toString()}>{b.descripcion}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">Guardar Paciente</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o teléfono..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground">Lista de Pacientes ({filteredPatients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Nombre Completo</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Teléfono</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Correo</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Sexo</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Sanguíneo</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Seguro</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id_paciente} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">{patient.nombre} {patient.apellido}</td>
                    <td className="py-3 text-muted-foreground">{patient.telefono || "N/A"}</td>
                    <td className="py-3 text-muted-foreground">{patient.email || "N/A"}</td>
                    <td className="py-3"><Badge variant="outline" className={patient.sexo_nombre ? sexColors[patient.sexo_nombre] : ""}>{patient.sexo_nombre}</Badge></td>
                    <td className="py-3"><Badge variant="outline" className={patient.sangre_nombre ? bloodTypeColors[patient.sangre_nombre] : ""}>{patient.sangre_nombre}</Badge></td>
                    {/* Indicador de si tiene o no seguro */}
                    <td className="py-3 text-muted-foreground">
                      {patient.id_seguro ? <Badge variant="default" className="bg-blue-100 text-blue-700">Activo</Badge> : <Badge variant="secondary">Ninguno</Badge>}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón de Editar Original */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => handleEdit(patient)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/* NUEVO Botón de Seguros */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-700" onClick={() => abrirModalSeguros(patient)} title="Administrar Seguro">
                          <Shield className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No se encontraron pacientes.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* --- NUEVO MODAL PARA SEGUROS --- */}
      <Dialog open={seguroModalOpen} onOpenChange={setSeguroModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Administrar Seguro de {pacienteSeleccionado?.nombre}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            
            {/* Campo Aseguradora */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="id_aseguradora">Aseguradora</Label>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={handleAgregarAseguradora}>
                  + Nueva Aseguradora
                </Button>
              </div>
              <Select value={seguroFormData.id_aseguradora} onValueChange={(value) => setSeguroFormData(prev => ({...prev, id_aseguradora: value}))}>
                <SelectTrigger><SelectValue placeholder="Selecciona la aseguradora" /></SelectTrigger>
                <SelectContent>
                  {aseguradoras.map((a: any) => (
                    <SelectItem key={a.id_aseguradora} value={a.id_aseguradora.toString()}>{a.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campo Tipo de Seguro */}
            <div className="space-y-2">
              <Label htmlFor="id_tipo_seguro">Tipo de Seguro</Label>
              <Select value={seguroFormData.id_tipo_seguro} onValueChange={(value) => setSeguroFormData(prev => ({...prev, id_tipo_seguro: value}))}>
                <SelectTrigger><SelectValue placeholder="Selecciona el tipo" /></SelectTrigger>
                <SelectContent>
                  {tiposSeguro.map((t: any) => (
                    <SelectItem key={t.id_tipo_seguro} value={t.id_tipo_seguro.toString()}>{t.descripcion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campo Número de Póliza */}
            <div className="space-y-2">
              <Label htmlFor="numero_poliza">Número de Póliza</Label>
              <Input 
                id="numero_poliza" 
                placeholder="Ej. POL-123456789" 
                value={seguroFormData.numero_poliza} 
                onChange={(e) => setSeguroFormData(prev => ({...prev, numero_poliza: e.target.value}))} 
              />
            </div>
            
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleVincularSeguro} className="bg-blue-600 text-white hover:bg-blue-700">
              Vincular Póliza
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}