"use client";

import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [user] = useState<User | null>({
    id: "1",
    name: "User Name",
    email: "user@example.com",
    plan: "Free Plan",
  });

  return {
    user,
    isAuthenticated: user !== null,
    isLoading: false,
  };
}
