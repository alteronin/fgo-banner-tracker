export function BannerCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-gray-900 border border-gray-800 animate-pulse">
      <div className="aspect-[480/173] bg-gray-800" />
      <div className="p-3 space-y-3">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-800 rounded w-1/4" />
          <div className="h-3 bg-gray-800 rounded w-1/4" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-6 bg-gray-800 rounded-full w-16" />
          <div className="h-6 bg-gray-800 rounded-full w-20" />
          <div className="h-6 bg-gray-800 rounded-full w-14" />
        </div>
      </div>
    </div>
  );
}

export function BannerListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <BannerCardSkeleton key={i} />
      ))}
    </div>
  );
}
