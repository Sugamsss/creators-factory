"use client";

import { useState, useEffect } from "react";
import { getAvatarAutomations, deleteAutomation } from "@/features/avatars/services/avatarApi";
import type { AutomationItem } from "@/features/automations/types";

interface RemoveFromAutomationsModalProps {
  avatarId: number;
  avatarName: string;
  onClose: () => void;
  onRemoved: () => void;
}

export function RemoveFromAutomationsModal({
  avatarId,
  avatarName,
  onClose,
  onRemoved,
}: RemoveFromAutomationsModalProps) {
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAutomations() {
      try {
        const data = await getAvatarAutomations(avatarId);
        setAutomations(data);
      } catch {
        setError("Failed to load automations");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAutomations();
  }, [avatarId]);

  const handleRemove = async (automationId: number) => {
    setIsRemoving(automationId);
    try {
      await deleteAutomation(automationId);
      setAutomations(prev => prev.filter(a => a.id !== automationId));
    } catch {
      setError("Failed to remove from automation");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleDone = () => {
    onRemoved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-ink mb-2">
          Remove from Automations
        </h2>
        <p className="text-sm text-muted mb-6">
          &quot;{avatarName}&quot; is currently used in the following automations. 
          Remove it to stop generating videos.
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-muted">Loading...</div>
        ) : automations.length === 0 ? (
          <div className="py-8 text-center text-muted">
            <span className="material-symbols-outlined !text-4xl mb-2">check_circle</span>
            <p>No automations using this avatar</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {automations.map((auto) => (
              <div
                key={auto.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
              >
                <div>
                  <p className="font-medium text-ink">{auto.name}</p>
                  <p className="text-xs text-muted">
                    {auto.schedule || "No schedule"} • {auto.videosGenerated} videos generated
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(auto.id)}
                  disabled={isRemoving === auto.id}
                  className="rounded-lg px-3 py-2 text-xs font-bold uppercase bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {isRemoving === auto.id ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleDone}
            className="flex-1 rounded-xl bg-[#1c2120] py-3 text-sm font-bold uppercase text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
