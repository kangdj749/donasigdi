import Link from "next/link";

type Crumb = {
  name: string;
  href: string;
};

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap gap-1 text-gray-500">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i !== 0 && <span>/</span>}
            {i === items.length - 1 ? (
              <span className="text-gray-900 font-medium">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-black transition"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
