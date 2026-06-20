import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, duration_seconds } = body;

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ skipped: true });
    }

    // Extract data from transcript using simple regex
    const fullText = transcript.map((t: any) => t.text).join(" ");

    const nameMatch = fullText.match(
      /(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    );
    const emailMatch = fullText.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = fullText.match(/[\+]?[\d][\d\s\-()]{7,}/);

    // Detect language
    const isNepali =
      /[\u0900-\u097F]/.test(fullText) ||
      /\b(namaste|dhanyabad|tapai|hami|kasari)\b/i.test(fullText);

    await supabase.from("voice_demo_leads").insert({
      name: nameMatch?.[1] || null,
      email: emailMatch?.[0] || null,
      phone: phoneMatch?.[0]?.replace(/\s/g, "") || null,
      transcript: transcript,
      duration_seconds: duration_seconds || 0,
      language: isNepali ? "ne" : "en",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save lead error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
