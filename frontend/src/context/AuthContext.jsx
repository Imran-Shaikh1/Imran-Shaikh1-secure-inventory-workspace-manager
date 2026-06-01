import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../api/client";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;
  return {
    id: rawUser._id || rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    role: rawUser.role
  };
};

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const syncSession = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const { data } = await api.get("/auth/me");
      const normalized = normalizeUser(data.user);
      setUser(normalized);
      localStorage.setItem("user", JSON.stringify(normalized));
      return normalized;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    syncSession().finally(() => setLoading(false));
  }, [syncSession]);

  useEffect(() => {
    const refreshFromStorage = () => {
      syncSession();
    };
    const handleStorage = (event) => {
      if (event.key === "token" || event.key === "user") refreshFromStorage();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshFromStorage();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshFromStorage);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshFromStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [syncSession]);

  const login = async (payload) => {
    try {
      const { data } = await api.post("/auth/login", payload);
      const normalized = normalizeUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(normalized));
      setUser(normalized);
      showToast("Signed in successfully");
      return true;
    } catch (error) {
      showToast(getErrorMessage(error), "error");
      return false;
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      const normalized = normalizeUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(normalized));
      setUser(normalized);
      showToast("Account created successfully");
      return true;
    } catch (error) {
      showToast(getErrorMessage(error), "error");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    showToast("Signed out");
  };

  const updateUser = (nextUser) => {
    const normalized = normalizeUser(nextUser);
    setUser(normalized);
    localStorage.setItem("user", JSON.stringify(normalized));
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateUser, syncSession }),
    [user, loading, syncSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
