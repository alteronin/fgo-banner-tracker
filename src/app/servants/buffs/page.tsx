import type { Metadata } from "next";
import { ServantBuffPage } from "@/components/ServantBuffPage";

export const metadata: Metadata = {
  title: { absolute: "Servant Buff Finder" },
};

interface ServantBuffsPageProps {
  searchParams: Promise<{ search?: string | string[] }>;
}

export default async function ServantBuffsPage({
  searchParams,
}: ServantBuffsPageProps) {
  const raw = (await searchParams).search;
  const first = Array.isArray(raw) ? raw[0] : raw;
  const initialSearch = first ? first : null;
  return <ServantBuffPage initialSearch={initialSearch} />;
}
