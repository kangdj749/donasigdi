"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

type PaymentStatus =
  | "checking"
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "error";

interface PaymentData {
  amount: number;
  va_number?: string;
  bank?: string;
  expiry_time?: string;
}

interface CampaignData {
  title: string;
  collected_amount: number;
  target_amount: number;
}


export default function SuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const donationId = searchParams.get("id");

  const [status, setStatus] = useState<PaymentStatus>("checking");

  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");


  /* ================= FETCH STATUS ================= */

  const fetchStatus = useCallback(async () => {
      if (!donationId) return;

      try {
        const res = await fetch(`/api/donations/status/${donationId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data = await res.json();

        setPayment({
          amount: data.amount,
          va_number: data.va_number,
          bank: data.bank,
          expiry_time: data.expiry_time,
        });

        setCampaign(data.campaign);

        if (data.payment_status === "paid") {
          setStatus("paid");
          stopPolling();
        } else if (data.payment_status === "failed") {
          setStatus("failed");
          stopPolling();
        } else if (data.payment_status === "expired") {
          setStatus("expired");
          stopPolling();
        } else {
          setStatus("pending");
        }
      } catch (err) {
        console.error("Payment status error:", err);
        setStatus("error");
        stopPolling();
      }

    }, [donationId]);


  /* ================= POLLING ================= */

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!donationId) {
      setStatus("error");
      return;
    }

    fetchStatus();

    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, 3000);

    const timeout = setTimeout(() => {
      stopPolling();
    }, 120000);

    return () => {
      stopPolling();
      clearTimeout(timeout);
    };
  }, [donationId, fetchStatus]);

  /* ================= AUTO REDIRECT ================= */

  useEffect(() => {
    if (status !== "paid") return;

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, router]);

  /* ================= CALCULATE PERCENT ================= */

  const percent =
    campaign && campaign.target_amount > 0
      ? Math.min(
          100,
          Math.round(
            (campaign.collected_amount / campaign.target_amount) * 100
          )
        )
      : 0;

      
    const copyVA = async () => {
      if (!payment?.va_number) return;
      await navigator.clipboard.writeText(payment.va_number);
      alert("Nomor VA berhasil disalin");
    };


    useEffect(() => {
    if (!payment?.expiry_time) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(payment.expiry_time!).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setStatus("expired");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(
        (diff % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor(
        (diff % (1000 * 60)) / 1000
      );

      setTimeLeft(
        `${hours}j ${minutes}m ${seconds}d`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [payment]);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">

        {status === "pending" && payment && (
        <>
          <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="text-yellow-600 text-2xl">🏦</span>
          </div>

          <h1 className="text-xl font-semibold mb-2">
            Selesaikan Pembayaran
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            Transfer ke Virtual Account berikut sebelum waktu habis.
          </p>

          <div className="bg-gray-50 p-4 rounded-xl text-left mb-4 space-y-3">

            <div>
              <p className="text-xs text-gray-400">Bank</p>
              <p className="font-semibold uppercase">
                {payment.bank}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Nomor Virtual Account</p>
              <div className="flex justify-between items-center">
                <p className="font-mono font-semibold">
                  {payment.va_number}
                </p>
                <button
                  onClick={copyVA}
                  className="text-xs bg-black text-white px-3 py-1 rounded-lg"
                >
                  Salin
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400">Total Pembayaran</p>
              <p className="font-semibold text-lg">
                Rp {payment.amount.toLocaleString("id-ID")}
              </p>
            </div>

            {timeLeft && (
              <div>
                <p className="text-xs text-gray-400">Berlaku Hingga</p>
                <p className="font-semibold text-red-500">
                  {timeLeft}
                </p>
              </div>
            )}

          </div>

          <button
            onClick={fetchStatus}
            className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:opacity-90"
          >
            Saya Sudah Bayar
          </button>
        </>
      )}



        {status === "checking" && (
          <>
            <div className="animate-spin mx-auto mb-6 h-10 w-10 border-4 border-gray-200 border-t-black rounded-full" />
            <h1 className="text-xl font-semibold mb-2">
              Memverifikasi Pembayaran...
            </h1>
            <p className="text-sm text-gray-500">
              Mohon tunggu sebentar.
            </p>
          </>
        )}

        {status === "paid" && campaign && (
          <>
            <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-2xl">✓</span>
            </div>

            <h1 className="text-xl font-semibold mb-2">
              Donasi Berhasil 🎉
            </h1>

            <p className="text-sm text-gray-500 mb-4">
              Terima kasih atas donasi sebesar
              <br />
              <span className="font-semibold text-black">
                Rp {payment?.amount.toLocaleString("id-ID")}
              </span>
            </p>

            <div className="mb-6 text-left">
              <p className="text-sm font-medium mb-1">
                {campaign.title}
              </p>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-black h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>{percent}%</span>
                <span>
                  Rp {campaign.collected_amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Mengalihkan ke beranda dalam {redirectCountdown} detik...
            </p>

            <button
              onClick={() => router.push("/")}
              className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition"
            >
              Kembali Sekarang
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <h1 className="text-xl font-semibold mb-2">
              Pembayaran Gagal
            </h1>
            <button
              onClick={() => router.back()}
              className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium"
            >
              Coba Lagi
            </button>
          </>
        )}

        {status === "expired" && (
          <>
            <h1 className="text-xl font-semibold mb-2">
              Pembayaran Kedaluwarsa
            </h1>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium"
            >
              Donasi Ulang
            </button>
          </>
        )}

        {status === "error" && (
          <p className="text-sm text-gray-500">
            Terjadi kesalahan saat memverifikasi pembayaran.
          </p>
        )}
      </div>
    </div>
  );
}
