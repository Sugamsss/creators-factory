export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#c8d2bf_0%,_#b8c7af_35%,_#b4c3ab_100%)]">
      <main className="w-full max-w-md mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
