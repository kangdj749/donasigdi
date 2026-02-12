{/*import { PaymentEventRow } from "@/lib/google-sheet";

export function getLatestPaymentEvent(
  rows: PaymentEventRow[],
  orderId: string
): PaymentEventRow | null {
  const filtered = rows.filter(r => r[0] === orderId);
  if (filtered.length === 0) return null;

  return filtered.sort(
    (a, b) =>
      new Date(b[5]).getTime() - new Date(a[5]).getTime()
  )[0];
}
*/}