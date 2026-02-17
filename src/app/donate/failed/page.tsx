// app/donate/failed/page.tsx

export default function FailedPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 text-center space-y-4">
      <h1 className="text-2xl font-bold text-red-500">
        Pembayaran Gagal
      </h1>
      <p className="text-sm text-gray-600">
        Silakan coba kembali.
      </p>
    </div>
  );
}
