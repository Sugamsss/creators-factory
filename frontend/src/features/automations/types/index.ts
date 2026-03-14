export interface AutomationItem {
  id: number;
  name: string;
  schedule: string;
  avatar: string;
  status: "active" | "paused" | "draft";
  videosGenerated: number;
  lastRun: string;
}
