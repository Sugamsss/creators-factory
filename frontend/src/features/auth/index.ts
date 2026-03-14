export { useAuth, AuthProvider } from "./hooks/useAuth";
export {
  login,
  signup,
  logout,
  getCurrentUser,
  setAuthRedirect,
  getAuthRedirect,
  clearAuthRedirect,
} from "./services/authApi";
export type {
  AuthUser,
  AuthSessionResponse,
  LoginCredentials,
  SignupData,
} from "./services/authApi";
