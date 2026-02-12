import "./globals.css";

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
      </body>
    </html>
  );
}
