import type { Metadata } from "next";
import { UnitsPage } from "@/components/UnitsPage";

export const metadata: Metadata = {
  title: { absolute: "Genshin Impact Units" },
};

export default function GenshinUnitsPage() {
  return <UnitsPage game="genshin" />;
}
