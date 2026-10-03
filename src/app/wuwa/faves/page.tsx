import type { Metadata } from "next";
import { FavesPage } from "@/components/FavesPage";

export const metadata: Metadata = {
  title: { absolute: "Wuthering Waves Favorites" },
};

export default function WuwaFavesPage() {
  return <FavesPage game="wuwa" />;
}
