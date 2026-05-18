import { DashboardShell } from "@/components/dashboard-shell"

export default function ClinicalLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
