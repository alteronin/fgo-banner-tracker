import type { Metadata } from "next";
import { PullsEmptyPage } from "@/components/PullsEmptyPage";

export const metadata: Metadata = {
  title: { absolute: "FGO Pulls" },
};

export default function FgoPullsPage() {
  return <PullsEmptyPage game="" />;
}
