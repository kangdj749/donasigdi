"use client";

import Image from "next/image";
import { cloudinaryImage } from "@/lib/cloudinaryImage";

type Props = {
  name: string;
  logo?: string;
  verified?: boolean;
  totalDonors: number;
};

export default function CampaignTrustBlock({
  name,
  logo,
  verified,
  totalDonors,
}: Props) {
  return (
    <div className="card flex items-center gap-3">

      {/* LOGO */}
      <div className="relative w-10 h-10 shrink-0">
        <div className="w-full h-full rounded-full overflow-hidden border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] flex items-center justify-center">
          
          {logo ? (
            <Image
              src={cloudinaryImage(logo, "thumb")}
              alt={name}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <span className="text-[11px] text-muted">
              Logo
            </span>
          )}
        </div>
      </div>

      {/* TEXT */}
      <div className="flex-1 min-w-0">

        <p className="caption">
          Digalang oleh
        </p>

        <div className="flex items-center gap-1 flex-wrap">

          <span className="body-sm font-semibold truncate">
            {name}
          </span>

          {verified && (
            <span className="text-primary text-[11px] leading-none">
              ✔
            </span>
          )}

        </div>

        <p className="caption mt-[2px]">
          💚 {totalDonors.toLocaleString("id-ID")} donatur
        </p>

      </div>

    </div>
  );
}