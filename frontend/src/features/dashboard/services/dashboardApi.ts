import type { DashboardStat, ActivityItem, QuickAction } from "../types";

export const MOCK_STATS: DashboardStat[] = [
  { label: "Total Avatars", value: "12", change: "+2 this week", icon: "face" },
  { label: "Active Videos", value: "8", change: "3 rendering", icon: "play_circle" },
  { label: "Scripts Generated", value: "47", change: "+12 this month", icon: "article" },
  { label: "Automations", value: "5", change: "2 running", icon: "bolt" },
];

export const MOCK_RECENT_ACTIVITY: ActivityItem[] = [
  { type: "video", name: "Phonics Lesson 15", avatar: "Amy", status: "rendering", time: "2m ago" },
  { type: "script", name: "Morning Routine Script", avatar: "Marcus", status: "ready", time: "15m ago" },
  { type: "avatar", name: "New Avatar Created", avatar: "Sarah", status: "ready", time: "1h ago" },
  { type: "automation", name: "Daily Batch", avatar: "Multiple", status: "completed", time: "3h ago" },
];

export const MOCK_QUICK_ACTIONS: QuickAction[] = [
  { label: "Create Avatar", icon: "add_circle", href: "/avatars/create/new-avatar" },
  { label: "Generate Script", icon: "edit_note", href: "/scripts" },
  { label: "View Videos", icon: "smart_display", href: "/videos" },
  { label: "Manage Automations", icon: "settings", href: "/automations" },
];
