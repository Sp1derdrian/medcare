import { DashboardShell } from "@/components/dashboard-shell"

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}