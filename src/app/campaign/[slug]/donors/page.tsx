import Link from "next/link";
import { notFound } from "next/navigation";

import { getCampaignBySlug } from "@/lib/campaign.service";
import { getRecentDonors } from "@/lib/campaign.extras.service";

export const revalidate = 60;

/* =========================
   SEO META
========================= */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) return {};

  const title = `Donatur ${campaign.title} | Transparansi Donasi`;
  const description = `Daftar donatur untuk ${campaign.title}. Transparansi dan dukungan nyata dari orang-orang baik 🙏`;

  return {
    title,
    description,
    alternates: {
      canonical: `/campaign/${campaign.slug}/donors`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/campaign/${campaign.slug}/donors`,
    },
  };
}

/* =========================
   HELPERS
========================= */

function formatCurrency(value?: number): string {
  return (value ?? 0).toLocaleString("id-ID");
}

function formatDate(date?: string): string {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
  });
}

/* =========================
   PAGE
========================= */

export default async function CampaignDonorsPage({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = await getCampaignBySlug(params.slug);
  if (!campaign) return notFound();

  const donors = await getRecentDonors(String(campaign.id));

  return (
    <main className="min-h-screen bg-[rgb(var(--color-surface))] flex justify-center">

      <div className="w-full container-main pb-32 space-y-6">

        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-40 backdrop-blur bg-[rgb(var(--color-bg))]/90 border-b border-[rgb(var(--color-border))]">

          <div className="flex items-center gap-3 py-3">

            <Link
              href={`/campaign/${campaign.slug}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-soft))] transition"
            >
              <span>←</span>
              <span className="caption font-medium">
                Kembali
              </span>
            </Link>

            <div className="h-4 w-px bg-[rgb(var(--color-border))]" />

            <p className="caption truncate">
              {campaign.title}
            </p>

          </div>
        </header>

        {/* ================= TITLE ================= */}
        <section className="space-y-2 pt-2">

          <h1 className="h2">
            Donatur Baik 💚
          </h1>

          <p className="caption max-w-md">
            Transparansi donasi dari orang-orang baik yang telah membantu campaign ini.
          </p>

        </section>

        {/* ================= EMPTY ================= */}
        {donors.length === 0 && (
          <div className="card text-center py-10 space-y-2">
            <p className="body">Belum ada donasi</p>
            <p className="caption">
              Jadilah yang pertama membantu 🙏
            </p>
          </div>
        )}

        {/* ================= LIST ================= */}
        {donors.length > 0 && (
          <section className="space-y-3">

            {donors.map((d) => {
              const name =
                d.is_anonymous || !d.name
                  ? "Hamba Allah"
                  : d.name;

              return (
                <div
                  key={d.id}
                  className="card flex items-start justify-between gap-4 animate-fadeUp"
                >
                  {/* LEFT */}
                  <div className="space-y-1">

                    <p className="body font-medium">
                      {name}
                    </p>

                    {d.message && (
                      <p className="caption italic leading-relaxed">
                        “{d.message}”
                      </p>
                    )}

                    <p className="caption-subtle">
                      {formatDate(d.created_at)}
                    </p>

                  </div>

                  {/* RIGHT */}
                  <div className="text-right space-y-1">

                    <p className="body font-semibold text-primary">
                      Rp {formatCurrency(d.amount)}
                    </p>

                    <span className="caption-subtle">
                      ✔ Donasi berhasil
                    </span>

                  </div>
                </div>
              );
            })}

          </section>
        )}

        {/* ================= CTA ================= */}
        <div className="fixed bottom-0 left-0 right-0 backdrop-blur bg-[rgb(var(--color-bg))]/90 border-t border-[rgb(var(--color-border))]">

          <div className="container-main p-3">
            <Link href={`/campaign/${campaign.slug}`}>
              <button className="btn-primary w-full">
                Ikut Donasi Sekarang
              </button>
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}