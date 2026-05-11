"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Search,
  Plus,
  Eye,
  Pencil,
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
  // Form state
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
        
        const config = {
          headers: { "Authorization": `Bearer ${token}` }
        };

        
        const resPacientes = await fetch("http://localhost:4000/api/pacientes/get/todos", config);
        if (resPacientes.ok) {
          const data = await resPacientes.json();
          setPatients(data);
        }
        

        const resSexo= await fetch("http://localhost:4000/api/pacientes/get/sex", config);
        if (resSexo.ok) {
          const data = await resSexo.json();
          setSex(data);
        }
        
        const resCivil= await fetch("http://localhost:4000/api/pacientes/get/civilstate", config);
        if (resCivil.ok) {
          const data = await resCivil.json();
          setCivil(data);
        }

        const resBlood= await fetch("http://localhost:4000/api/pacientes/get/bloodgroup", config);
        if (resBlood.ok) {
          const data = await resBlood.json();
          setBlood(data);
        }

      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
  useEffect(() => {
    
    cargarDatos();
    
  },[])
  const handleEdit = (patient: Patient) => {
    // Inyectamos los datos del paciente en el formulario
    setFormData({
        nombre: patient.nombre,
        apellido: patient.apellido,
        email: patient.email || "",
        telefono: patient.telefono || "",
        // El split('T')[0] corta todo y solo deja "1990-01-01" para que el input type="date" no se rompa.
        fecha_nacimiento: patient.fecha_nacimiento ? patient.fecha_nacimiento.split('T')[0] : "",
        id_sexo: patient.id_sexo.toString(),
        id_estado_civil: patient.id_estado_civil ? patient.id_estado_civil.toString() : "",
        id_grupo_sanguineo: patient.id_grupo_sanguineo ? patient.id_grupo_sanguineo.toString() : "",
    })
    
    // Guardamos el ID para saber a quién vamos a actualizar
    setEditingId(patient.id_paciente)
    
    // Abrimos el Modal
    setDialogOpen(true)
    }

  const handleSubmit = async () => {
    try {
        const token = localStorage.getItem("token");
        
        // DECISIÓN MÁGICA: ¿Es POST (Crear) o PUT (Actualizar)?
        const url = editingId 
        ? `http://localhost:4000/api/pacientes/actualizar/${editingId}` 
        : "http://localhost:4000/api/pacientes/crear";
        
        const method = editingId ? "PUT" : "POST";

        const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
        });

        if (response.ok) {
        setDialogOpen(false); 
        await cargarDatos(); 
        
        // Limpiamos todo para la próxima vez
        setFormData({
            nombre: "", apellido: "", email: "", telefono: "",
            fecha_nacimiento: "", id_sexo: "", id_estado_civil: "", id_grupo_sanguineo: ""
        });
        setEditingId(null); // Reseteamos el modo de edición
        
        alert(editingId ? "¡Paciente actualizado!" : "¡Paciente registrado!");
        } else {
        alert("Error al guardar");
        }
    } catch (error) {
        console.error("Error:", error);
        }
    };

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
            <p className="text-sm text-muted-foreground">
              Gestiona la información de todos los pacientes
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingId ? "Editar Paciente" : "Registrar Nuevo Paciente"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Ingrese el nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellidos</Label>
                <Input
                  id="apellido"
                  placeholder="Ingrese los apellidos"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange("apellido", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="10 dígitos"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => handleInputChange("fecha_nacimiento", e.target.value)}
                />
              </div>
              {/* Estos Selects los llenaremos después con tus catálogos */}
              <div className="space-y-2">
                <Label htmlFor="id_sexo">Sexo</Label>
                <Select value={formData.id_sexo.toString()} onValueChange={(value) => handleInputChange("id_sexo", value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {sex.map((s: any)=> (
                        <SelectItem key={s.id_sexo} value={s.id_sexo.toString()}>
                            {s.descripcion}
                        </SelectItem>  
                    ))}

                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_estado_civil">Estado Civil</Label>
                <Select value={formData.id_estado_civil} onValueChange={(value) => handleInputChange("id_estado_civil", value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {civil.map((c: any)=>(
                        <SelectItem key={c.id_estado_civil} value={c.id_estado_civil.toString()}>
                            {c.descripcion}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_grupo_sanguineo">Grupo Sanguíneo</Label>
                <Select value={formData.id_grupo_sanguineo} onValueChange={(value) => handleInputChange("id_grupo_sanguineo", value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {blood.map((b: any)=>(
                        <SelectItem key={b.id_grupo_sanguineo} value={b.id_grupo_sanguineo.toString()}>
                            {b.descripcion}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Guardar Paciente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o teléfono..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground">
            Lista de Pacientes ({filteredPatients.length})
          </CardTitle>
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
                  <th className="pb-3 text-left font-medium text-muted-foreground">Civil</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id_paciente} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">
                      {patient.nombre} {patient.apellido}
                    </td>
                    <td className="py-3 text-muted-foreground">{patient.telefono || "N/A"}</td>
                    <td className="py-3 text-muted-foreground">{patient.email || "N/A"}</td>
                    <td className="py-3">
                      <Badge variant="outline" className={patient.sexo_nombre ? sexColors[patient.sexo_nombre] : ""}>{patient.sexo_nombre}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className={patient.sangre_nombre ? bloodTypeColors[patient.sangre_nombre] : ""}>{patient.sangre_nombre}</Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {patient.ecivil_nombre}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => handleEdit(patient)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No se encontraron pacientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

