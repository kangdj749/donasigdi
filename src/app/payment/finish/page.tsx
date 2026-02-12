import { Suspense } from "react";
import PaymentFinishClient from "./payment-finish-client";

export const dynamic = "force-dynamic";

export default function PaymentFinishPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentFinishClient />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="bg-white rounded-xl shadow p-6 text-sm text-gray-500">
        Memproses status pembayaran...
      </div>
    </div>
  );
}
