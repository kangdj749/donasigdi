"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const donationId = searchParams.get("id");

  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!donationId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/donations/status/${donationId}`);
      const data = await res.json();

      if (data.payment_status === "paid") {
        setStatus("paid");
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [donationId]);

  return (
    <div className="container py-20 text-center">
      {status === "checking" && <p>Menunggu konfirmasi pembayaran...</p>}
      {status === "paid" && <p>Terima kasih! Donasi berhasil 🎉</p>}
    </div>
  );
}
