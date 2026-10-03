import type { Metadata } from "next";
import { PullsEmptyPage } from "@/components/PullsEmptyPage";

export const metadata: Metadata = {
  title: { absolute: "Honkai Impact 3rd Pulls" },
};

export default function Hi3PullsPage() {
  return <PullsEmptyPage game="hi3" />;
}
