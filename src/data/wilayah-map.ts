export type WilayahMap = {
  binderbyte_id: string;   // contoh: "18.02"
  rajaongkir_city_id: string; // contoh: "3273"
  label: string;
};

export const WILAYAH_MAP: WilayahMap[] = [
  {
    binderbyte_id: "32.73",
    rajaongkir_city_id: "3273",
    label: "Kota Bandung",
  },
  {
    binderbyte_id: "18.02",
    rajaongkir_city_id: "1802",
    label: "Lampung Selatan",
  },
  {
    binderbyte_id: "63.10",
    rajaongkir_city_id: "6310",
    label: "Kab. Banjar",
  },
  // 👉 nanti tinggal tambah, bisa auto-sync dari CSV / DB
];
