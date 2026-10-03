import type { Metadata } from "next";
import { PullsEmptyPage } from "@/components/PullsEmptyPage";

export const metadata: Metadata = {
  title: { absolute: "Shadowverse: Worlds Beyond Pulls" },
};

export default function ShadowversePullsPage() {
  return <PullsEmptyPage game="shadowverse" />;
}
