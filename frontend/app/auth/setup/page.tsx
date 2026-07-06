"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthSetupPage() {
  const router = useRouter();

  useEffect(() => {
    async function syncSession() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        localStorage.setItem("supabase_session", "true");
        localStorage.setItem("user", JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
          role: session.user.user_metadata?.role || "USER",
        }));
      }

      router.replace("/dashboard");
    }

    syncSession();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-foreground/50 animate-pulse">Setting up your session...</p>
    </main>
  );
}
