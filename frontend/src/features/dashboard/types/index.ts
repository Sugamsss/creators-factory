export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  icon: string;
}

export interface ActivityItem {
  type: "video" | "script" | "avatar" | "automation";
  name: string;
  avatar: string;
  status: string;
  time: string;
}

export interface QuickAction {
  label: string;
  icon: string;
  href: string;
}
