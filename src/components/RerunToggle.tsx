"use client";

interface RerunToggleProps {
  show: boolean;
  onChange: (show: boolean) => void;
}

export function RerunToggle({ show, onChange }: RerunToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!show)}
      aria-pressed={show}
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium transition-all
        ${
          show
            ? "bg-white text-gray-900"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        }
      `}
    >
      Reruns: {show ? "On" : "Off"}
    </button>
  );
}
