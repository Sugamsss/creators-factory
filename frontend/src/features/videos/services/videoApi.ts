import type { VideoItem } from "../types";

export const MOCK_VIDEOS: VideoItem[] = [
  {
    id: 1,
    title: "Phonics Lesson 15 - Letter Sounds",
    avatar: "Amy",
    duration: "4:32",
    status: "rendering",
    progress: 67,
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=225&fit=crop",
  },
  {
    id: 2,
    title: "Market Analysis - January 2026",
    avatar: "Marcus",
    duration: "8:15",
    status: "ready",
    progress: 100,
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=225&fit=crop",
  },
  {
    id: 3,
    title: "Healthy Morning Routine",
    avatar: "Elena",
    duration: "6:45",
    status: "ready",
    progress: 100,
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop",
  },
  {
    id: 4,
    title: "Introduction to React Hooks",
    avatar: "Leo",
    duration: "12:20",
    status: "failed",
    progress: 45,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
  },
];
