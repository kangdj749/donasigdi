export const dynamic = "force-dynamic";

import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h1>
      <p className="text-gray-600 mb-6">
        Terima kasih, pesanan Anda telah kami terima. Admin akan segera menghubungi
        Anda melalui WhatsApp 📱.
      </p>
      <Link
        href="/"
        className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
      >
        Kembali ke Beranda
      </Link>
    </section>
  )
}
