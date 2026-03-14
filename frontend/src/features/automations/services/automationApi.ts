import type { AutomationItem } from "../types";

export const MOCK_AUTOMATIONS: AutomationItem[] = [
  {
    id: 1,
    name: "Daily Education Content",
    schedule: "Every day at 8:00 AM",
    avatar: "Amy",
    status: "active",
    videosGenerated: 28,
    lastRun: "2 hours ago",
  },
  {
    id: 2,
    name: "Weekly Finance Update",
    schedule: "Every Monday at 9:00 AM",
    avatar: "Marcus",
    status: "active",
    videosGenerated: 12,
    lastRun: "1 day ago",
  },
  {
    id: 3,
    name: "Health Tips Series",
    schedule: "Mon, Wed, Fri at 7:00 AM",
    avatar: "Elena",
    status: "paused",
    videosGenerated: 18,
    lastRun: "3 days ago",
  },
  {
    id: 4,
    name: "Tech News Digest",
    schedule: "Every weekday at 6:00 PM",
    avatar: "Leo",
    status: "draft",
    videosGenerated: 0,
    lastRun: "Never",
  },
];
