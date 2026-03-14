"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, FadeIn } from "@/shared/ui/animations";
import { SearchBar } from "@/shared/ui/search-bar";
import { FilterBar } from "@/shared/ui/filter-bar";
import { PageContainer, PageHeader, SectionHeading } from "@/shared/ui/layout";
import { FILTER_OPTIONS } from "@/shared/config";
import { useIndustries } from "@/features/industries/hooks";

export default function IndustriesPage() {
  const { industries, trendingEvents } = useIndustries();

  const handleMarketInsights = () => {
    console.log("Market Insights");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Industries"
        subtitle="MARKET SEGMENTS & TOPIC CLUSTERS"
        action={{ icon: "analytics", label: "Market Insights", onClick: handleMarketInsights }}
        meta={{ label: "Active Analysis", value: "12 trending events today" }}
      />

      <FadeIn direction="up" distance={10} delay={0.1}>
        <div className="mb-12 flex flex-wrap items-center gap-4">
          <SearchBar placeholder="DISCOVER TOPICS..." />
          <FilterBar filters={[...FILTER_OPTIONS.industries]} />
        </div>
      </FadeIn>

      <div className="space-y-16">
        <section>
          <SectionHeading title="Your Industries" description="Core sectors under active management" />

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <StaggerItem key={industry.id}>
                <Card className="group relative overflow-hidden bg-white p-7 cursor-pointer h-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] rounded-[24px]">
                  <CardContent className="p-0 relative z-10">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-start justify-between">
                        <motion.div
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          className={`w-14 h-14 rounded-2xl ${industry.color.replace("bg-", "bg-")}/10 flex items-center justify-center transition-colors duration-300`}
                        >
                          <span className={`material-symbols-outlined !text-[28px] ${industry.color.replace("bg-", "text-")}`}>
                            business_center
                          </span>
                        </motion.div>
                        <div className="flex gap-1.5">
                          <Badge className="bg-tint-brand text-brand border-none text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                            {industry.avatarCount} Avatars
                          </Badge>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-display text-[22px] font-bold text-ink leading-tight mb-2 tracking-tight">
                          {industry.name}
                        </h3>
                        <p className="text-[13px] font-medium text-muted leading-relaxed mb-6 line-clamp-2">
                          {industry.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined !text-[16px] text-brand">event_note</span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
                              {industry.eventCount} Events
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-border transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand">
                            arrow_forward
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-white to-${industry.color.replace(
                      "bg-",
                      ""
                    )}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        <section>
          <SectionHeading title="Trending Events" description="Real-time world events impacting your niche" />

          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden rounded-[24px] bg-white">
            <CardContent className="p-0">
              <StaggerContainer className="divide-y divide-border/30">
                {trendingEvents.map((event) => (
                  <StaggerItem key={event.id}>
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(60,159,149,0.03)" }}
                      className="group p-5 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center transition-all duration-300 group-hover:bg-brand/10">
                          {event.trending ? (
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="material-symbols-outlined text-amber-500 !text-[20px]"
                            >
                              trending_up
                            </motion.span>
                          ) : (
                            <span className="material-symbols-outlined text-muted !text-[20px]">topic</span>
                          )}
                        </div>
                        <div>
                          <p className="font-display text-[15px] font-bold text-ink">{event.title}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-0.5">
                            {event.industry}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge
                          className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] border-none ${
                            event.sentiment === "excited"
                              ? "bg-tint-green text-status-success"
                              : event.sentiment === "neutral"
                              ? "bg-tint-brand text-brand"
                              : "bg-tint-amber text-status-warning"
                          }`}
                        >
                          {event.sentiment}
                        </Badge>
                        <span className="material-symbols-outlined text-border opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-brand">
                          chevron_right
                        </span>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageContainer>
  );
}
