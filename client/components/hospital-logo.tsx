import { Heart } from "lucide-react"

export function HospitalLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
        <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Medi<span className="text-primary">Care</span>
      </span>
    </div>
  )
}
