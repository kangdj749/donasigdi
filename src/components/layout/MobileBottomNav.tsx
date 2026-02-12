"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, User } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const items = [
    {
      label: "Beranda",
      href: "/",
      icon: Home,
    },
    {
      label: "Campaign",
      href: "/campaign",
      icon: Heart,
    },
    {
      label: "Akun",
      href: "/akun",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background md:hidden">
      <div className="flex items-center justify-around py-2">

        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href ||
            pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs ${
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
