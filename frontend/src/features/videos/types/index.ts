export interface VideoItem {
  id: number;
  title: string;
  avatar: string;
  duration: string;
  status: "rendering" | "ready" | "failed";
  progress: number;
  thumbnail: string;
}
