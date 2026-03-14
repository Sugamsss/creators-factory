export { useAuth, AuthProvider } from "./hooks/useAuth";
export { login, signup, logout, getCurrentUser } from "./services/authApi";
export { buildLoginPath, getPostLoginPath } from "./lib/session-routing";
export type {
  AuthUser,
  AuthSessionResponse,
  LoginCredentials,
  SignupData,
} from "./services/authApi";
