"use client"
import {
  Users,
  Stethoscope,
  CalendarDays,
  BedDouble,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"



const recentAppointments = [
  { patient: "Alice Johnson", doctor: "Dr. Robert Lee", time: "09:00 AM", status: "Completed" },
  { patient: "Mark Williams", doctor: "Dr. Jane Smith", time: "10:30 AM", status: "In Progress" },
  { patient: "Susan Brown", doctor: "Dr. Emily Chen", time: "11:00 AM", status: "Waiting" },
  { patient: "James Taylor", doctor: "Dr. David Kim", time: "01:00 PM", status: "Scheduled" },
  { patient: "Patricia Moore", doctor: "Dr. Sarah Wilson", time: "02:30 PM", status: "Scheduled" },
]

const statusStyles: Record<string, string> = {
  Completada: "bg-green-100 text-green-700",
  Confirmada: "bg-blue-100 text-blue-700",
  Pendiente: "bg-yellow-100 text-yellow-700",
  Cancelada: "bg-red-100 text-red-700",
}

const departments = [
  { name: "Cardiology", patients: 185, doctors: 12, occupancy: 85 },
  { name: "Neurology", patients: 142, doctors: 8, occupancy: 72 },
  { name: "Orthopedics", patients: 198, doctors: 15, occupancy: 91 },
  { name: "Pediatrics", patients: 164, doctors: 10, occupancy: 68 },
]

interface Appointment {
  id_cita: number
  id_paciente: number
  id_doctor: number
  fecha: string
  estado: string
  paciente_nombre: string
  paciente_apellido:string
  doctor_nombre: string
  doctor_apellido: string
}

export function DashboardContent() {
const [numPatients, setNumPatients] = useState<{ total_pacientes: number } | null>(null);
const [numDoctors, setNumDoctors] = useState<{ total_doctores: number } | null>(null);
const [appointments, setAppointments] = useState<Appointment[]>([])

//carga de datos de dashboard con endpoints
const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const config = {
          headers: { "Authorization": `Bearer ${token}` }
        };

        const resNumPacientes = await fetch("http://localhost:4000/api/pacientes/get/number", config);
        if (resNumPacientes.ok) {
          const data = await resNumPacientes.json();
          setNumPatients(data);
        }

        const resNumDoctors= await fetch("http://localhost:4000/api/doctores/get/number", config);
        if (resNumDoctors.ok) {
          const data = await resNumDoctors.json();
          setNumDoctors(data);
        }

        const resAppointments= await fetch("http://localhost:4000/api/citas/get/cincoRecientes", config);
        if (resAppointments.ok) {
          const data = await resAppointments.json();
          setAppointments(data);
        }

      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

  useEffect(() => {
    
    cargarDatos();
    
  },[])
const stats = [
  {
    label: "Total Patients",
    value: numPatients ? numPatients.total_pacientes : 0,
    change: "+12.5%",
    trend: "up" as const,
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Active Doctors",
    value: numDoctors ? numDoctors.total_doctores : 0,
    change: "+3.2%",
    trend: "up" as const,
    icon: Stethoscope,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    label: "Appointments Today",
    value: "42",
    change: "-5.1%",
    trend: "down" as const,
    icon: CalendarDays,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    label: "Available Beds",
    value: "18",
    change: "+2",
    trend: "up" as const,
    icon: BedDouble,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
  ]
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Here is an overview of today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      stat.trend === "up" ? "text-accent" : "text-destructive"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle row: Recent Appointments + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Appointments */}
        <Card className="lg:col-span-2 border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Recent Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Patient</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Doctor</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Time</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id_cita} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium text-foreground">{appt.paciente_nombre} {appt.paciente_apellido}</td>
                      <td className="py-3 text-muted-foreground">{appt.doctor_nombre} {appt.doctor_apellido}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(appt.fecha).toLocaleString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[appt.estado]}`}
                        >
                          {appt.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Activity */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-accent" />
              Hospital Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Emergency admission</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-accent/5 p-3">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Surgery completed</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/5 p-3">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Lab results ready</p>
                  <p className="text-xs text-muted-foreground">32 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-destructive/5 p-3">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Critical alert: ICU Bed 4</p>
                  <p className="text-xs text-muted-foreground">45 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Patient discharged</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground">Department Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className="rounded-xl border border-border bg-background p-4"
              >
                <h3 className="text-sm font-semibold text-foreground">{dept.name}</h3>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Patients</span>
                    <span className="font-medium text-foreground">{dept.patients}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Doctors</span>
                    <span className="font-medium text-foreground">{dept.doctors}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium text-foreground">{dept.occupancy}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                      style={{ width: `${dept.occupancy}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
