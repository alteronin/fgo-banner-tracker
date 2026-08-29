"use client";

import { useRef } from "react";
import { useServantStatus } from "@/contexts/ServantContext";
import type { ServantStatus } from "@/types/banner";

export function ImportExport() {
  const { statuses, setStatus } = useServantStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const data = JSON.stringify(statuses, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fgo-collection.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (typeof data === "object" && data !== null) {
          Object.entries(data).forEach(([slug, status]) => {
            if (["none", "owned", "planning"].includes(status as string)) {
              setStatus(slug, status as ServantStatus);
            }
          });
        }
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportData}
        className="px-3 py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
      >
        Export
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
      >
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importData}
        className="hidden"
      />
    </div>
  );
}
