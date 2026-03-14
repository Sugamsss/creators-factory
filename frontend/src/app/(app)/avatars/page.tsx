"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StaggerContainer, StaggerItem, FadeIn } from "@/shared/ui/animations";
import { AvatarCard } from "@/features/avatars/components/AvatarCard";

const draftCards = [
  {
    id: 1,
    title: "Draft Project 1",
    modified: "Modified just now",
    status: "Training Identity",
    statusTone: "amber",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&h=1200&fit=crop",
    isTraining: true,
  },
  {
    id: 2,
    title: "Draft Project 2",
    modified: "Modified 1h ago",
    status: "Synthesis Failed",
    statusTone: "red",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=1200&fit=crop",
  },
  {
    id: 3,
    title: "Draft Project 3",
    modified: "Modified 2h ago",
    status: "Training Identity",
    statusTone: "amber",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&h=1200&fit=crop",
    isTraining: true,
  },
  {
    id: 4,
    title: "Draft Project 4",
    modified: "Modified 3h ago",
    status: "Synthesis Failed",
    statusTone: "red",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&h=1200&fit=crop",
  },
  {
    id: 5,
    title: "Draft Project 5",
    modified: "Modified 4h ago",
    status: "Training Identity",
    statusTone: "amber",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=900&h=1200&fit=crop",
    isTraining: true,
  },
];

const deploymentCards = [
  {
    id: 1,
    title: "Sarah Jenkins",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=1200&fit=crop",
    role: "Brand Ambassador",
    isActive: true,
    modified: "Active now",
  },
  {
    id: 2,
    title: "Michael Chen",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&h=1200&fit=crop",
    role: "Tech Support Expert",
    modified: "2 days ago",
  },
  {
    id: 3,
    title: "Elena Rodriguez",
    image: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=900&h=1200&fit=crop",
    role: "Customer Success",
    modified: "1 week ago",
  },
  {
    id: 4,
    title: "David Wilson",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=1200&fit=crop",
    role: "Sales Executive",
    modified: "3 weeks ago",
  },
  {
    id: 5,
    title: "Amai Nakamura",
    image: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=900&h=1200&fit=crop",
    role: "Content Strategist",
    modified: "1 month ago",
  },
];

export default function AvatarsPage() {
  const router = useRouter();

  const handleCreateNew = () => {
    router.push("/avatars/create/new-avatar");
  };

  const handleResumeDraft = (id: string | number) => {
    router.push(`/avatars/create/draft-${id}`);
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-6 pb-8 pt-6 lg:px-8">
        <FadeIn direction="down" distance={10}>
          <header className="mb-12 flex items-end justify-between border-b border-[#d6dbd4] pb-10">
            <div className="flex flex-col gap-3">
              <h1 className="font-display text-7xl font-bold leading-none tracking-tight text-[#1f3027]">Avatars</h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8ca1c5]">
                Manage, train, and deploy your intelligent digital workforce
              </p>
            </div>
            
            <motion.button 
              onClick={handleCreateNew}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-[#1c2120] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(60,159,149,0.25)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#3c9f95] to-[#90d5c8] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <span className="material-symbols-outlined !text-[20px] text-[#3c9f95] transition-transform duration-300 group-hover:scale-110">add_circle</span>
              Create Avatar
            </motion.button>
          </header>
        </FadeIn>

        <section className="mb-10">
          <FadeIn direction="up" distance={10}>
            <div className="mb-5 flex gap-2.5">
              <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
              <div className="flex flex-col justify-center">
                <h2 className="font-display text-2xl leading-tight text-[#233529]">Continue</h2>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                  pickup where you left off
                </p>
              </div>
            </div>
          </FadeIn>

          <StaggerContainer className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {draftCards.map((card) => (
              <StaggerItem key={card.id}>
                <AvatarCard
                  id={card.id}
                  title={card.title}
                  image={card.image}
                  status={card.status}
                  statusTone={card.statusTone as any}
                  modified={card.modified}
                  isTraining={card.isTraining}
                  type="draft"
                  onAction={() => handleResumeDraft(card.id)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        <section>
          <FadeIn direction="up" distance={10}>
            <div className="mb-5 flex items-end justify-between">
              <div className="flex gap-2.5">
                <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-2xl leading-tight text-[#233529]">My Avatars</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                    all the avatars you created
                  </p>
                </div>
              </div>
              <button className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#2f9488] transition-colors hover:text-[#3c9f95]">
                Manage All (10)
              </button>
            </div>
          </FadeIn>

          <StaggerContainer className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {deploymentCards.map((card) => (
              <StaggerItem key={card.id}>
                <AvatarCard
                  id={card.id}
                  title={card.title}
                  image={card.image}
                  role={card.role}
                  isActive={card.isActive}
                  modified={card.modified}
                  type="deployment"
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        <section className="mb-14 mt-14">
          <FadeIn direction="up" distance={10}>
            <div className="mb-5 flex items-end justify-between">
              <div className="flex gap-2.5">
                <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-2xl leading-tight text-[#233529]">Organisation's Avatars</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                    Shared Avatars Across Your Team
                  </p>
                </div>
              </div>
              <button className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#2f9488] transition-colors hover:text-[#3c9f95]">
                Browse All
              </button>
            </div>
          </FadeIn>

          <StaggerContainer className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {deploymentCards.slice(0, 3).map((card) => (
              <StaggerItem key={`org-${card.id}`}>
                <AvatarCard
                  id={card.id}
                  title={`${card.title} (Org)`}
                  image={card.image}
                  role="Corporate rep"
                  modified="1 day ago"
                  type="deployment"
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        <section className="mt-14 border-t border-[#d6dbd4] pt-12">
          <FadeIn direction="up" distance={10}>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex gap-2.5">
                  <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                  <div className="flex flex-col justify-center">
                    <h2 className="font-display text-2xl leading-tight text-[#233529]">Other Avatars</h2>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                      marketplace to buy and use other avatars
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8da1bf] transition-colors duration-300 peer-focus:text-[#3c9f95]">search</span>
                  <input 
                    type="text" 
                    placeholder="SEARCH AVATARS..." 
                    className="peer w-full rounded-2xl border border-[#d6dbd4] bg-white/50 py-4 pl-12 pr-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1c2120] ring-[#3c9f95] transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:shadow-[0_8px_30px_rgb(60,159,149,0.1)]"
                  />
                </div>
                
                <div className="flex gap-2">
                  {["All Types", "Support", "Marketing", "Sales"].map((filter) => (
                    <button 
                      key={filter}
                      className={`rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                        filter === "All Types" 
                          ? "bg-[#1c2120] text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]" 
                          : "bg-white text-[#5c6d66] border border-[#d6dbd4] hover:border-[#3c9f95] hover:text-[#3c9f95] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(60,159,149,0.1)]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <StaggerContainer className="flex flex-wrap gap-x-4 gap-y-8">
            {[...deploymentCards, ...draftCards].map((card, idx) => (
              <StaggerItem key={`other-${idx}`}>
                <AvatarCard
                  id={card.id}
                  title={card.title}
                  image={card.image}
                  role="Public Identity"
                  modified="Updated recently"
                  type="deployment"
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
          
          <div className="mt-12 flex justify-center pb-12">
            <button className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1c2120] shadow-[0_4px_14px_rgba(0,0,0,0.05)] border border-[#d6dbd4] transition-all duration-300 hover:border-[#3c9f95] hover:text-[#3c9f95] hover:shadow-[0_8px_30px_rgba(60,159,149,0.15)] hover:-translate-y-1">
              Load More Avatars
              <span className="material-symbols-outlined !text-[18px] transition-transform duration-300 group-hover:translate-y-0.5">expand_more</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
