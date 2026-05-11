import { DashboardShell } from "@/components/dashboard-shell"

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
