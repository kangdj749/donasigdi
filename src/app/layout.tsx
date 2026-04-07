import "./globals.css";
import Script from "next/script";
import AttributionProvider from "@/components/system/AttributionProvider";

/* =========================
   METADATA (SEO READY)
========================= */

export const metadata = {
  title: {
    default: "GDI Donasi",
    template: "%s | GDI Donasi",
  },
  description:
    "Platform donasi terpercaya untuk membantu sesama. Salurkan kebaikanmu sekarang.",
  metadataBase: new URL("https://yourdomain.com"),
  openGraph: {
    title: "GDI Donasi",
    description:
      "Platform donasi terpercaya untuk membantu sesama.",
    url: "https://yourdomain.com",
    siteName: "GDI Donasi",
    locale: "id_ID",
    type: "website",
  },
};

/* =========================
   ROOT LAYOUT
========================= */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[rgb(var(--color-surface))] flex justify-center">

        {/* ================= APP CONTAINER ================= */}
        <div className="w-full max-w-[640px] min-h-screen bg-[rgb(var(--color-bg))] shadow-sm">

          {/* 🔥 GLOBAL ATTRIBUTION TRACKING */}
          <AttributionProvider>
            {children}
          </AttributionProvider>

        </div>

        {/* ================= MIDTRANS ================= */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={
            process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
          }
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}