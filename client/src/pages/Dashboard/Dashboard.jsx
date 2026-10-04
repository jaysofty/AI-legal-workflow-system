import { useMemo } from "react";
import { useDashboard } from "../../hooks/useDashboard.js";
import { useAuth } from "../../hooks/useAuth.js";
import DashboardHeader from "./DashboardHeader.jsx";
import DashboardStats from "./DashboardStats.jsx";
import RecentMatters from "./RecentMatters.jsx";
import { getGreeting } from "../../utils/greeting.js";

function getResponseData(response) {
  return response?.data ?? response ?? {};
}

function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboard();

  const dashboard = useMemo(() => {
    const clientsResponse = getResponseData(data?.clients);

    const mattersResponse = getResponseData(data?.matters);

    const clients = clientsResponse?.clients ?? clientsResponse?.data ?? [];

    const matters = mattersResponse?.matters ?? mattersResponse?.data ?? [];

    return {
      clients: Array.isArray(clients) ? clients : [],
      matters: Array.isArray(matters) ? matters : [],
    };
  }, [data]);

  const activeMatters = dashboard.matters.filter(
    (matter) => matter.status === "ACTIVE",
  ).length;

  const recentMatters = dashboard.matters.slice(0, 5);


  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-900">Unable to load dashboard</h2>

        <p className="mt-1 text-sm text-red-700">
          {error?.message ||
            "Something went wrong while loading the dashboard."}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        greeting={`${getGreeting()}, ${user?.firstName || "there"}`}
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <DashboardStats
        totalClients={dashboard.clients.length}
        totalMatters={dashboard.matters.length}
        activeMatters={activeMatters}
      />

      <RecentMatters matters={recentMatters} />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900">AI Activity</h2>

          <p className="mt-1 text-sm text-slate-500">
            AI execution activity will appear here once the activity feed is
            connected.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
