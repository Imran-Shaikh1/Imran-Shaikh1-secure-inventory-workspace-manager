import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee"
  });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const ok = await register(form);
    setSubmitting(false);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden border-r border-gray-200 bg-gray-50 p-10 dark:border-gray-800 dark:bg-gray-900 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              Account Setup
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-gray-950 dark:text-white">
              Secure Inventory & Workspace Resource Manager
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-300">
              Keep company resources organized with simple role-based access.
            </p>
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
            <p className="font-medium text-gray-900 dark:text-white">Role access</p>
            <p className="mt-1">Choose the role assigned for this internal workspace account.</p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md animate-[fadeUp_220ms_ease-out]">
            <div className="mb-7">
              <p className="text-sm font-medium text-gray-500">Create access</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">Register account</h2>
              <p className="mt-2 text-sm text-gray-500">Fill in your details to start a protected session.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="name">Full name</label>
                <input
                  id="name"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="role">Account role</label>
                <select
                  id="role"
                  className="input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button className="btn-primary w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Create account"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
              Already have access?{" "}
              <Link className="font-medium text-blue-700 hover:underline" to="/login">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
