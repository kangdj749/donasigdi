"use client";

import { useRouter } from "next/navigation";

type Props = {
  defaultValue?: string;
};

export default function SearchBarClient({ defaultValue = "" }: Props) {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const input = form.elements.namedItem("q") as HTMLInputElement;
    const keyword = input.value.trim();

    if (!keyword) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        key={defaultValue} // 🔥 PAKSA REMOUNT SAAT URL BERUBAH
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Cari produk..."
        className="w-full border border-border rounded-lg px-4 py-2"
      />

      <button
        type="submit"
        className="bg-primary text-primary-foreground px-4 rounded-lg"
      >
        Cari
      </button>
    </form>
  );
}
