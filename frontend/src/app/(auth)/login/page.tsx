"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { getPostLoginPath, useAuth } from "@/features/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      const redirectUrl = getPostLoginPath(searchParams);
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isAuthLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      const redirectUrl = getPostLoginPath(searchParams);
      router.push(redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[32px] border border-white/45 bg-white/80 backdrop-blur-xl p-8 shadow-[0_26px_60px_-24px_rgba(0,0,0,0.28)]"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2f9d95] text-white shadow-lg mb-4">
          <span className="material-symbols-outlined !text-[28px]">auto_awesome</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-[#1f3027]">Welcome Back</h1>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8ca1c5]">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-2xl border border-[#d6dbd4] bg-white/50 px-5 py-4 text-sm font-medium text-[#1a3a2a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3c9f95]/20 transition-all placeholder:text-[#8ca1c5]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a]">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full rounded-2xl border border-[#d6dbd4] bg-white/50 px-5 py-4 text-sm font-medium text-[#1a3a2a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3c9f95]/20 transition-all placeholder:text-[#8ca1c5]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-[#1c2120] py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg transition-all duration-300 hover:bg-[#3c9f95] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[11px] text-[#8ca1c5]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-[#3c9f95] hover:text-[#2d7a72] transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
