import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((items) => [...items, { id, message, type }]);
    setTimeout(() => {
      setToasts((items) => items.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex min-w-72 items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm shadow-lg dark:border-gray-800 dark:bg-gray-950"
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                toast.type === "error" ? "bg-red-600" : "bg-green-600"
              }`}
            />
            <span className="text-gray-800 dark:text-gray-100">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
