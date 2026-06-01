import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const ok = await login(form);
    setSubmitting(false);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden border-r border-gray-200 bg-gray-50 p-10 dark:border-gray-800 dark:bg-gray-900 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              Internal Portal
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-gray-950 dark:text-white">
              Secure Inventory & Workspace Resource Manager
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-300">
              A practical dashboard for office assets, workspace records, and booking approvals.
            </p>
          </div>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="font-medium text-gray-900 dark:text-white">Access control</p>
              <p className="mt-1">Admin and employee accounts use protected sessions.</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="font-medium text-gray-900 dark:text-white">Office records</p>
              <p className="mt-1">Inventory and workspace status stay in one place.</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md animate-[fadeUp_220ms_ease-out]">
            <div className="mb-7">
              <p className="text-sm font-medium text-gray-500">Welcome back</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">Sign in</h2>
              <p className="mt-2 text-sm text-gray-500">Use your workspace account to continue.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <button className="btn-primary w-full" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
              New to the portal?{" "}
              <Link className="font-medium text-blue-700 hover:underline" to="/register">
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
