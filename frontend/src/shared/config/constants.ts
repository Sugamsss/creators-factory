export const NAV_ITEMS = [
  { href: "/dashboard", icon: "grid_view", label: "Dashboard" },
  { href: "/avatars", icon: "face", label: "Avatars" },
  { href: "/industries", icon: "category", label: "Industries" },
  { href: "/scripts", icon: "article", label: "Scripts" },
  { href: "/videos", icon: "play_circle", label: "Videos" },
  { href: "/automations", icon: "bolt", label: "Automations" },
] as const;

export const APP_NAME = "Forge";

export const FILTER_OPTIONS = {
  avatars: ["All Types", "Support", "Marketing", "Sales"],
  videos: ["All Projects", "Recent", "Favorites"],
  scripts: ["All", "Drafts", "Generating", "Ready"],
  automations: ["All", "Active", "Paused", "Drafts"],
  industries: ["All", "Trends", "Market", "Social"],
} as const;
