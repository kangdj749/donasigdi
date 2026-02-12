"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HybridWhatsAppCTA() {
  const whatsappNumber = "6281224128899"; // nomor WhatsApp toko
  const [waLink, setWaLink] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const referral = urlParams.get("ref");
      const stored = localStorage.getItem("ref");
      const finalRef = referral || stored || "Tanpa Referral";

      if (referral) {
        localStorage.setItem("ref", referral);
      }

      const defaultMessage = [
        "Halo admin Khadeeja Hijab 🌸, saya ingin tanya atau pesan produk dari website resmi Khadeeja Hijab.",
        finalRef ? `\n\n(Referral: ${finalRef})` : "",
      ].join(" ");

      setWaLink(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`
      );
    }
  }, []);

  if (!waLink) return null; // agar aman di SSR

  return (
    <>
      {/* 📱 Sticky CTA Bar (mobile only) */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="bg-primary text-primary-foreground px-4 py-3 shadow-2xl flex items-center justify-between rounded-t-2xl">
          <span className="font-medium text-sm">
            💕 Butuh Bantuan? Chat Admin Sekarang
          </span>
          <Button
            asChild
            className="bg-white text-primary font-semibold rounded-xl px-4 py-2 hover:opacity-50 transition"
          >
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
        </div>
      </motion.div>

      {/* 🖥️ Floating Button (desktop only) */}
      <motion.a
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed bottom-6 right-6 z-50"
      >
        <div className="bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl transition-all">
          <MessageCircle className="w-7 h-7" />
        </div>
      </motion.a>
    </>
  );
}
