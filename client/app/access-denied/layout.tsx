import { DashboardShell } from "@/components/dashboard-shell"

export default function AccessDeniedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}