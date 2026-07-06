import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch("http://localhost:4000/api/voice/converse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Maya is unavailable" }, { status: 502 });
  }
}

export async function GET() {
  try {
    const res = await fetch("http://localhost:4000/api/voice/leads");
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ leads: [] });
  }
}
