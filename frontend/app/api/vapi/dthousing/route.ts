import { NextRequest, NextResponse } from "next/server";

const DT_HOUSING_ASSISTANT_ID = "6052bcc5-7de9-4932-8fad-dc0683ebb52d";

export async function POST(request: NextRequest) {
  const publicKey = process.env.NEXT_PUBLIC_VAPI_DTHOUSING_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: "Vapi public key is not configured." }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.vapi.ai/call/web", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicKey}`,
      },
      body: JSON.stringify({ assistantId: DT_HOUSING_ASSISTANT_ID }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[dthousing] Vapi create call failed:", data);
      return NextResponse.json(
        { error: data?.message || data?.error || "Failed to create Vapi call." },
        { status: res.status }
      );
    }

    return NextResponse.json({ webCallUrl: data.webCallUrl, callId: data.id });
  } catch (err: any) {
    console.error("[dthousing] Vapi create call error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create Vapi call." },
      { status: 500 }
    );
  }
}
