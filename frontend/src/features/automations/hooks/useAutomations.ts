import { useState } from "react";
import type { AutomationItem } from "../types";
import { MOCK_AUTOMATIONS } from "../services/automationApi";

export function useAutomations() {
  const [automations] = useState<AutomationItem[]>(MOCK_AUTOMATIONS);

  return { automations };
}
