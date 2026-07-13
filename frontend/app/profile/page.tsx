"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20 text-white/50">
      <p className="animate-pulse text-sm">Redirecting...</p>
    </div>
  );
}
