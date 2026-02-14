"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Gift,
  Moon,
  HeartHandshake,
  Truck,
  GraduationCap,
  HandCoins,
} from "lucide-react";

interface CardItem {
  title: string;
  description: string;
}

interface Props {
  content: string;
}

function parseContent(content: string): CardItem[] {
  return content.split("|").map((item) => {
    const [title, description] = item.split(":");
    return {
      title: title?.trim() || "",
      description: description?.trim() || "",
    };
  });
}

// ================= ICON & BADGE MAPPING =================

function getMeta(title: string) {
  const lower = title.toLowerCase();

  if (lower.includes("zakat"))
    return { icon: HandCoins, badge: "Filantropi" };

  if (lower.includes("kajian"))
    return { icon: GraduationCap, badge: "Edukasi" };

  if (lower.includes("takjil"))
    return { icon: Gift, badge: "Sosial" };

  if (lower.includes("thr"))
    return { icon: Gift, badge: "Santunan" };

  if (lower.includes("pesantren"))
    return { icon: BookOpen, badge: "Pembinaan" };

  if (lower.includes("festival"))
    return { icon: Moon, badge: "Event Umat" };

  if (lower.includes("mudik"))
    return { icon: Truck, badge: "Layanan" };

  return { icon: HeartHandshake, badge: "Program" };
}

export default function CardGridSection({ content }: Props) {
  const items = parseContent(content);

  return (
    <section className="px-4 py-10 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {items.map((item, index) => {
          const { icon: Icon, badge } = getMeta(item.title);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-50 rounded-xl">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                  {badge}
                </span>
              </div>

              <h3 className="font-semibold text-base mb-2">
                {item.title}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
