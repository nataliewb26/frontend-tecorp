/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  login as loginRequest,
  perfil as perfilRequest,
  registro as registroRequest,
} from "../services/authService";
import { SESSION_STORAGE_KEY } from "../services/api";

const AuthContext = createContext(null);

function readSession() {
  try {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    const session = savedSession ? JSON.parse(savedSession) : null;
    return session?.usuario && session?.token ? session : null;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const token = session?.token;

  const saveSession = useCallback((nextSession) => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession;
  }, []);

  const login = useCallback(
    async (credentials) => saveSession(await loginRequest(credentials)),
    [saveSession]
  );

  const registro = useCallback(
    async (data) => saveSession(await registroRequest(data)),
    [saveSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    function handleSessionCleared() {
      setSession(null);
    }

    window.addEventListener("tecorp:session-cleared", handleSessionCleared);
    return () => {
      window.removeEventListener("tecorp:session-cleared", handleSessionCleared);
    };
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    perfilRequest()
      .then((response) => {
        if (!active) return;

        const usuario = response?.usuario || response;
        setSession((current) => {
          if (!current || current.token !== token) return current;

          const nextSession = { ...current, usuario };
          localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(nextSession)
          );
          return nextSession;
        });
      })
      .catch((error) => {
        if (active && error.status === 401) logout();
      });

    return () => {
      active = false;
    };
  }, [logout, token]);

  const value = useMemo(
    () => ({
      usuario: session?.usuario || null,
      token: session?.token || null,
      login,
      registro,
      logout,
      estaAutenticado: Boolean(session?.token),
      esAdmin: session?.usuario?.rol === "admin",
    }),
    [session, login, registro, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
