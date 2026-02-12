"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import type { AdminCreateProductPayload } from "@/types/product";

/* =====================
   HELPERS
===================== */

const generateVariantId = () => crypto.randomUUID();

/* =====================
   COMPONENT
===================== */

export default function AdminDashboardClient() {
  /* =====================
     STATE
  ===================== */

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);

  const [variants, setVariants] = useState<
    AdminCreateProductPayload["variants"]
  >([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
    price: "",
    discountPrice: "",
    weight: "", // product default weight (fallback)
    shopee: "",
    tokopedia: "",
    tiktok: "",
  });

  /* =====================
     IMAGE UPLOAD
  ===================== */

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/image", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    return data.url as string;
  };

  /* =====================
     VARIANT HANDLERS
  ===================== */

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        variantId: generateVariantId(),
        variation1Name: "Warna",
        variation1Value: "",
        variation2Name: "Size",
        variation2Value: "",
        price: 0,
        discountPrice: null,
        stock: 0,
        varWeight: undefined,
        image: "",
      },
    ]);
  };

  const updateVariant = <
    K extends keyof AdminCreateProductPayload["variants"][number]
  >(
    index: number,
    field: K,
    value: AdminCreateProductPayload["variants"][number][K]
  ) => {
    const copy = [...variants];
    copy[index][field] = value;
    setVariants(copy);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const validateBeforeSubmit = () => {
  if (!form.name.trim()) {
    alert("❌ Nama produk wajib diisi");
    return false;
  }

  if (!image) {
    alert("❌ Thumbnail produk wajib diupload");
    return false;
  }

  const productWeight = form.weight ? Number(form.weight) : undefined;

  if (productWeight !== undefined && productWeight <= 0) {
    alert("❌ Berat default produk harus lebih dari 0");
    return false;
  }

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const label = `Varian #${i + 1}`;

    if (!v.variation1Value?.trim()) {
      alert(`❌ ${label}: Warna wajib diisi`);
      return false;
    }

    if (!v.price || v.price <= 0) {
      alert(`❌ ${label}: Harga harus lebih dari 0`);
      return false;
    }

    if (v.stock < 0) {
      alert(`❌ ${label}: Stok tidak boleh negatif`);
      return false;
    }

    if (
      v.discountPrice !== null &&
      v.discountPrice !== undefined &&
      v.discountPrice >= v.price
    ) {
      alert(`❌ ${label}: Harga diskon harus lebih kecil dari harga`);
      return false;
    }

    if (v.varWeight !== undefined && v.varWeight <= 0) {
      alert(`❌ ${label}: Berat varian harus lebih dari 0`);
      return false;
    }

    if (!v.varWeight && !productWeight) {
      alert(
        `❌ ${label}: Berat wajib diisi (isi berat varian atau berat default produk)`
      );
      return false;
    }
  }

  return true;
};

  /* =====================
     SUBMIT
  ===================== */

  const handleSubmit = async () => {
  if (!validateBeforeSubmit()) return;

  setLoading(true);

    const payload: AdminCreateProductPayload = {
      product: {
        name: form.name,
        description: form.description,
        image,
        gallery,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        price: form.price ? Number(form.price) : undefined,
        discountPrice: form.discountPrice
          ? Number(form.discountPrice)
          : null,
        weight: form.weight ? Number(form.weight) : undefined,
        marketplace: {
          shopee: form.shopee,
          tokopedia: form.tokopedia,
          tiktok: form.tiktok,
        },
      },
      variants,
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("❌ Gagal menyimpan produk");
    } else {
      alert("✅ Produk berhasil disimpan");

      setForm({
        name: "",
        description: "",
        category: "",
        tags: "",
        price: "",
        discountPrice: "",
        weight: "",
        shopee: "",
        tokopedia: "",
        tiktok: "",
      });
      setImage("");
      setGallery([]);
      setVariants([]);
    }

    setLoading(false);
  };

  /* =====================
     UI
  ===================== */

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-32">
      <h1 className="text-xl font-semibold">Tambah Produk</h1>

      {/* INFO UTAMA */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <Label>Nama Produk</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Label>Deskripsi</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <Label>Kategori</Label>
          <Input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <Label>Tags (pisahkan dengan koma)</Label>
          <Input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* HARGA DEFAULT */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <Label>Harga Default (fallback)</Label>
          <Input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <Label>Harga Diskon Default</Label>
          <Input
            type="number"
            value={form.discountPrice}
            onChange={(e) =>
              setForm({ ...form, discountPrice: e.target.value })
            }
          />

          <Label>Berat Default Produk (gram)</Label>
          <Input
            type="number"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* IMAGE */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <Label>Thumbnail</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              if (e.target.files?.[0]) {
                setImage(await uploadImage(e.target.files[0]));
              }
            }}
          />

          <Label>Gallery</Label>
          <Input
            type="file"
            multiple
            onChange={async (e) => {
              if (!e.target.files) return;
              const urls: string[] = [];
              for (const f of Array.from(e.target.files)) {
                urls.push(await uploadImage(f));
              }
              setGallery((prev) => [...prev, ...urls]);
            }}
          />
        </CardContent>
      </Card>

      {/* VARIANTS */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Variasi Produk</h2>
            <Button size="sm" onClick={addVariant}>
              + Tambah
            </Button>
          </div>

          {variants.map((v, i) => (
          <div
            key={v.variantId}
            className="border rounded-lg p-4 space-y-4 bg-muted/30"
          >
            <h3 className="font-semibold text-sm">
              Varian #{i + 1}
            </h3>

            {/* ATRIBUT */}
            <div className="space-y-2">
              <Label>Warna</Label>
              <Input
                placeholder="Contoh: Hitam, Navy, Cream"
                value={v.variation1Value}
                onChange={(e) =>
                  updateVariant(i, "variation1Value", e.target.value)
                }
              />

              <Label>Size</Label>
              <Input
                placeholder="Contoh: S, M, L, XL"
                value={v.variation2Value}
                onChange={(e) =>
                  updateVariant(i, "variation2Value", e.target.value)
                }
              />
            </div>

            {/* HARGA */}
            <div className="space-y-2">
              <Label>Harga Varian (Rp)</Label>
              <Input
                type="number"
                placeholder="Contoh: 175000"
                value={v.price}
                onChange={(e) =>
                  updateVariant(i, "price", Number(e.target.value))
                }
              />

              <Label>Harga Diskon Varian (opsional)</Label>
              <Input
                type="number"
                placeholder="Kosongkan jika tidak ada"
                value={v.discountPrice ?? ""}
                onChange={(e) =>
                  updateVariant(
                    i,
                    "discountPrice",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              />
            </div>

            {/* STOK & BERAT */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Stok</Label>
                <Input
                  type="number"
                  placeholder="Jumlah stok tersedia"
                  value={v.stock}
                  onChange={(e) =>
                    updateVariant(i, "stock", Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Berat Varian (gram)</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 350"
                  value={v.varWeight ?? ""}
                  onChange={(e) =>
                    updateVariant(
                      i,
                      "varWeight",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>

            {/* IMAGE */}
            <div className="space-y-2">
              <Label>Gambar Varian</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    updateVariant(
                      i,
                      "image",
                      await uploadImage(e.target.files[0])
                    );
                  }
                }}
              />
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeVariant(i)}
            >
              Hapus Varian
            </Button>
          </div>
        ))}

        </CardContent>
      </Card>

      <Separator />

      <Button
        className="w-full fixed bottom-4 left-0 right-0 max-w-xl mx-auto"
        disabled={loading || variants.length === 0}
        onClick={handleSubmit}
      >
        {loading ? "Menyimpan..." : "Simpan Produk"}
      </Button>
    </div>
  );
}
