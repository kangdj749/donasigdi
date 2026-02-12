export {};

type MidtransResult = {
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status:
    | "capture"
    | "settlement"
    | "pending"
    | "deny"
    | "expire"
    | "cancel";
  fraud_status?: string;
};

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: MidtransResult) => void;
          onPending?: (result: MidtransResult) => void;
          onError?: (result: MidtransResult) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

declare module "midtrans-client" {
  interface MidtransClientOptions {
    clientKey?: string;
  }
}