import type { Metadata } from "next";
import "@/styles/globals.css";
import { QueryProvider } from "@/shared/lib/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/features/auth";

export const metadata: Metadata = {
  title: "Creator Studio",
  description: "Create and manage your digital AI avatars",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning={true}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
