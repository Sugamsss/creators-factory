export interface IndustryItem {
  id: string;
  name: string;
  description: string;
  avatarCount: number;
  eventCount: number;
  color: string;
}

export interface TrendingEvent {
  id: number;
  title: string;
  industry: string;
  sentiment: "excited" | "neutral" | "curious";
  trending: boolean;
}
