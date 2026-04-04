"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ================= TYPES ================= */

type Props = {
  slug: string;
  prayersCount?: number;
  donors?: React.ReactNode;
  updates?: React.ReactNode;
};

/* ================= CONFIG ================= */

type TabItem = {
  key: string;
  label: string;
  href: string;
  badge?: number;
};

/* ================= COMPONENT ================= */

export default function CampaignTabs({
  slug,
  prayersCount = 0,
}: Props) {
  const pathname = usePathname();

  const tabs: TabItem[] = [
    {
      key: "story",
      label: "Cerita",
      href: `/campaign/${slug}/story`,
    },
    {
      key: "updates",
      label: "Kabar",
      href: `/campaign/${slug}/updates`,
    },
    {
      key: "prayers",
      label: "Doa",
      href: `/campaign/${slug}/prayers`,
      badge: prayersCount,
    },
    {
      key: "donors",
      label: "Donatur",
      href: `/campaign/${slug}/donors`,
    },
  ];

  const isActive = (href: string) => {
    // exact match OR nested match
    return pathname === href || pathname.startsWith(href + "/");
  };

  /* ================= UI ================= */

  return (
    <div className="w-full">

      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-30 backdrop-blur bg-[rgb(var(--color-bg))]/90 border-b border-[rgb(var(--color-border))]">

        <div className="px-2 py-2">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">

            {tabs.map((tab) => {
              const active = isActive(tab.href);

              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  prefetch={true}
                  className={`
                    relative min-w-[92px] px-3 py-2 rounded-full transition-all duration-200
                    flex items-center justify-center gap-1

                    ${
                      active
                        ? "bg-[rgb(var(--color-soft))] shadow-[var(--shadow-soft)]"
                        : "hover:bg-[rgb(var(--color-soft))]/60"
                    }
                  `}
                >
                  {/* TEXT */}
                  <span
                    className={`
                      caption font-medium transition-colors
                      ${
                        active
                          ? "text-primary"
                          : "text-[rgb(var(--color-muted))]"
                      }
                    `}
                  >
                    {tab.label}
                  </span>

                  {/* BADGE */}
                  {tab.badge !== undefined &&
                    tab.badge > 0 && (
                      <span
                        className={`
                          px-1.5 py-0.5 rounded-full
                          caption-subtle
                          ${
                            active
                              ? "bg-[rgb(var(--color-bg))] text-primary"
                              : "bg-[rgb(var(--color-soft))] text-[rgb(var(--color-muted))]"
                          }
                        `}
                      >
                        {tab.badge}
                      </span>
                    )}
                </Link>
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
}
