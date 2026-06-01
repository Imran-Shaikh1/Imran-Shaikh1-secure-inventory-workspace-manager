import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const blankForm = { itemName: "", category: "", quantity: 1, status: "available" };

const Inventory = () => {
  const { user, syncSession } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  const loadItems = async (overrides = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get("/inventory", {
        params: {
          search: overrides.search ?? search,
          status: overrides.status ?? status,
          page: overrides.page ?? page
        }
      });
      setItems(data.items);
      setPages(data.pages || 1);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [page]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    loadItems();
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/inventory/${editingId}`, form);
        showToast("Inventory item updated");
      } else {
        await api.post("/inventory", form);
        showToast("Inventory item added");
      }
      resetForm();
      loadItems();
    } catch (error) {
      if (error?.response?.status === 403) await syncSession();
      showToast(getErrorMessage(error), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this inventory item?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      showToast("Inventory item deleted");
      loadItems();
    } catch (error) {
      if (error?.response?.status === 403) await syncSession();
      showToast(getErrorMessage(error), "error");
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Inventory Management"
        description={isAdmin ? "Add, update, and monitor company assets." : "View available office inventory."}
      />

      <div className={isAdmin ? "grid gap-5 xl:grid-cols-[360px_1fr]" : "max-w-6xl space-y-5"}>
        {isAdmin && (
          <form onSubmit={handleSubmit} className="panel h-fit p-5">
            <h3 className="mb-4 text-base font-semibold">{editingId ? "Edit Item" : "Add Inventory Item"}</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Item Name</label>
                <input className="input" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} required />
              </div>
              <div>
                <label className="label">Category</label>
                <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
              </div>
              <div>
                <label className="label">Quantity</label>
                <input className="input" type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" type="submit">
                  {editingId ? "Save" : "Add Item"}
                </button>
                {editingId && (
                  <button className="btn-secondary" type="button" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        <section className="space-y-4">
          <form onSubmit={handleSearch} className="panel flex flex-col gap-3 p-4 md:flex-row">
            <div className="flex-1">
              <input className="input" placeholder="Search item or category" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="input md:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
            <button className="btn-secondary" type="submit">Apply</button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("");
                setPage(1);
                loadItems({ search: "", status: "", page: 1 });
              }}
            >
              Clear
            </button>
          </form>

          {loading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          ) : items.length === 0 ? (
            <EmptyState title="No inventory found" description="Try changing the search or add the first inventory item." />
          ) : (
            <div className="panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="table-heading">Item</th>
                      <th className="table-heading">Category</th>
                      <th className="table-heading">Qty</th>
                      <th className="table-heading">Status</th>
                      {isAdmin && <th className="table-heading text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {items.map((item) => (
                      <tr key={item._id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="table-cell font-medium">{item.itemName}</td>
                        <td className="table-cell text-gray-600 dark:text-gray-300">{item.category}</td>
                        <td className="table-cell">{item.quantity}</td>
                        <td className="table-cell"><StatusBadge value={item.status} /></td>
                        {isAdmin && (
                          <td className="table-cell text-right">
                            <button className="btn-secondary mr-2" onClick={() => { setEditingId(item._id); setForm({ itemName: item.itemName, category: item.category, quantity: item.quantity, status: item.status }); }}>
                              Edit
                            </button>
                            <button className="btn-secondary text-red-700" onClick={() => handleDelete(item._id)}>
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
                <p className="text-sm text-gray-500">Page {page} of {pages}</p>
                <div className="flex gap-2">
                  <button className="btn-secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(value - 1, 1))}>Previous</button>
                  <button className="btn-secondary" disabled={page === pages} onClick={() => setPage((value) => Math.min(value + 1, pages))}>Next</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Inventory;
