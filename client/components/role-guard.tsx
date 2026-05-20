"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AccessDenied } from "@/components/access-denied" // Tu componente de v0

interface RoleGuardProps {
  children: React.ReactNode
  permisoRequerido: string
}

export function RoleGuard({ children, permisoRequerido }: RoleGuardProps) {
  const router = useRouter()
  // 3 estados: cargando (revisando gafete), autorizado (pasa), denegado (bloqueado)
  const [estadoAcceso, setEstadoAcceso] = useState<"cargando" | "autorizado" | "denegado">("cargando")

  useEffect(() => {
    const verificarAcceso = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        // Le preguntamos al backend qué permisos tiene este usuario
        const res = await fetch("http://localhost:4000/api/me", {
          headers: { "Authorization": `Bearer ${token}` }
        })

        if (res.ok) {
          const userData = await res.json()
          const misPermisos = userData.perfil?.permisos || []

          // Verificamos si en su arreglo viene el permiso que esta página exige
          if (misPermisos.includes(permisoRequerido)) {
            setEstadoAcceso("autorizado")
          } else {
            setEstadoAcceso("denegado")
          }
        } else {
          router.push("/login") // Si el token expiró
        }
      } catch (error) {
        console.error("Error validando seguridad:", error)
        router.push("/login")
      }
    }

    verificarAcceso()
  }, [permisoRequerido, router])

  // Mientras le preguntamos al backend, mostramos una pantalla limpia
  if (estadoAcceso === "cargando") {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-muted-foreground">
        Verificando permisos de seguridad...
      </div>
    )
  }

  // ¡MAGIA! Si no tiene permiso, inyectamos tu componente de v0 aquí mismo
  if (estadoAcceso === "denegado") {
    return <AccessDenied />
  }

  // Si tiene permiso, renderizamos la página real (children)
  return <>{children}</>
}