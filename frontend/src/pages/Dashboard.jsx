import { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../api/client";
import PageHeader from "../components/PageHeader";
import { formatDate } from "../utils/format";
import { useToast } from "../context/ToastContext";

const statCards = [
  { key: "totalInventoryCount", label: "Inventory Records", helper: "All registered assets" },
  { key: "availableItems", label: "Available Items", helper: "Ready for assignment" },
  { key: "assignedItems", label: "Assigned Items", helper: "Currently issued" },
  { key: "totalWorkspaces", label: "Workspaces", helper: "Desks, rooms, and labs" },
  { key: "occupiedWorkspaces", label: "Occupied Spaces", helper: "Already booked" },
  { key: "pendingBookingRequests", label: "Pending Requests", helper: "Waiting for review" }
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get("/dashboard");
        setStats(data);
      } catch (error) {
        showToast(getErrorMessage(error), "error");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [showToast]);

  const workspaceUse = useMemo(() => {
    if (!stats?.totalWorkspaces) return 0;
    return Math.round((stats.occupiedWorkspaces / stats.totalWorkspaces) * 100);
  }, [stats]);

  const inventoryUse = useMemo(() => {
    if (!stats?.totalInventoryCount) return 0;
    return Math.round((stats.assignedItems / stats.totalInventoryCount) * 100);
  }, [stats]);

  return (
    <div className="page-shell">
      <PageHeader
        title="Dashboard"
        description="Daily overview for office inventory, workspaces, and booking requests."
      />
      {loading ? (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map((card) => (
              <div key={card.key} className="metric-card">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <p className="text-3xl font-semibold tracking-tight">{stats?.[card.key] ?? 0}</p>
                  <p className="text-right text-xs leading-5 text-gray-500">{card.helper}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="panel p-5">
              <h3 className="text-base font-semibold">Utilization</h3>
              <div className="mt-5 space-y-5">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Workspace occupancy</span>
                    <span className="font-medium">{workspaceUse}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full rounded-full bg-blue-700 transition-all duration-500" style={{ width: `${workspaceUse}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Inventory assignment</span>
                    <span className="font-medium">{inventoryUse}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full rounded-full bg-slate-700 transition-all duration-500 dark:bg-slate-300" style={{ width: `${inventoryUse}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="panel p-5">
              <h3 className="text-base font-semibold">Recent Activity</h3>
              <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
                {(stats?.recentActivity || []).length === 0 ? (
                  <p className="py-6 text-sm text-gray-500">No activity has been recorded yet.</p>
                ) : (
                  stats.recentActivity.map((entry) => (
                    <div key={entry._id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium">{entry.action}</p>
                        <p className="text-sm text-gray-500">{entry.detail}</p>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(entry.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
