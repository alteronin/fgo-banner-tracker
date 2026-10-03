import type { Metadata } from "next";
import { UnitsPage } from "@/components/UnitsPage";

export const metadata: Metadata = {
  title: { absolute: "Zenless Zone Zero Units" },
};

export default function ZzzUnitsPage() {
  return <UnitsPage game="zzz" />;
}
