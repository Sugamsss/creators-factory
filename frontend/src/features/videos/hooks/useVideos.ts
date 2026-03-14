import { useState } from "react";
import type { VideoItem } from "../types";
import { MOCK_VIDEOS } from "../services/videoApi";

export function useVideos() {
  const [videos] = useState<VideoItem[]>(MOCK_VIDEOS);

  const renderingVideos = videos.filter((v) => v.status === "rendering");
  const readyVideos = videos.filter((v) => v.status === "ready");

  return { videos, renderingVideos, readyVideos };
}
