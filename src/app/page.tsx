// app/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}


