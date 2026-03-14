export interface ScriptItem {
  id: number;
  title: string;
  avatar: string;
  industry: string;
  duration: string;
  status: "ready" | "draft" | "generating";
  createdAt: string;
}
