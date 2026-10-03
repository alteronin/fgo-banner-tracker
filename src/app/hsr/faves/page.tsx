import type { Metadata } from "next";
import { FavesPage } from "@/components/FavesPage";

export const metadata: Metadata = {
  title: { absolute: "Honkai: Star Rail Favorites" },
};

export default function HsrFavesPage() {
  return <FavesPage game="hsr" />;
}
