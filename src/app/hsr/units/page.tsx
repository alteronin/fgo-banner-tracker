import type { Metadata } from "next";
import { UnitsPage } from "@/components/UnitsPage";

export const metadata: Metadata = {
  title: { absolute: "Honkai: Star Rail Units" },
};

export default function HsrUnitsPage() {
  return <UnitsPage game="hsr" />;
}
