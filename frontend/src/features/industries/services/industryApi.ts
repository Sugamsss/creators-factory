import type { IndustryItem, TrendingEvent } from "../types";

export const MOCK_INDUSTRIES: IndustryItem[] = [
  {
    id: "education",
    name: "Education",
    description: "Phonics, language learning, STEM education",
    avatarCount: 4,
    eventCount: 12,
    color: "bg-blue-500",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Personal finance, investing, market analysis",
    avatarCount: 3,
    eventCount: 8,
    color: "bg-green-500",
  },
  {
    id: "health",
    name: "Health & Wellness",
    description: "Fitness, nutrition, mental health",
    avatarCount: 2,
    eventCount: 15,
    color: "bg-red-400",
  },
  {
    id: "tech",
    name: "Technology",
    description: "Software reviews, coding tutorials, tech news",
    avatarCount: 5,
    eventCount: 20,
    color: "bg-purple-500",
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    description: "Fashion, home decor, travel",
    avatarCount: 3,
    eventCount: 9,
    color: "bg-pink-400",
  },
  {
    id: "business",
    name: "Business",
    description: "Entrepreneurship, leadership, career growth",
    avatarCount: 2,
    eventCount: 11,
    color: "bg-amber-500",
  },
];

export const MOCK_TRENDING_EVENTS: TrendingEvent[] = [
  {
    id: 1,
    title: "New AI Tools for Teachers",
    industry: "Education",
    sentiment: "excited",
    trending: true,
  },
  {
    id: 2,
    title: "Federal Interest Rate Decision",
    industry: "Finance",
    sentiment: "neutral",
    trending: true,
  },
  {
    id: 3,
    title: "Remote Work Trends 2026",
    industry: "Business",
    sentiment: "curious",
    trending: false,
  },
];
