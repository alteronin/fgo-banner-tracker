import type { Metadata } from "next";
import { FavesPage } from "@/components/FavesPage";

export const metadata: Metadata = {
  title: { absolute: "Zenless Zone Zero Favorites" },
};

export default function ZzzFavesPage() {
  return <FavesPage game="zzz" />;
}
