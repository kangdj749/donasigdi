"use client";

type Props = {
  title?: string;
  url: string;
  onClose: () => void;
};

export default function ShareSheet({
  title = "Bagikan",
  url,
  onClose,
}: Props) {
  const encoded = encodeURIComponent(url);

  const shareLinks = [
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encoded}`,
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    },
    {
      name: "LINE",
      url: `https://social-plugins.line.me/lineit/share?url=${encoded}`,
    },
    {
      name: "X",
      url: `https://twitter.com/intent/tweet?url=${encoded}`,
    },
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    alert("Link disalin");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* SHEET */}
      <div className="
        relative w-full 
        max-w-md 
        bg-[rgb(var(--color-bg))] 
        rounded-t-2xl 
        p-4 
        space-y-4
      ">

        {/* HANDLE */}
        <div className="w-10 h-1.5 bg-[rgb(var(--color-border))] rounded-full mx-auto" />

        <p className="text-center text-[13px] font-medium">
          {title}
        </p>

        {/* ICONS */}
        <div className="grid grid-cols-5 gap-3 text-center text-[11px]">

          {shareLinks.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              className="space-y-1"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-[rgb(var(--color-soft))] flex items-center justify-center text-[12px]">
                {item.name[0]}
              </div>
              <p>{item.name}</p>
            </a>
          ))}

          {/* TikTok fallback */}
          <button onClick={handleCopy}>
            <div className="w-10 h-10 mx-auto rounded-xl bg-[rgb(var(--color-soft))] flex items-center justify-center">
              T
            </div>
            <p>TikTok</p>
          </button>

        </div>

        {/* COPY */}
        <div className="flex border border-[rgb(var(--color-border))] rounded-lg overflow-hidden">

          <input
            value={url}
            readOnly
            className="flex-1 px-3 py-2 text-[11px] bg-transparent outline-none"
          />

          <button
            onClick={handleCopy}
            className="px-3 text-[12px] bg-[rgb(var(--color-primary))] text-white"
          >
            Salin
          </button>
        </div>

      </div>
    </div>
  );
}