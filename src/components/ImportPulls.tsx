"use client";

import { useRef, useState } from "react";
import hsrPullMap from "@/data/hsr-pull-map.json";
import genshinPullMap from "@/data/genshin-pull-map.json";
import zzzPullMap from "@/data/zzz-pull-map.json";
import wuwaPullMap from "@/data/wuwa-pull-map.json";
import { parsePullFile } from "@/lib/pullImport";
import { getPulls, mergePulls, notifyPullsChange } from "@/lib/pullStorage";
import { fillOwnedUnits, notifyUnitStatusesChange } from "@/lib/unitStorage";
import type { ParsedPulls, PullGame, PullMap } from "@/types/pulls";

const PULL_MAPS: Record<PullGame, PullMap> = {
  hsr: hsrPullMap as PullMap,
  genshin: genshinPullMap as PullMap,
  zzz: zzzPullMap as PullMap,
  wuwa: wuwaPullMap as PullMap,
};

interface Preview {
  parsed: ParsedPulls;
  newCount: number;
}

const formatCount = (value: number) => value.toLocaleString("en-US");

export function ImportPulls({ game }: { game: PullGame }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const parsed = parsePullFile(data, PULL_MAPS);
        if (!parsed || parsed.game !== game) {
          setPreview(null);
          setMessage("This file is not a pull history for this game.");
          return;
        }
        const known = new Set(getPulls(game).map((pull) => pull.id));
        let newCount = 0;
        for (const pull of parsed.pulls) {
          if (!known.has(pull.id)) newCount += 1;
        }
        setMessage(null);
        setPreview({ parsed, newCount });
      } catch {
        setPreview(null);
        setMessage("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cancel = () => {
    setPreview(null);
    setMessage(null);
  };

  const confirm = () => {
    if (!preview) return;
    const { parsed } = preview;
    const result = mergePulls(game, parsed.pulls);
    if (!result.ok) {
      setMessage("Could not save pulls: browser storage is full.");
      setPreview(null);
      return;
    }
    notifyPullsChange(game);
    const filled = fillOwnedUnits(game, parsed.pulledUnitIds);
    if (filled > 0) notifyUnitStatusesChange(game);
    setMessage(
      `Imported ${formatCount(result.added)} new pulls (${formatCount(result.total)} total) · ` +
        `${formatCount(filled)} units marked owned.`
    );
    setPreview(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
        >
          Import Pulls
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFile}
          className="hidden"
        />
        {message && <p className="text-sm text-gray-400">{message}</p>}
      </div>

      {preview && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4 space-y-3">
          <div className="space-y-1 text-sm text-gray-300">
            <p>
              {formatCount(preview.parsed.total)} pulls found ·{" "}
              <span className="text-blue-400">
                {formatCount(preview.newCount)} new
              </span>{" "}
              · {formatCount(preview.parsed.pulledUnitIds.length)} units matched
            </p>
            {preview.parsed.warnings.length > 0 && (
              <p className="text-amber-400">
                {preview.parsed.warnings.length} unresolved entries (kept as
                unknown items)
              </p>
            )}
            {preview.parsed.warnings.length > 0 && (
              <p className="text-xs text-gray-500">
                {preview.parsed.warnings
                  .slice(0, 6)
                  .map((warning) => warning.name || `Item ${warning.itemId}`)
                  .join(", ")}
                {preview.parsed.warnings.length > 6 ? " …" : ""}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={confirm}
              className="px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Import
            </button>
            <button
              onClick={cancel}
              className="px-3 py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
