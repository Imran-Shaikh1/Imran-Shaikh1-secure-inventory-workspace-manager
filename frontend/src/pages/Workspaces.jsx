import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { titleCase } from "../utils/format";

const blankForm = { workspaceName: "", type: "desk", status: "available" };

const Workspaces = () => {
  const { user, syncSession } = useAuth();
  const { showToast } = useToast();
  const [workspaces, setWorkspaces] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin";
  const availableCount = workspaces.filter((workspace) => workspace.status === "available").length;
  const occupiedCount = workspaces.filter((workspace) => workspace.status === "occupied").length;
  const maintenanceCount = workspaces.filter((workspace) => workspace.status === "maintenance").length;

  const loadWorkspaces = async (overrides = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get("/workspaces", {
        params: {
          search: overrides.search ?? search,
          status: overrides.status ?? status
        }
      });
      setWorkspaces(data);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const resetForm = () => {
    setForm(blankForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/workspaces/${editingId}`, form);
        showToast("Workspace updated");
      } else {
        await api.post("/workspaces", form);
        showToast("Workspace added");
      }
      resetForm();
      loadWorkspaces();
    } catch (error) {
      if (error?.response?.status === 403) await syncSession();
      showToast(getErrorMessage(error), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this workspace?")) return;
    try {
      await api.delete(`/workspaces/${id}`);
      showToast("Workspace deleted");
      loadWorkspaces();
    } catch (error) {
      if (error?.response?.status === 403) await syncSession();
      showToast(getErrorMessage(error), "error");
    }
  };

  const requestWorkspace = async (workspaceId) => {
    try {
      await api.post("/requests", { workspaceId });
      showToast("Workspace booking request submitted");
      loadWorkspaces();
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Workspace Management"
        description={isAdmin ? "Maintain desks, meeting rooms, and workspace status." : "Browse available workspaces and request a booking."}
      />

      <div className={isAdmin ? "grid gap-5 xl:grid-cols-[360px_1fr]" : "max-w-6xl space-y-5"}>
        {isAdmin && (
          <form onSubmit={handleSubmit} className="panel h-fit p-5">
            <h3 className="mb-4 text-base font-semibold">{editingId ? "Edit Workspace" : "Add Workspace"}</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Workspace Name</label>
                <input className="input" value={form.workspaceName} onChange={(e) => setForm({ ...form, workspaceName: e.target.value })} required />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="desk">Desk</option>
                  <option value="meeting-room">Meeting Room</option>
                  <option value="private-office">Private Office</option>
                  <option value="lab">Lab</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" type="submit">
                  {editingId ? "Save" : "Add Workspace"}
                </button>
                {editingId && <button className="btn-secondary" type="button" onClick={resetForm}>Cancel</button>}
              </div>
            </div>
          </form>
        )}

        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="panel p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Available</p>
              <p className="mt-2 text-2xl font-semibold">{availableCount}</p>
            </div>
            <div className="panel p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Occupied</p>
              <p className="mt-2 text-2xl font-semibold">{occupiedCount}</p>
            </div>
            <div className="panel p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Maintenance</p>
              <p className="mt-2 text-2xl font-semibold">{maintenanceCount}</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); loadWorkspaces(); }} className="panel flex flex-col gap-3 p-4 md:flex-row">
            <div className="flex-1">
              <input className="input" placeholder="Search workspace or type" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="input md:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button className="btn-secondary" type="submit">Apply</button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("");
                loadWorkspaces({ search: "", status: "" });
              }}
            >
              Clear
            </button>
          </form>

          {loading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          ) : workspaces.length === 0 ? (
            <EmptyState title="No workspaces found" description="Try a different filter or add a workspace." />
          ) : (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {workspaces.map((workspace) => (
                <div key={workspace._id} className="panel panel-hover flex min-h-52 flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-semibold leading-6">{workspace.workspaceName}</h3>
                      <p className="mt-1 text-sm text-gray-500">{titleCase(workspace.type)}</p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge value={workspace.status} />
                    </div>
                  </div>
                  <div className="mt-5 rounded-md bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Booked by</p>
                    <p className="mt-1 break-words">{workspace.bookedBy?.name || "Not assigned"}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    {!isAdmin && workspace.status === "available" && (
                      <button className="btn-primary" onClick={() => requestWorkspace(workspace._id)}>
                        Request booking
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button className="btn-secondary" onClick={() => { setEditingId(workspace._id); setForm({ workspaceName: workspace.workspaceName, type: workspace.type, status: workspace.status }); }}>
                          Edit
                        </button>
                        <button className="btn-secondary text-red-700" onClick={() => handleDelete(workspace._id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Workspaces;
