import { apiRequest } from "@/shared/lib/api-client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export async function login(
  credentials: LoginCredentials
): Promise<AuthSessionResponse> {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(error.detail || "Login failed");
  }
  return response.json();
}

export async function signup(data: SignupData): Promise<AuthSessionResponse> {
  const response = await fetch("/api/v1/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Signup failed" }));
    throw new Error(error.detail || "Signup failed");
  }
  return response.json();
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me");
}

export async function logout(): Promise<void> {
  await apiRequest("/auth/logout", { method: "POST" });
}

const AUTH_REDIRECT_KEY = "auth_redirect_url";

export function setAuthRedirect(url: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_REDIRECT_KEY, url);
}

export function getAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(AUTH_REDIRECT_KEY);
}

export function clearAuthRedirect(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_REDIRECT_KEY);
}
