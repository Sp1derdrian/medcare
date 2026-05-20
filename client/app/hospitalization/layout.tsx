import { DashboardShell } from "@/components/dashboard-shell"

export default function HospitalizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}