import { useState } from "react";
import type { IndustryItem, TrendingEvent } from "../types";
import { MOCK_INDUSTRIES, MOCK_TRENDING_EVENTS } from "../services/industryApi";

export function useIndustries() {
  const [industries] = useState<IndustryItem[]>(MOCK_INDUSTRIES);
  const [trendingEvents] = useState<TrendingEvent[]>(MOCK_TRENDING_EVENTS);

  return { industries, trendingEvents };
}
