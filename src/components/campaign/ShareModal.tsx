"use client";

export default function ShareModal({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">

      <div className="w-full max-w-md bg-[rgb(var(--color-bg))] rounded-t-2xl p-4 space-y-3">

        <p className="text-[13px] font-semibold text-center">
          🚀 Bagikan Doa
        </p>

        <textarea
          value={text}
          readOnly
          className="w-full text-[12px] p-3 border rounded-lg border-[rgb(var(--color-border))]"
        />

        <div className="grid grid-cols-2 gap-2">

          <button
            onClick={() =>
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
            }
            className="btn"
          >
            WhatsApp
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(text)}
            className="btn"
          >
            Copy
          </button>

        </div>

        <button
          onClick={onClose}
          className="w-full text-[12px] text-[rgb(var(--color-muted))]"
        >
          Tutup
        </button>

      </div>
    </div>
  );
}