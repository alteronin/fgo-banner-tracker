import type { Metadata } from "next";
import { UnitsPage } from "@/components/UnitsPage";

export const metadata: Metadata = {
  title: { absolute: "Shadowverse: Worlds Beyond Units" },
};

export default function ShadowverseUnitsPage() {
  return <UnitsPage game="shadowverse" />;
}
