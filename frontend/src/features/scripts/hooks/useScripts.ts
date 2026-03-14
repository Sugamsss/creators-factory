import { useState } from "react";
import type { ScriptItem } from "../types";
import { MOCK_SCRIPTS } from "../services/scriptApi";

export function useScripts() {
  const [scripts] = useState<ScriptItem[]>(MOCK_SCRIPTS);

  return { scripts };
}
