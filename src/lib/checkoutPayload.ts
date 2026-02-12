import type { CheckoutData } from "@/lib/format-wa";
import { getAffiliate } from "@/lib/affiliate";

export type CheckoutPayload = CheckoutData & {
  affiliate: string | null;
};

export function buildCheckoutPayload(data: CheckoutData): CheckoutPayload {
  const affiliate = getAffiliate();

  return {
    ...data,
    affiliate: affiliate?.code ?? null,
  };
}
