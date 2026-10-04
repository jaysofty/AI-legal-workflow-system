import {
  BriefcaseBusiness,
  CheckCircle2,
  Users,
  Workflow,
} from "lucide-react";

import DashboardStatCard from "./DashboardStatCard.jsx";

function DashboardStats({
  totalClients,
  totalMatters,
  activeMatters,
}) {
  const stats = [
    {
      label: "Total Clients",
      value: totalClients,
      description: "Clients in your firm",
      icon: Users,
    },
    {
      label: "Total Matters",
      value: totalMatters,
      description: "Matters across the firm",
      icon: BriefcaseBusiness,
    },
    {
      label: "Active Matters",
      value: activeMatters,
      description: "Currently in progress",
      icon: CheckCircle2,
    },
    {
      label: "Pending Tasks",
      value: "—",
      description: "Task tracking coming soon",
      icon: Workflow,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <DashboardStatCard
          key={stat.label}
          {...stat}
        />
      ))}
    </div>
  );
}

export default DashboardStats;