import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/inventory", label: "Inventory" },
  { to: "/workspaces", label: "Workspaces" },
  { to: "/requests", label: "Requests" },
  { to: "/profile", label: "Profile" }
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const activeClass = ({ isActive }) =>
    isActive ? "sidebar-link sidebar-link-active" : "sidebar-link";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 bg-white transition-transform duration-200 ease-out dark:border-gray-800 dark:bg-gray-950 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800">
          <div>
            <p className="text-base font-semibold text-gray-950 dark:text-white">Secure Inventory</p>
            <p className="mt-0.5 text-xs text-gray-500">Workspace Resource Manager</p>
          </div>
          <button className="btn-secondary lg:hidden" onClick={() => setSidebarOpen(false)}>
            Close
          </button>
        </div>
        <nav className="space-y-1 px-4 py-5">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} className={activeClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-5 text-xs text-gray-500 dark:border-gray-800">
          Internal ERP System
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="btn-secondary lg:hidden" onClick={() => setSidebarOpen(true)}>
              Menu
            </button>
            <div>
              <h1 className="text-base font-semibold sm:text-lg">Operations Dashboard</h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                {user?.name} | {user?.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary"
              onClick={() => setDarkMode((value) => !value)}
              title="Toggle dark mode"
            >
              {darkMode ? "Light" : "Dark"}
            </button>
            <button className="btn-secondary" onClick={logout}>
              Sign out
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
