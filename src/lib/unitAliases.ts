import type { UnitGame } from "@/types/units";

export const UNIT_NAME_ALIASES: Record<UnitGame, Record<string, string>> = {
  genshin: {},
  hsr: {},
  zzz: {
    "Jane Doe": "Jane",
    "Astra Yao": "Astra",
    Orphie: "Orphie and Magus",
    "Soldier 0 - Anby": "Soldier 0 Anby",
  },
  wuwa: {},
  hi3: {},
  shadowverse: {},
};
