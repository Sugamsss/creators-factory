"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, FadeIn } from "@/shared/ui/animations";
import { SearchBar } from "@/shared/ui/search-bar";
import { FilterBar } from "@/shared/ui/filter-bar";
import { PageContainer, PageHeader, SectionHeading } from "@/shared/ui/layout";
import { LoadMoreButton } from "@/shared/ui/buttons";
import { FILTER_OPTIONS } from "@/shared/config";
import { useScripts } from "@/features/scripts/hooks";

export default function ScriptsPage() {
  const { scripts } = useScripts();

  const handleGenerateScript = () => {
    console.log("Generate script");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Scripts"
        subtitle="INTELLECTUAL ASSET REPOSITORY & PIPELINE"
        action={{ icon: "edit_note", label: "Generate Script", onClick: handleGenerateScript }}
      />

      <FadeIn direction="up" distance={10} delay={0.1}>
        <div className="mb-12 flex flex-wrap items-center gap-4">
          <SearchBar 
            placeholder="Search..." 
            className="min-w-[160px]"
            inputClassName="py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest bg-white/80 border-[#d6dbd4]"
          />
          <FilterBar filters={[...FILTER_OPTIONS.scripts]} />
        </div>
      </FadeIn>

      <div className="space-y-16">
        <section>
          <SectionHeading title="All Scripts" description="Intellectual assets under management" />

          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden rounded-[24px] bg-white">
            <CardContent className="p-0">
              <StaggerContainer className="divide-y divide-border/30">
                {scripts.map((script) => (
                  <StaggerItem key={script.id}>
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(60,159,149,0.03)" }}
                      className="group p-5 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-5 flex-1">
                        <div className="relative">
                          <motion.div
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center transition-all duration-300 group-hover:bg-brand/10"
                          >
                            <span className="material-symbols-outlined text-brand !text-[20px]">article</span>
                          </motion.div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white bg-ink flex items-center justify-center overflow-hidden shadow-sm">
                            <span className="material-symbols-outlined !text-[12px] text-white">face</span>
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-display text-[15px] font-bold text-ink">
                            {script.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                              {script.avatar}
                            </span>
                            <span className="text-border">·</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                              {script.industry}
                            </span>
                            <span className="text-border">·</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
                              {script.duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted hidden md:block">
                          {script.createdAt}
                        </span>

                        <Badge
                          className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] border-none ${
                            script.status === "ready"
                              ? "bg-tint-green text-status-success"
                              : script.status === "generating"
                              ? "bg-tint-amber text-status-warning"
                              : "bg-tint-brand text-brand"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {script.status === "generating" && (
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="material-symbols-outlined !text-[12px]"
                              >
                                autorenew
                              </motion.span>
                            )}
                            {script.status}
                          </div>
                        </Badge>

                        <div className="flex items-center">
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-muted !text-[20px]">
                              more_vert
                            </span>
                          </motion.button>
                          <span className="material-symbols-outlined text-border opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-brand ml-2">
                            chevron_right
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </CardContent>
          </Card>

          <LoadMoreButton>Load More Scripts</LoadMoreButton>
        </section>
      </div>
    </PageContainer>
  );
}
