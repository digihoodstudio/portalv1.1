import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
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

    // Check user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse JSON body
    const body = await request.json();
    const { leads, fileName } = body;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "No leads provided" }, { status: 400 });
    }

    // Prepare leads with user_id
    const leadsToInsert = leads.map((lead: any) => ({
      user_id: user.id,
      name: lead.name || lead.Name || lead.full_name || "",
      phone: lead.phone || lead.Phone || lead.phone_number || "",
      email: lead.email || lead.Email || "",
      company: lead.company || lead.Company || "",
      notes: lead.notes || lead.Notes || "",
      file_name: fileName || "upload.csv",
      status: "new",
      source: "csv_upload",
    }));

    // Insert into Supabase
    const { data, error } = await supabase
      .from("leads")
      .insert(leadsToInsert)
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      message: `Successfully imported ${data?.length || 0} leads`,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}
