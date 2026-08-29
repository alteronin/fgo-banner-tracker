import { getBanners } from "@/lib/data";
import { BannerList } from "@/components/BannerList";

export default function Home() {
  const banners = getBanners();

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">
            FGO JP Banner Tracker
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track your pulls and plan your quartz
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <BannerList banners={banners} />
      </main>
    </div>
  );
}
