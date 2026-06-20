import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    // Vapi sends an "end-of-call-report" when the call finishes
    if (message.type === "end-of-call-report") {
      const call = message.call ?? {};
      const transcript = message.transcript ?? "";
      const summary = message.summary ?? "";
      const messages = message.artifact?.messages ?? message.messages ?? [];
      const recordingUrl =
        message.recordingUrl ?? message.artifact?.recordingUrl ?? null;
      const duration = Math.round(message.durationSeconds ?? 0);
      const endedReason = message.endedReason ?? "completed";

      // 1. Try to extract lead info (name, phone, email) from the transcript
      const analysis = message.analysis?.structuredData ?? {};
      const extractedName = analysis.name ?? extractName(transcript);
      const extractedPhone = analysis.phone ?? extractPhone(transcript);
      const extractedEmail = analysis.email ?? extractEmail(transcript);

      // 2. Save the VoiceTest record (one per call)
      const voiceTest = await prisma.voiceTest.create({
        data: {
          phone: extractedPhone || "web-call",
          scenario: summary || "Web voice call",
          voiceType: "Vapi AI",
        },
      });

      // 3. Save the full transcript message-by-message
      if (Array.isArray(messages) && messages.length > 0) {
        const transcriptRows = messages
          .filter((m: any) => m.role && m.message)
          .map((m: any) => ({
            callId: voiceTest.id,
            role: m.role,
            message: m.message,
          }));

        if (transcriptRows.length > 0) {
          await prisma.callTranscript.createMany({ data: transcriptRows });
        }
      } else if (transcript) {
        // Fallback: save the whole transcript as one record
        await prisma.callTranscript.create({
          data: {
            callId: voiceTest.id,
            role: "full",
            message: transcript,
          },
        });
      }

      // 4. If we got contact info, save as a Lead too
      if (extractedName || extractedEmail || extractedPhone) {
        // Find or create a default client to attach the lead to
        let defaultClient = await prisma.client.findFirst({
          where: { companyName: "Web Leads" },
        });
        if (!defaultClient) {
          defaultClient = await prisma.client.create({
            data: { companyName: "Web Leads", plan: "GROWTH" },
          });
        }

        let defaultProject = await prisma.project.findFirst({
          where: { clientId: defaultClient.id, name: "Voice AI Leads" },
        });
        if (!defaultProject) {
          defaultProject = await prisma.project.create({
            data: {
              name: "Voice AI Leads",
              clientId: defaultClient.id,
              status: "ACTIVE",
            },
          });
        }

        await prisma.lead.create({
          data: {
            name: extractedName || "Unknown Caller",
            phone: extractedPhone || null,
            email: extractedEmail || null,
            notes: `From Vapi voice call. Duration: ${duration}s. Summary: ${summary}`,
            status: "NEW",
            clientId: defaultClient.id,
            projectId: defaultProject.id,
          },
        });
      }

      console.log("✅ Vapi call saved:", {
        id: voiceTest.id,
        duration,
        endedReason,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Vapi webhook error:", err);
    return NextResponse.json({ error: "webhook failed" }, { status: 500 });
  }
}

// ── Helpers: extract details from transcript text ──────────────
function extractEmail(text: string): string | null {
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return match ? match[0].toLowerCase().replace(/\s/g, "") : null;
}

function extractPhone(text: string): string | null {
  // Match 7+ digit sequences, allowing spaces/dashes
  const cleaned = text.replace(/[-.\s]/g, "");
  const match = cleaned.match(/\+?\d{7,15}/);
  return match ? match[0] : null;
}

function extractName(text: string): string | null {
  // Looks for "my name is X" or "I'm X" or "this is X"
  const patterns = [
    /my name is ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
    /i['']?m ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
    /this is ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return null;
}
