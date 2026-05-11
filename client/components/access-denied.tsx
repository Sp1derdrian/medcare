"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldX, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const REDIRECT_SECONDS = 6

export function AccessDenied() {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push("/dashboard")
          return 0
        }
        return prev - 1
      })
      setProgress((prev) => {
        const increment = 100 / REDIRECT_SECONDS
        return Math.min(prev + increment, 100)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-12 w-12 text-destructive" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Acceso Restringido
        </h1>

        {/* Subtitle */}
        <p className="mb-8 text-muted-foreground">
          Tu rol actual no tiene los permisos necesarios para visualizar este
          módulo. Si crees que esto es un error, contacta al administrador del
          sistema.
        </p>

        {/* Redirect indicator */}
        <div className="mb-6 w-full space-y-3">
          <p className="text-sm text-muted-foreground">
            Redirigiendo al inicio en{" "}
            <span className="font-semibold text-foreground">{secondsLeft}</span>{" "}
            segundos...
          </p>
          <Progress value={progress} className="h-2 w-full" />
        </div>

        {/* Back button */}
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Button>
      </div>
    </div>
  )
}
