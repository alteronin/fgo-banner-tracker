import { BannerListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="h-6 bg-gray-800 rounded w-56 animate-pulse" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 space-y-4">
          <div className="h-10 bg-gray-800 rounded-lg animate-pulse" />
          <div className="flex flex-wrap gap-3">
            <div className="h-8 bg-gray-800 rounded-full w-28 animate-pulse" />
            <div className="h-8 bg-gray-800 rounded-full w-28 animate-pulse" />
            <div className="h-8 bg-gray-800 rounded-full w-36 animate-pulse" />
          </div>
        </div>
        <BannerListSkeleton />
      </main>
    </div>
  );
}
