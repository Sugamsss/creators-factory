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
import { useVideos } from "@/features/videos/hooks";

export default function VideosPage() {
  const { videos } = useVideos();

  const handleCreateVideo = () => {
    console.log("Create video");
  };

  const renderingVideos = videos.filter((v) => v.status === "rendering");

  return (
    <PageContainer>
      <PageHeader
        title="Videos"
        subtitle="MULTIMEDIA ASSETS & RENDERING PIPELINE"
        action={{ icon: "video_call", label: "Create Video", onClick: handleCreateVideo }}
      />

      <FadeIn direction="up" distance={10} delay={0.1}>
        <div className="mb-12 flex flex-wrap items-center gap-4 border-b border-border pb-12">
          <SearchBar 
            placeholder="Search..." 
            className="min-w-[160px]"
            inputClassName="py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest bg-white/80 border-[#d6dbd4]"
          />
          <FilterBar filters={[...FILTER_OPTIONS.videos]} />
        </div>
      </FadeIn>

      <div className="space-y-16">
        <section>
          <SectionHeading
            title="Rendering Queue"
            description="Active synthesis and processing"
          />

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {renderingVideos.map((video) => (
              <StaggerItem key={video.id}>
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden rounded-[24px] bg-white group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgb(0,0,0,0.15)]">
                  <div className="relative h-48 bg-surface-200 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover grayscale opacity-50 transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-brand/30 rounded-full blur-xl"
                        />
                        <div className="relative w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="material-symbols-outlined text-white text-3xl"
                          >
                            sync
                          </motion.span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 w-10 h-10 rounded-full border-2 border-white bg-ink flex items-center justify-center overflow-hidden shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                      <span className="material-symbols-outlined !text-[20px] text-white">face</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-display text-[16px] font-bold text-ink leading-tight line-clamp-1">
                        {video.title}
                      </h3>
                      <Badge className="bg-tint-amber text-status-warning text-[9px] border-none font-bold uppercase tracking-wider">
                        {video.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-muted mb-4">
                      <span>{video.avatar}</span>
                      <span className="text-brand">{video.duration}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-muted">Synthesizing pipeline</span>
                        <span className="text-brand">{video.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-tint-brand rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${video.progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full relative overflow-hidden"
                        >
                          <motion.div
                            animate={{ x: ["100%", "-100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        <section>
          <SectionHeading
            title="All Videos"
            description="Intellectual multimedia assets"
          />

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <StaggerItem key={video.id}>
                <article className="group h-full">
                  <motion.div
                    whileHover={{
                      y: -8,
                      boxShadow: "0 30px 60px -12px rgba(0,0,0,0.15)",
                    }}
                    className="rounded-[24px] overflow-hidden bg-white border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col transition-all duration-500"
                  >
                    <div className="relative h-48 bg-surface-200 overflow-hidden">
                      <motion.img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {video.status === "ready" && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-500">
                            <span className="material-symbols-outlined text-white text-4xl">play_arrow</span>
                          </div>
                        </div>
                      )}

                      <div className="absolute top-4 right-4 flex gap-2 transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">
                        {video.status === "ready" && (
                          <Badge className="bg-tint-green text-status-success border-none font-bold text-[9px] uppercase tracking-wider">
                            Ready
                          </Badge>
                        )}
                        {video.status === "failed" && (
                          <Badge className="bg-tint-red text-status-error border-none font-bold text-[9px] uppercase tracking-wider">
                            Failed
                          </Badge>
                        )}
                      </div>

                      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 rounded-full text-[10px] font-bold text-white backdrop-blur-md transform group-hover:scale-110 transition-transform duration-500">
                        {video.duration}
                      </div>

                      <div className="absolute bottom-4 left-4 w-10 h-10 rounded-full border-2 border-white bg-ink flex items-center justify-center overflow-hidden shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined !text-[20px] text-white">face</span>
                      </div>
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="font-display text-[16px] font-bold text-ink mb-3 line-clamp-1 group-hover:text-brand transition-colors duration-300">
                        {video.title}
                      </h3>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                            Featured Actor
                          </span>
                          <span className="text-[12px] font-bold text-ink">{video.avatar}</span>
                        </div>

                        {video.status === "ready" && (
                          <motion.button
                            whileHover={{ scale: 1.05, x: 5 }}
                            className="bg-brand/10 text-brand px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-brand hover:text-white transition-all duration-300"
                          >
                            OPEN{" "}
                            <span className="material-symbols-outlined !text-[14px]">
                              arrow_forward
                            </span>
                          </motion.button>
                        )}
                      </div>
                    </CardContent>
                  </motion.div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <LoadMoreButton>Load More Assets</LoadMoreButton>
        </section>
      </div>
    </PageContainer>
  );
}
