export default function CampaignStorySkeleton() {
  return (
    <section className="px-4 mt-10 max-w-lg mx-auto space-y-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />

      <div className="h-48 bg-gray-200 rounded-2xl" />

      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
      </div>
    </section>
  );
}
