import {
  API_BASE_PATH,
  ApiError,
  parseAuthErrorResponse,
  apiRequest,
} from "@/shared/lib/api-client";

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

  const response = await fetch(`${API_BASE_PATH}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const parsed = await parseAuthErrorResponse(response);
    throw new ApiError(parsed.message || "Login failed", response.status, parsed.code);
  }

  return response.json();
}

export async function signup(data: SignupData): Promise<AuthSessionResponse> {
  const response = await fetch(`${API_BASE_PATH}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const parsed = await parseAuthErrorResponse(response);
    throw new ApiError(parsed.message || "Signup failed", response.status, parsed.code);
  }

  return response.json();
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me");
}

export async function logout(): Promise<void> {
  await apiRequest("/auth/logout", { method: "POST" });
}
