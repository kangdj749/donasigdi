"use client";

type Props = {
  categories: string[];
  active: string;
  onChange: (v: string) => void;
};

export default function CategoryChips({
  categories,
  active,
  onChange,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onChange("all")}
        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border transition ${
          active === "all"
            ? "bg-pink-500 border-pink-500 text-white"
            : "border-pink-200 text-pink-600 hover:bg-pink-50"
        }`}
      >
        Semua
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border transition ${
            active === cat
              ? "bg-pink-500 border-pink-500 text-white"
              : "border-pink-200 text-pink-600 hover:bg-pink-50"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
