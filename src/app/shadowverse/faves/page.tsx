import type { Metadata } from "next";
import { FavesPage } from "@/components/FavesPage";

export const metadata: Metadata = {
  title: { absolute: "Shadowverse: Worlds Beyond Favorites" },
};

export default function ShadowverseFavesPage() {
  return <FavesPage game="shadowverse" />;
}
