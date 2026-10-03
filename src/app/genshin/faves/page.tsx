import type { Metadata } from "next";
import { FavesPage } from "@/components/FavesPage";

export const metadata: Metadata = {
  title: { absolute: "Genshin Impact Favorites" },
};

export default function GenshinFavesPage() {
  return <FavesPage game="genshin" />;
}
