"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, FadeIn } from "@/shared/ui/animations";
import { SearchBar } from "@/shared/ui/search-bar";
import { FilterBar } from "@/shared/ui/filter-bar";
import { PageContainer, PageHeader, SectionHeading } from "@/shared/ui/layout";
import { FILTER_OPTIONS } from "@/shared/config";
import { useAutomations } from "@/features/automations/hooks";

export default function AutomationsPage() {
  const { automations } = useAutomations();

  const handleCreateAutomation = () => {
    console.log("Create automation");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Automations"
        subtitle="AUTONOMOUS WORKFLOWS & EXECUTION ENGINE"
        action={{ icon: "add_circle", label: "Create Automation", onClick: handleCreateAutomation }}
      />

      <FadeIn direction="up" distance={10} delay={0.1}>
        <div className="mb-12 flex flex-wrap items-center gap-4">
          <SearchBar 
            placeholder="Search..." 
            className="min-w-[160px]"
            inputClassName="py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest bg-white/80 border-[#d6dbd4]"
          />
          <FilterBar filters={[...FILTER_OPTIONS.automations]} />
        </div>
      </FadeIn>

      <div className="space-y-16">
        <section>
          <SectionHeading title="Your Automations" description="Managed mission-critical workflows" />

          <StaggerContainer className="space-y-6">
            {automations.map((automation) => (
              <StaggerItem key={automation.id}>
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden rounded-[24px] bg-white group transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="relative">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            className="w-16 h-16 rounded-2xl bg-brand/5 flex items-center justify-center transition-all duration-300 group-hover:bg-brand/10"
                          >
                            <span className="material-symbols-outlined !text-[28px] text-brand">
                              {automation.status === "active"
                                ? "bolt"
                                : automation.status === "paused"
                                ? "pause"
                                : "edit_note"}
                            </span>
                          </motion.div>

                          {automation.status === "active" && (
                            <div className="absolute -right-1 -top-1 flex h-4 w-4">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-40"></span>
                              <span className="relative inline-flex h-4 w-4 rounded-full bg-brand border-2 border-white shadow-sm"></span>
                            </div>
                          )}

                          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white bg-ink flex items-center justify-center overflow-hidden shadow-md transform group-hover:scale-110 transition-transform duration-500">
                            <span className="material-symbols-outlined !text-[16px] text-white">face</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-display text-[18px] font-bold text-ink mb-1 group-hover:text-brand transition-colors duration-300">
                            {automation.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                              {automation.schedule}
                            </p>
                            <span className="text-border">·</span>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-brand">
                              {automation.avatar}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-10">
                        <div className="text-center">
                          <p className="text-3xl font-display font-bold text-ink">
                            {automation.videosGenerated}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
                            videos
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <Badge
                            className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] border-none ${
                              automation.status === "active"
                                ? "bg-tint-green text-status-success"
                                : automation.status === "paused"
                                ? "bg-tint-amber text-status-warning"
                                : "bg-tint-brand text-brand"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {automation.status === "active" && (
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-75"></span>
                                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-success"></span>
                                </span>
                              )}
                              {automation.status}
                            </div>
                          </Badge>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                            {automation.lastRun}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {automation.status === "active" ? (
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2.5 rounded-xl transition-colors text-muted hover:text-status-warning"
                            >
                              <span className="material-symbols-outlined !text-[20px]">pause</span>
                            </motion.button>
                          ) : automation.status === "paused" ? (
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2.5 rounded-xl transition-colors text-muted hover:text-status-success"
                            >
                              <span className="material-symbols-outlined !text-[20px]">play_arrow</span>
                            </motion.button>
                          ) : null}

                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 90, backgroundColor: "rgba(0,0,0,0.05)" }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2.5 rounded-xl transition-colors text-muted hover:text-ink"
                          >
                            <span className="material-symbols-outlined !text-[20px]">settings</span>
                          </motion.button>

                          <span className="material-symbols-outlined text-border opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-brand ml-2">
                            chevron_right
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        <section className="mt-16 border-t border-border pt-12">
          <SectionHeading title="Engine Performance" description="System-wide efficiency metrics" />

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "smart_display", value: "58", label: "Total Videos Generated", animate: "scale" as const },
              { icon: "schedule", value: "12h", label: "Time Saved This Week", animate: "rotate" as const },
              { icon: "trending_up", value: "+15%", label: "Engagement Growth", animate: "y" as const },
            ].map((stat, idx) => (
              <StaggerItem key={idx}>
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                  <CardContent className="p-0 flex flex-col items-center">
                    <motion.div
                      animate={
                        stat.animate === "scale"
                          ? { scale: [1, 1.1, 1] }
                          : stat.animate === "y"
                          ? { y: [0, -5, 0] }
                          : {}
                      }
                      whileHover={stat.animate === "rotate" ? { rotate: 180 } : {}}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="w-14 h-14 rounded-2xl bg-brand/5 flex items-center justify-center mb-4"
                    >
                      <span className="material-symbols-outlined text-brand !text-[28px]">{stat.icon}</span>
                    </motion.div>
                    <p className="text-4xl font-display font-bold text-ink mb-1">{stat.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </div>
    </PageContainer>
  );
}
