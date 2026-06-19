"use client";

import { ActionButton } from "@/components/ui/ActionButton";
import { ActionType } from "@/lib/contracts";

const ACTIONS: { type: ActionType; icon: string; label: string }[] = [
  { type: ActionType.FEED, icon: "🍖", label: "Feed" },
  { type: ActionType.PLAY, icon: "🎮", label: "Play" },
  { type: ActionType.SLEEP, icon: "🌙", label: "Sleep" },
  { type: ActionType.TOILET, icon: "💧", label: "Toilet" },
  { type: ActionType.BATH, icon: "🚿", label: "Bath" },
];

/**
 * Bakım aksiyonu butonları (Feed/Play/Sleep/Toilet/Bath) — presentational.
 * TX mantığı dashboard'da; burada sadece tıklama iletilir.
 */
export function PetActions({
  onAction,
  disabled,
}: {
  onAction: (action: ActionType) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {ACTIONS.map((a) => (
        <ActionButton
          key={a.type}
          icon={a.icon}
          label={a.label}
          disabled={disabled}
          onClick={() => onAction(a.type)}
        />
      ))}
    </div>
  );
}
