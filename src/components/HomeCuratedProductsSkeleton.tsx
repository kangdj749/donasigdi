export default function HomeCuratedProductsSkeleton() {
  return (
    <div className="space-y-12">
      <SkeletonSection />
      <SkeletonSection />
    </div>
  );
}

function SkeletonSection() {
  return (
    <div>
      <div className="h-6 w-48 bg-muted rounded mb-4 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-muted animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
