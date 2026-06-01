import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/format";

const Requests = () => {
  const { user, syncSession } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin";

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/requests", { params: { status } });
      setRequests(data);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateStatus = async (id, nextStatus) => {
    try {
      await api.put(`/requests/${id}/status`, { status: nextStatus });
      showToast(`Request ${nextStatus}`);
      loadRequests();
    } catch (error) {
      if (error?.response?.status === 403) await syncSession();
      showToast(getErrorMessage(error), "error");
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Booking Requests"
        description={isAdmin ? "Approve or reject employee workspace requests." : "Track the status of your workspace requests."}
        action={
          <form onSubmit={(e) => { e.preventDefault(); loadRequests(); }} className="flex gap-2">
            <select className="input w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="btn-secondary">Apply</button>
          </form>
        }
      />

      {loading ? (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      ) : requests.length === 0 ? (
        <EmptyState title="No requests found" description="Workspace booking requests will appear here." />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="table-heading">Employee</th>
                  <th className="table-heading">Workspace</th>
                  <th className="table-heading">Requested On</th>
                  <th className="table-heading">Status</th>
                  {isAdmin && <th className="table-heading text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {requests.map((request) => (
                  <tr key={request._id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="table-cell font-medium">{request.userId?.name || "Employee"}</td>
                    <td className="table-cell text-gray-600 dark:text-gray-300">{request.workspaceId?.workspaceName || "Workspace removed"}</td>
                    <td className="table-cell">{formatDate(request.createdAt)}</td>
                    <td className="table-cell"><StatusBadge value={request.status} /></td>
                    {isAdmin && (
                      <td className="table-cell text-right">
                        {request.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <button className="btn-secondary text-green-700" onClick={() => updateStatus(request._id, "approved")}>
                              Approve
                            </button>
                            <button className="btn-secondary text-red-700" onClick={() => updateStatus(request._id, "rejected")}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Reviewed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
