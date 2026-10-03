import type { Metadata } from "next";
import { UnitsPage } from "@/components/UnitsPage";

export const metadata: Metadata = {
  title: { absolute: "Wuthering Waves Units" },
};

export default function WuwaUnitsPage() {
  return <UnitsPage game="wuwa" />;
}
