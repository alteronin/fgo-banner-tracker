import type { Metadata } from "next";
import { FavesPage } from "@/components/FavesPage";

export const metadata: Metadata = {
  title: { absolute: "Honkai Impact 3rd Favorites" },
};

export default function Hi3FavesPage() {
  return <FavesPage game="hi3" />;
}
