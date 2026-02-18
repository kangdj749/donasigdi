import "./globals.css";
import Script from "next/script";
export const metadata = {
  title: "GDI Donasi",
  description: "Platform Donasi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-100 flex justify-center">
        <div className="w-full max-w-md min-h-screen bg-white shadow-sm">
          {children}
        </div>
     
          <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
