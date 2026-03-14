import { useState } from "react";
import type { DashboardStat, ActivityItem, QuickAction } from "../types";
import { MOCK_STATS, MOCK_RECENT_ACTIVITY, MOCK_QUICK_ACTIONS } from "../services/dashboardApi";

export function useDashboard() {
  const [stats] = useState<DashboardStat[]>(MOCK_STATS);
  const [recentActivity] = useState<ActivityItem[]>(MOCK_RECENT_ACTIVITY);
  const [quickActions] = useState<QuickAction[]>(MOCK_QUICK_ACTIONS);

  return { stats, recentActivity, quickActions };
}
