"use client"

import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HospitalLogo } from "@/components/hospital-logo"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [e.target.id]: e.target.value
    })
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault();

  // 1. Limpieza de seguridad: Borramos cualquier rastro de sesiones anteriores
  localStorage.removeItem("token");
  localStorage.removeItem("userProfile");

  try {
    // 2. Hacemos el Login normal
    const responseLogin = await fetch("http://localhost:4000/api/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const dataLogin = await responseLogin.json();

    if (!responseLogin.ok) {
      alert(`Error de Login: ${dataLogin.error}`);
      return; // Cortamos la función aquí si la contraseña es incorrecta
    }

    // ✅ LOGIN EXITOSO
    localStorage.setItem("token", dataLogin.token);

    // 3. Ejecutamos el /api/me mostrando el Token
    const responseMe = await fetch("http://localhost:4000/api/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${dataLogin.token}` 
      }
    });

    const dataMe = await responseMe.json();

    if (responseMe.ok && dataMe.perfil) {
      // Guardamos el perfil en la memoria
      localStorage.setItem("userProfile", JSON.stringify(dataMe.perfil));

      // 4. Validación segura para los permisos (Por si vienen vacíos)
      const listaPermisos = dataMe.perfil.permisos && dataMe.perfil.permisos.length > 0 
        ? dataMe.perfil.permisos.join(', ') 
        : 'Ninguno';

      alert(`¡Bienvenido ${dataMe.perfil.username}! Permisos: ${listaPermisos}`);
      
      // 5. Redirigimos al sistema
      window.location.href = "/dashboard";
    } else {
      alert(`Error obteniendo el perfil: ${dataMe.error}`);
    }

  } catch (error) {
    console.error("Error de conexión:", error);
    alert("Hubo un problema al conectar con el servidor. Revisa si el backend está corriendo.");
  }
};
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg shadow-primary/5">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <HospitalLogo />
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to access your hospital dashboard
            </p>
          </div>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Link
                  href="#"
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  ¿Olvidaste tu password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold h-11 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
