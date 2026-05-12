"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  Pill,
  Settings,
  ChevronLeft,
  Heart,
  GemIcon,
  HospitalIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {PERMISOS} from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permiso: null },
  { label: "Patients", href: "/patients", icon: Users, permiso: PERMISOS.PATIENT },
  { label: "Doctors", href: "/doctors", icon: Stethoscope, permiso: PERMISOS.DOCTOR },
  { label: "Appointments", href: "/appointments", icon: CalendarDays, permiso: PERMISOS.APPOINTMENTS },
  { label: "Clinical Records", href: "/clinical", icon: Pill, permiso: PERMISOS.CLINIC },
  { label: "Hospitalization", href: "/hospitalization", icon: HospitalIcon, permiso: PERMISOS.HOSPITAL },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, permiso: PERMISOS.SETTINGS },
  { label: "Admin", href: "/admin", icon: GemIcon, permiso: PERMISOS.ADMIN }
]

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const [misPermisos, setMisPermisos] = useState<string[]>([])
  
  useEffect(() => {
    const fetchPermisos = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await fetch("http://localhost:4000/api/me", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          // Guardamos el arreglo de strings (ej: ['pacientes', 'citas'])
          setMisPermisos(data.perfil?.permisos || [])
        }
      } catch (error) {
        console.error("Error cargando permisos en la sidebar:", error)
      }
    }

    fetchPermisos()
  }, [])

  // Filtramos los items antes de dibujarlos
  const itemsPermitidos = navItems.filter(item => 
    !item.permiso || misPermisos.includes(item.permiso)
  )

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
          <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            Medi<span className="text-primary">Care</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {itemsPermitidos.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
