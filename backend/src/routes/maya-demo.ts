import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

const mayaResponses: Record<string, string[]> = {
  greeting: [
    "Hi there! This is Maya from Digihood Studio. I'm your AI voice assistant. How are you doing today?",
  ],
  ask_name: [
    "That's wonderful to hear! Could I start by getting your name so I can look after you properly?",
  ],
  ask_business: [
    "Great to meet you, {{name}}! What business or company are you representing? I'd love to learn more about what you do.",
  ],
  ask_interest: [
    "Interesting, {{name}}! And what brought you to call Digihood Studio today? Are you looking into our AI voice receptionist services, or something else?",
  ],
  ask_phone: [
    "Perfect, I'd love to have one of our growth specialists reach out to you. What's the best phone number to contact you at?",
  ],
  confirm: [
    "Fantastic! Let me confirm what I've noted down:\n\nName: {{name}}\nCompany: {{company}}\nInterest: {{interest}}\nPhone: {{phone}}\n\nDoes everything look correct?",
  ],
  closing: [
    "Wonderful! I've saved all your details, {{name}}. One of our team members will give you a call shortly at {{phone}}. Is there anything else I can help you with?",
  ],
  goodbye: [
    "It was a pleasure talking with you, {{name}}! Have a great day, and we'll be in touch soon. Goodbye!",
  ],
  fallback: [
    "I appreciate you sharing that! Let me make sure I've got everything recorded correctly.",
    "Thank you for telling me more! I'm noting all of this down.",
    "Got it! I'm updating your information right now.",
  ],
};

const mayaStages = [
  "greeting",
  "ask_name",
  "ask_business",
  "ask_interest",
  "ask_phone",
  "confirm",
  "closing",
  "goodbye",
];

const demoLeads: any[] = [];

router.post("/converse", async (req, res) => {
  try {
    const { sessionId, stage, userMessage, collected } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId required" });
    }

    if (stage === "capture" && userMessage) {
      try {
        const info = JSON.parse(typeof userMessage === "string" ? userMessage : "{}");
        const lead = {
          id: `maya-lead-${Date.now()}`,
          name: info.name || "Unknown",
          company: info.company || "Not specified",
          phone: info.phone || "Not provided",
          interest: info.interest || "General inquiry",
          capturedAt: new Date().toISOString(),
          status: "NEW",
          source: "Maya AI Demo",
        };
        const exists = demoLeads.find((l) => l.name === lead.name || (lead.phone && l.phone === lead.phone));
        if (!exists) {
          demoLeads.push(lead);
          try {
            await prisma.lead.create({
              data: {
                name: lead.name,
                company: lead.company,
                phone: lead.phone,
                email: info.email || "",
                notes: `Interest: ${lead.interest}. Captured via Maya AI Demo conversation.`,
                status: "NEW",
                projectId: "proj-2",
              },
            });
          } catch {}
        }
      } catch {}
      return res.json({ success: true });
    }

    const currentStage = stage || "greeting";
    const stageIndex = mayaStages.indexOf(currentStage);
    const nextStage = stageIndex < mayaStages.length - 1 ? mayaStages[stageIndex + 1] : "goodbye";

    let responseText = "";
    let extractedInfo = collected || {};

    if (currentStage === "greeting") {
      responseText = mayaResponses.greeting[0];
    } else if (currentStage === "ask_name") {
      extractedInfo.name = userMessage || "Caller";
      responseText = mayaResponses.ask_name[0].replace("{{name}}", extractedInfo.name);
    } else if (currentStage === "ask_business") {
      extractedInfo.company = userMessage || "Not specified";
      responseText = mayaResponses.ask_business[0].replace("{{name}}", extractedInfo.name);
    } else if (currentStage === "ask_interest") {
      extractedInfo.interest = userMessage || "General inquiry";
      responseText = mayaResponses.ask_interest[0]
        .replace("{{name}}", extractedInfo.name)
        .replace("{{company}}", extractedInfo.company);
    } else if (currentStage === "ask_phone") {
      extractedInfo.phone = userMessage || "Not provided";
      responseText = mayaResponses.ask_phone[0].replace("{{name}}", extractedInfo.name);
    } else if (currentStage === "confirm") {
      responseText = mayaResponses.confirm[0]
        .replace("{{name}}", extractedInfo.name || "")
        .replace("{{company}}", extractedInfo.company || "")
        .replace("{{interest}}", extractedInfo.interest || "")
        .replace("{{phone}}", extractedInfo.phone || "");
    } else if (currentStage === "closing") {
      responseText = mayaResponses.closing[0]
        .replace("{{name}}", extractedInfo.name || "")
        .replace("{{phone}}", extractedInfo.phone || "");
    } else {
      responseText = mayaResponses.goodbye[0].replace("{{name}}", extractedInfo.name || "there");
    }

    if (currentStage === "goodbye" || (currentStage === "confirm" && userMessage?.toLowerCase().includes("yes"))) {
      if (extractedInfo.name && extractedInfo.name !== "Caller") {
        const existing = demoLeads.find(
          (l) => l.name === extractedInfo.name && l.phone === extractedInfo.phone
        );
        if (!existing) {
          const lead = {
            id: `maya-lead-${Date.now()}`,
            name: extractedInfo.name || "Unknown",
            company: extractedInfo.company || "Not specified",
            phone: extractedInfo.phone || "Not provided",
            interest: extractedInfo.interest || "General inquiry",
            capturedAt: new Date().toISOString(),
            status: "NEW",
            source: "Maya AI Demo",
          };
          demoLeads.push(lead);

          try {
            await prisma.lead.create({
              data: {
                name: lead.name,
                company: lead.company,
                phone: lead.phone,
                email: "",
                notes: `Interest: ${lead.interest}. Captured via Maya AI Demo.`,
                status: "NEW",
                projectId: "proj-2",
              },
            });
          } catch {
          }
        }
      }
    }

    return res.json({
      response: responseText,
      nextStage,
      collected: extractedInfo,
      isComplete: currentStage === "goodbye",
    });
  } catch (error) {
    console.error("Maya demo error:", error);
    return res.status(500).json({ error: "Maya is having trouble right now" });
  }
});

router.get("/leads", (_req, res) => {
  return res.json({ leads: [...demoLeads].reverse() });
});

export default router;
