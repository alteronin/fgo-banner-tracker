import hsrPullMap from "@/data/hsr-pull-map.json";
import genshinPullMap from "@/data/genshin-pull-map.json";
import zzzPullMap from "@/data/zzz-pull-map.json";
import wuwaPullMap from "@/data/wuwa-pull-map.json";
import type { PullGame, PullMap } from "@/types/pulls";

export const PULL_MAPS: Record<PullGame, PullMap> = {
  hsr: hsrPullMap as PullMap,
  genshin: genshinPullMap as PullMap,
  zzz: zzzPullMap as PullMap,
  wuwa: wuwaPullMap as PullMap,
};
