import { Sidebar } from "@/shared/ui/sidebar";
import { AnimatedPage } from "@/shared/ui/animated-page";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_#c8d2bf_0%,_#b8c7af_35%,_#b4c3ab_100%)] py-4 pr-4">
      <Sidebar />
      <main className="ml-4 flex-1 rounded-[34px] border border-white/45 bg-[#eef1ec] shadow-[0_26px_60px_-24px_rgba(0,0,0,0.28)] overflow-hidden">
        <AnimatedPage>
          {children}
        </AnimatedPage>
      </main>
    </div>
  );
}
