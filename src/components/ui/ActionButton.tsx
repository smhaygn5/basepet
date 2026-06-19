"use client";

/**
 * Aksiyon butonu — globals.css'teki `.action-btn` sınıfını kullanır.
 * Feed/Play/Sleep/Toilet/Bath için ikon + etiket.
 */
export function ActionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="action-btn min-w-[72px]"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}
