"use client";

import { useRouter } from "next/navigation";

export default function DonationFailedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl">
            ✕
          </div>

          <h1 className="mt-4 text-xl font-semibold text-gray-800">
            Pembayaran Gagal
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Transaksi tidak dapat diproses atau dibatalkan.
            Silakan coba kembali.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
          Jangan khawatir, dana tidak akan terpotong jika transaksi belum berhasil.
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-xl font-medium"
          >
            Coba Lagi
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full border border-gray-200 hover:bg-gray-50 transition text-gray-700 py-3 rounded-xl font-medium"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
