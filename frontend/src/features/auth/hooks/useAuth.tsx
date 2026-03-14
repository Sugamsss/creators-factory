"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AuthUser,
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
} from "../services/authApi";
import { SessionExpiredError } from "@/shared/lib/api-client";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        setUser(null);
        return;
      }
      setUser(null);
    }
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };
    window.addEventListener("auth:session-expired", handleSessionExpired);
    refreshUser().finally(() => setIsLoading(false));
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const login = async (email: string, password: string) => {
    await apiLogin({ email, password });
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
      throw new Error(
        "Login succeeded but session cookie was not persisted. Check cookie settings (secure/samesite), host consistency (localhost vs 127.0.0.1), and restart both servers."
      );
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    await apiSignup({ name, email, password });
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
      throw new Error(
        "Signup succeeded but session cookie was not persisted. Check cookie settings (secure/samesite), host consistency (localhost vs 127.0.0.1), and restart both servers."
      );
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
