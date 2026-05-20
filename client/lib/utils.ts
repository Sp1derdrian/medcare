import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PERMISOS = {
  PATIENT: 'pacientes',
  DOCTOR: 'doctores',
  APPOINTMENTS: 'citas',
  CLINIC: 'clinica',
  HOSPITAL: 'hospitalizacion',
  ADMIN: 'administrador',
  SETTINGS: 'ajustes',
} as const;
