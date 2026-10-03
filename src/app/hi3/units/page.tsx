import type { Metadata } from "next";
import { UnitsPage } from "@/components/UnitsPage";

export const metadata: Metadata = {
  title: { absolute: "Honkai Impact 3rd Units" },
};

export default function Hi3UnitsPage() {
  return <UnitsPage game="hi3" />;
}
