import { useState } from "react";
import api, { getErrorMessage } from "../api/client";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: ""
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await api.put("/users/profile", payload);
      updateUser(data.user);
      setForm((current) => ({ ...current, password: "" }));
      showToast("Profile updated");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader title="Profile" description="Update your basic account information." />
      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="panel p-5">
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank to keep current password" />
            </div>
            <button className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        <div className="panel p-5">
          <h3 className="text-base font-semibold">Account Details</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">Role</dt>
              <dd className="mt-1 text-sm font-medium capitalize">{user?.role}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Access Level</dt>
              <dd className="mt-1 text-sm font-medium">
                {user?.role === "admin" ? "Full management access" : "Employee resource access"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Session</dt>
              <dd className="mt-1 text-sm font-medium">JWT authenticated</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Password Storage</dt>
              <dd className="mt-1 text-sm font-medium">bcrypt hashed on server</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Profile;
