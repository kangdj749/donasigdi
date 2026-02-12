"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentFinishClient() {
  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("order_id");
  const transactionStatus = params.get("transaction_status");

  const statusMap: Record<
    string,
    { title: string; message: string; color: string }
  > = {
    settlement: {
      title: "Pembayaran Berhasil 🎉",
      message: "Pembayaran kamu berhasil. Pesanan akan segera kami proses.",
      color: "text-green-600",
    },
    capture: {
      title: "Pembayaran Berhasil 🎉",
      message: "Pembayaran kamu berhasil. Pesanan akan segera kami proses.",
      color: "text-green-600",
    },
    pending: {
      title: "Menunggu Pembayaran ⏳",
      message: "Pembayaran belum selesai. Silakan selesaikan pembayaran.",
      color: "text-yellow-600",
    },
    deny: {
      title: "Pembayaran Ditolak ❌",
      message: "Pembayaran ditolak. Silakan coba metode lain.",
      color: "text-red-600",
    },
    cancel: {
      title: "Pembayaran Dibatalkan ❌",
      message: "Kamu membatalkan pembayaran.",
      color: "text-red-600",
    },
    expire: {
      title: "Pembayaran Kedaluwarsa ⌛",
      message: "Waktu pembayaran habis. Silakan ulangi checkout.",
      color: "text-red-600",
    },
  };

  const status =
    transactionStatus && statusMap[transactionStatus]
      ? statusMap[transactionStatus]
      : {
          title: "Status Tidak Diketahui",
          message: "Kami akan menghubungi kamu via WhatsApp.",
          color: "text-gray-600",
        };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-foreground px-4">
      <div className="bg-primary-foreground rounded-2xl shadow-lg p-6 max-w-md w-full text-center space-y-4">
        <h1 className={`text-xl font-bold ${status.color}`}>
          {status.title}
        </h1>

        {orderId && (
          <p className="text-xs text-gray-500">
            Order ID: <span className="font-medium">{orderId}</span>
          </p>
        )}

        <p className="text-gray-600 text-sm">{status.message}</p>

        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/"
            className="rounded-xl bg-primary text-white py-3 text-sm font-semibold hover:opacity-80 transition"
          >
            Kembali ke Beranda
          </Link>

          <button
            onClick={() => router.push("/keranjang")}
            className="rounded-xl border border-border text-primary-foreground bg-primary py-3 text-sm font-medium hover:opacity-80 transition"
          >
            Lihat Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
