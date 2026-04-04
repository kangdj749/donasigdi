import { addClient, removeClient } from "@/lib/realtime.service";

/* ================= IMPORTANT FIX ================= */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* ================= ROUTE ================= */

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const client = {
        send: (data: unknown) => {
          try {
            const payload = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch (err) {
            console.error("SSE send error:", err);
          }
        },
      };

      addClient(client);

      /* 🔥 CLEANUP ON CLOSE */
      const close = () => {
        removeClient(client);
        try {
          controller.close();
        } catch {}
      };

      // @ts-ignore (edge compatibility)
      controller.signal?.addEventListener?.("abort", close);

      return close;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // 🔥 penting untuk proxy (nginx/vercel)
    },
  });
}