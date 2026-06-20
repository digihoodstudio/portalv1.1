import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Look up role from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .single();

      const role = profile?.role || "client";

      if (role === "superadmin") {
        return NextResponse.redirect(`${origin}/superadmin`);
      } else if (role === "admin") {
        return NextResponse.redirect(`${origin}/admin`);
      } else {
        return NextResponse.redirect(`${origin}/dashboard`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
