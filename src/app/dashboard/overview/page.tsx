"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OverviewRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="p-12 text-center text-sm text-[var(--syn-muted)]">
      Redirecting to Dashboard...
    </div>
  );
}
