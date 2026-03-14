"use client"

import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HospitalLogo } from "@/components/hospital-logo"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  //se define formulario
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [e.target.id]: e.target.value
    })
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {

    e.preventDefault(); 

    // Validación de pass
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden. Por favor, revísalas.");
      return;
    }

    try {
      //fetch para usar post
      const response = await fetch("http://localhost:4000/api/usuarios/registro", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json", 
        },
        //el cuerpo de lo que vamos a mandar, convertimos de un js value a un JSON object
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      //al hacer el fetch nos regresa un json de respuesta en la variable response
      const data = await response.json();
      if (response.ok) {
        // Si el backend respondió con éxito (status 200)
        alert("¡Cuenta creada exitosamente, " + data.usuario.username + "!");
        
        window.location.href = "/login";
      } else {
        
        alert(`Error: ${data.error}`);
      }

    } catch (error) {
      
      console.error("Error de conexión:", error);
      alert("Hubo un problema al conectar con el servidor.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg shadow-primary/5">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <HospitalLogo />
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">Crear cuenta</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ¡Unete a MediCare para mejorar la operación y ser más efectivos!
            </p>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullname" className="text-sm font-medium text-foreground">
                Nombre
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Dr. Heisenberg House"
                  className="pl-10 bg-background border-border focus-visible:ring-primary"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@medicare.com"
                  className="pl-10 bg-background border-border focus-visible:ring-primary"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Escribe un password seguro"
                  className="pl-10 pr-10 bg-background border-border focus-visible:ring-primary"
                  required
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm" className="text-sm font-medium text-foreground">
                Confirma tu Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirma tu password"
                  className="pl-10 pr-10 bg-background border-border focus-visible:ring-primary"
                  required
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold h-11 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
