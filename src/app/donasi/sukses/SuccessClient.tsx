"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

/* ================= TYPES ================= */

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

/* ================= HELPERS ================= */

function safeNumber(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function formatCurrency(val: unknown): string {
  return `Rp ${safeNumber(val).toLocaleString("id-ID")}`;
}

/* ================= COMPONENT ================= */

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const donationId = searchParams.get("id");

  const [status, setStatus] = useState<PaymentStatus>("checking");
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [payment, setPayment] = useState<PaymentData | null>(null);

  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [timeLeft, setTimeLeft] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= FETCH ================= */

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
        amount: safeNumber(data.amount),
        va_number: data.va_number,
        bank: data.bank,
        expiry_time: data.expiry_time,
      });

      setCampaign({
        title: data.campaign?.title ?? "",
        collected_amount: safeNumber(data.campaign?.collected_amount),
        target_amount: safeNumber(data.campaign?.target_amount),
      });

      switch (data.payment_status) {
        case "paid":
          setStatus("paid");
          stopPolling();
          break;
        case "failed":
          setStatus("failed");
          stopPolling();
          break;
        case "expired":
          setStatus("expired");
          stopPolling();
          break;
        default:
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

    intervalRef.current = setInterval(fetchStatus, 3000);

    const timeout = setTimeout(stopPolling, 120000);

    return () => {
      stopPolling();
      clearTimeout(timeout);
    };
  }, [donationId, fetchStatus]);

  /* ================= REDIRECT ================= */

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

  /* ================= COUNTDOWN ================= */

  useEffect(() => {
    if (!payment?.expiry_time) return;

    const interval = setInterval(() => {
      const diff =
        new Date(payment.expiry_time!).getTime() - Date.now();

      if (diff <= 0) {
        setStatus("expired");
        clearInterval(interval);
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${h}j ${m}m ${s}d`);
    }, 1000);

    return () => clearInterval(interval);
  }, [payment]);

  /* ================= CALC ================= */

  const percent =
    campaign && campaign.target_amount > 0
      ? Math.min(
          100,
          Math.round(
            (campaign.collected_amount / campaign.target_amount) * 100
          )
        )
      : 0;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-surface))] px-4">

      <div className="w-full max-w-md card text-center animate-fadeUp">

        {/* CHECKING */}
        {status === "checking" && (
          <>
            <div className="animate-spin mx-auto mb-6 h-10 w-10 border-4 border-[rgb(var(--color-border))] border-t-[rgb(var(--color-text))] rounded-full" />
            <h1 className="h3">Memverifikasi Pembayaran...</h1>
            <p className="caption">Mohon tunggu sebentar</p>
          </>
        )}

        {/* PENDING */}
        {status === "pending" && payment && (
          <>
            <h1 className="h3 mb-2">Selesaikan Pembayaran</h1>

            <div className="card text-left space-y-3 mt-4">

              <div>
                <p className="caption-subtle">Bank</p>
                <p className="body font-semibold uppercase">
                  {payment.bank}
                </p>
              </div>

              <div>
                <p className="caption-subtle">Virtual Account</p>
                <p className="body font-mono">
                  {payment.va_number}
                </p>
              </div>

              <div>
                <p className="caption-subtle">Total</p>
                <p className="h3">
                  {formatCurrency(payment.amount)}
                </p>
              </div>

              {timeLeft && (
                <p className="caption text-red-500">
                  {timeLeft}
                </p>
              )}
            </div>

            <button
              onClick={fetchStatus}
              className="btn btn-primary w-full mt-4"
            >
              Saya Sudah Bayar
            </button>
          </>
        )}

        {/* PAID */}
        {status === "paid" && campaign && (
          <>
            <h1 className="h3 mb-2">Donasi Berhasil 🎉</h1>

            <p className="caption mb-4">
              Terima kasih atas donasi
              <br />
              <span className="text-primary font-semibold">
                {formatCurrency(payment?.amount)}
              </span>
            </p>

            <div className="text-left mb-6">
              <p className="body font-medium mb-2">
                {campaign.title}
              </p>

              <div className="progress-bar mb-2">
                <div
                  className="progress-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex justify-between caption">
                <span>{percent}%</span>
                <span>
                  {formatCurrency(campaign.collected_amount)}
                </span>
              </div>
            </div>

            <p className="caption mb-4">
              Kembali dalam {redirectCountdown} detik...
            </p>

            <button
              onClick={() => router.push("/")}
              className="btn btn-primary w-full"
            >
              Kembali Sekarang
            </button>
          </>
        )}

        {/* ERROR STATES */}
        {status === "failed" && (
          <button
            onClick={() => router.back()}
            className="btn btn-primary w-full"
          >
            Coba Lagi
          </button>
        )}

        {status === "expired" && (
          <button
            onClick={() => router.push("/")}
            className="btn btn-primary w-full"
          >
            Donasi Ulang
          </button>
        )}

        {status === "error" && (
          <p className="caption">
            Terjadi kesalahan saat verifikasi
          </p>
        )}
      </div>
    </div>
  );
}