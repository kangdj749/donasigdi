"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";


type Donation = {
  id: string;
  donor_name: string;
  amount: number;
  payment_status: string;
  message?: string;
  created_at: string;
};

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!id) return;

    const res = await fetch(`/api/donations/status/${id}`);
    const result = await res.json();

    setData(result);
    setLoading(false);
    }, [id]);


  useEffect(() => {
    if (!id) return;

    fetchStatus();

    const interval = setInterval(() => {
        fetchStatus();
    }, 5000);

    return () => clearInterval(interval);
    }, [id, fetchStatus]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat status donasi...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Donasi tidak ditemukan.
      </div>
    );
  }

  const isPaid =
    data.payment_status === "paid" ||
    data.payment_status === "settlement";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
              isPaid
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600 animate-pulse"
            }`}
          >
            {isPaid ? "✓" : "⏳"}
          </div>

          <h1 className="mt-4 text-xl font-semibold text-gray-800">
            {isPaid ? "Donasi Berhasil" : "Menunggu Pembayaran"}
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            {isPaid
              ? "Terima kasih atas kebaikan Anda."
              : "Sistem sedang menunggu konfirmasi pembayaran."}
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">ID Donasi</span>
            <span className="font-medium">{data.id}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Nama</span>
            <span className="font-medium">{data.donor_name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Nominal</span>
            <span className="font-semibold text-gray-800">
              Rp {Number(data.amount).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {data.message && (
          <div className="mt-5 bg-gray-50 rounded-lg p-3 text-sm text-gray-600 italic">
            &ldquo;{data.message}&rdquo;
          </div>
        )}

        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-xl font-medium"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
