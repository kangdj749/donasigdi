"use client"

export default function ProductSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl shadow-sm p-3 flex flex-col">
      {/* Gambar */}
      <div className="w-full aspect-square bg-gray-200 rounded-xl" />

      {/* Teks */}
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}
