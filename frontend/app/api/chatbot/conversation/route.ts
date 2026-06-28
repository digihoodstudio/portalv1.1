import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { prisma } from "@/lib/db";
import { getConfigs } from "@/lib/config-store";

function matchTopic(last: string, keywords: string[]): boolean {
  const words = last.split(/\s+/);
  return keywords.some((kw) => {
    if (kw.includes(" ")) return last.includes(kw);
    return words.some((w) => w === kw || w.startsWith(kw) || kw.startsWith(w));
  });
}

const TOPICS: [string[], string][] = [
  [
    ["price", "cost", "pricing", "tier", "package", "plan", "much", "fee", "subscription", "charge", "bill", "monthly", "annual", "upgrade", "downgrade"],
    `We offer three packages tailored to your needs:\n\n• **Starter** — 24/7 AI receptionist, custom scripts, weekly reports, email support.\n• **Growth** (Most Popular) — Everything in Starter, plus missed call recovery, SMS follow-ups, CRM integration, bi-weekly strategy calls.\n• **Dominance** — Everything in Growth, plus dead lead reactivation, unlimited contacts, brand-trained voice, dedicated success manager.\n\nAll plans are month-to-month with no long-term contracts. Most clients see full ROI within 30 days. Which sounds right for you?`,
  ],
  [
    ["guarantee", "roi", "result", "worth", "refund", "risk", "satisfaction"],
    `Every client gets our **Revenue Growth Guarantee**:\n\n1. **48-Hour Live Setup** — Your AI agent takes calls within 2 days.\n2. **10-Second Call Recovery** — Missed callers get an instant text-back.\n3. **Full Analytics Dashboard** — Track every dollar recovered in real time.\n\nWe regularly help service businesses recover **$2,000–$8,000+** per month in lost revenue. Want a custom ROI estimate?`,
  ],
  [
    ["book", "schedule", "demo", "consult", "appointment", "meeting", "strategy call", "discovery"],
    `I'd love to set up a free consultation:\n\n• **Format**: 30-minute Zoom call\n• **Outcome**: A custom AI automation blueprint for your business\n• **Availability**: Flexible scheduling, including evenings\n\nClick the **Book Demo** button at the top of the page to grab a slot. What industry are you in so we prepare relevant cases?`,
  ],
  [
    ["missed call", "miss", "call recovery", "callback", "missed", "no answer", "didn't answer", "missed opportunity"],
    `Our **Missed Call Recovery** system works automatically:\n\n• **Instant Text-Back** within 10 seconds of a missed call.\n• **AI Lead Qualification** — Asks the right questions to qualify in real time.\n• **Auto-Booking** — Syncs with your calendar to schedule appointments.\n\nOn average, businesses recover **15–30%** of otherwise lost leads. Are you losing business from missed calls right now?`,
  ],
  [
    ["reactivat", "dead lead", "old lead", "cold", "dormant", "inactive", "re-engage", "revive", "past client"],
    `Our **Dead Lead Reactivation** campaigns bring cold contacts back to life:\n\n• **AI-Written Sequences** — SMS and email that sound completely human.\n• **Turnkey Management** — We handle copy, scheduling, scoring, and CRM sync.\n• **Proven Results** — Typical campaigns recover **$5,000–$20,000+** in dormant pipeline.\n\nHow many inactive contacts do you currently have?`,
  ],
  [
    ["receptionist", "inbound", "answer", "phone", "ring", "after hours", "24/7", "virtual assistant", "front desk"],
    `Our **24/7 AI Receptionist** handles every inbound call:\n\n• **Always On** — Nights, weekends, holidays included.\n• **Custom Trained** — Knows your services, pricing, and FAQ inside out.\n• **Calendar Booking** — Books directly into ServiceTitan, Housecall Pro, and more.\n• **Smart Routing** — Transfers urgent calls to your team instantly.\n\nWould you like to hear a live demo?`,
  ],
  [
    ["setup", "implement", "launch", "go live", "onboard", "integration", "install", "deploy"],
    `Getting started is quick:\n\n1. **48-Hour Setup** — Your AI receptionist is live within 2 days.\n2. **Custom Training** — We train the AI on your scripts, services, and FAQs.\n3. **CRM Integration** — Connects with ServiceTitan, Housecall Pro, GoHighLevel, and more.\n4. **Go-Live Call** — We walk through the first few calls together.\n\nWant to start the onboarding process? Just book a demo above!`,
  ],
  [
    ["industry", "service business", "contractor", "hvac", "plumbing", "electrical", "roofing", "cleaning", "landscaping", "home service", "field service"],
    `We work with a wide range of service businesses:\n\n• **Home Services** — HVAC, plumbing, electrical, roofing, pest control, cleaning\n• **Field Services** — Landscaping, pool maintenance, repair services\n• **Professional Services** — Dental, medical, legal, consulting\n\nOur AI adapts to your specific industry language and workflows. What industry are you in?`,
  ],
  [
    ["compare", "difference", "vs", "versus", "which", "recommend", "best", "between"],
    `Here's a quick comparison:\n\n• **Starter** — Best for small businesses wanting 24/7 call coverage.\n• **Growth** — Our most popular — adds missed call recovery + CRM sync.\n• **Dominance** — Full suite with lead reactivation and dedicated manager.\n\nMost growing businesses start with **Growth** and scale up. Want a personalised recommendation? Tell me about your call volume!`,
  ],
  [
    ["contract", "commitment", "month-to-month", "term", "cancel", "cancellation", "lock", "billing cycle"],
    `No long-term contracts required. All plans are **month-to-month** and you can cancel anytime. We're confident you'll see results fast — that's why we don't lock you in. Want to start with a single month and see the difference?`,
  ],
  [
    ["support", "help", "customer service", "contact", "reach", "phone number", "email", "live person", "human"],
    `We're always here for you:\n\n• **Email**: support@digihoodstudio.com\n• **In-App Chat**: Right here — I'm available 24/7!\n• **Strategy Calls**: Bi-weekly with Growth plan, weekly with Dominance\n• **Emergency Support**: Available for urgent issues\n\nWhat do you need help with?`,
  ],
  [
    ["train", "training", "customize", "custom", "configure", "personalize", "tailor", "script", "workflow"],
    `Every AI agent is fully customisable:\n\n• **Custom Scripts** — We write your AI's conversation flow.\n• **Brand Voice** — Tone, vocabulary, and style matched to your brand.\n• **FAQ Training** — Train on your specific services, pricing, and policies.\n• **Calendar & CRM** — Connected to your existing tools.\n\nSetup takes just 48 hours from sign-up. Ready to get started?`,
  ],
  [
    ["lead", "generation", "convert", "conversion", "qualified", "prospect", "customer acquisition"],
    `We turn every call into a revenue opportunity:\n\n• **AI Qualification** — Asks the right questions before booking.\n• **Missed Call Recovery** — Captures leads who would've been lost.\n• **Lead Reactivation** — Re-engages cold contacts automatically.\n• **CRM Sync** — Every lead logged and scored in real time.\n\nOur clients typically see **30–50% more qualified leads** within the first month.`,
  ],
  [
    ["analytics", "report", "dashboard", "track", "metric", "kpi", "performance", "insight", "data"],
    `You get full visibility into your ROI:\n\n• **Real-Time Dashboard** — Calls, conversions, revenue recovered.\n• **Weekly Reports** — Sent straight to your inbox.\n• **Call Recordings & Transcripts** — Review every conversation.\n• **Revenue Tracking** — See exactly how much each feature recovers.\n\nYour dashboard is live from day one.`,
  ],
  [
    ["hello", "hi", "hey", "start", "begin", "help", "question", "info", "information"],
    `Hello! I'm your AI growth specialist from Digihood Studio. I can help with:\n\n• **Pricing & Plans** — Find the right package for your business.\n• **AI Receptionist** — Never miss another lead.\n• **Missed Call Recovery** — Capture every opportunity.\n• **Lead Reactivation** — Re-engage cold contacts.\n\nWhat would you like to explore today?`,
  ],
];

function simulateAnswer(last: string, configs: any): string {
  if (!last) {
    return `Hello! I'm your AI growth specialist from Digihood Studio. I can help with pricing, our AI receptionist, missed call recovery, and more. What brings you here today?`;
  }

  const matchedKB = (configs.kbEntries || []).find(
    (entry: any) =>
      last.includes(entry.q.toLowerCase()) ||
      entry.q.toLowerCase().includes(last),
  );
  if (matchedKB) return matchedKB.a;

  for (const [keywords, response] of TOPICS) {
    if (matchTopic(last, keywords)) return response;
  }

  const extraTopics: [string[], string][] = [
    [
      ["register", "sign up", "create account", "login", "password", "forgot"],
      `To get started: Visit our homepage and click **Get Started** at the top right. You'll create an account in under a minute, then you can book a demo or explore our platform. Already have an account? Click **Login** to access your dashboard.`,
    ],
    [
      ["ai", "artificial intelligence", "technology", "how it work", "how does it"],
      `Digihood Studio uses advanced AI to handle your business calls and communications:\n\n• **Natural Language Understanding** — Your AI agent understands context, intent, and nuance.\n• **Voice AI** — Real-time speech recognition and synthesis for phone calls.\n• **Smart Workflows** — Automatically qualifies leads, books appointments, and syncs CRM.\n• **Continuous Learning** — The AI improves with every conversation.\n\nIt's like hiring a full-time receptionist, salesperson, and marketer — but at a fraction of the cost.`,
    ],
    [
      ["what", "who", "when", "where", "why", "how", "tell", "explain", "about"],
      `Great question! Digihood Studio is an **AI automation platform** for service businesses. We provide:\n\n1. **24/7 AI Receptionist** — Answers calls, qualifies leads, books appointments.\n2. **Missed Call Recovery** — Instant text-back within 10 seconds.\n3. **Dead Lead Reactivation** — AI campaigns that re-engage cold contacts.\n\nOur clients typically see **$2,000–$8,000+** in recovered revenue per month. Want to dive deeper into any of these?`,
    ],
    [
      ["security", "secure", "data", "privacy", "gdpr", "confidential", "safe", "encrypt"],
      `Security is a top priority:\n\n• **Encrypted** — All data encrypted at rest and in transit.\n• **Secure Storage** — Call recordings and transcripts stored securely.\n• **Data Privacy** — We never share or sell your data.\n• **Compliance** — GDPR-compliant infrastructure.\n\nYour business data is yours — always.`,
    ],
    [
      ["competitor", "alternative", "other", "different", "unique", "better than"],
      `What sets Digihood Studio apart:\n\n• **48-Hour Setup** — Most competitors take weeks.\n• **True 24/7 Coverage** — Not just answering, but qualifying and booking.\n• **Missed Call Recovery** — Automated text-back in under 10 seconds.\n• **Revenue-Focused** — Every feature tied to measurable ROI.\n• **No Long Contracts** — Month-to-month, cancel anytime.\n\nPlus, our AI is trained specifically for service businesses — not a generic chatbot.`,
    ],
    [
      ["refer", "referral", "partner", "affiliate", "reseller", "white label"],
      `We offer partnership programs:\n\n• **Referral Partner** — Earn commissions for every client you bring in.\n• **Agency Partner** — Resell Digihood under your brand.\n• **Strategic Partner** — Integration and co-marketing opportunities.\n\nInterested? Let's set up a quick call to discuss partnership options!`,
    ],
  ];

  for (const [keywords, response] of extraTopics) {
    if (matchTopic(last, keywords)) return response;
  }

  return `Thanks for reaching out! I'd love to help with that. Digihood Studio specialises in AI receptionists, missed call recovery, and lead reactivation for service businesses. Could you tell me a bit more about what you're looking for? I can also book you a free 30-minute strategy call with our team.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, messages } = body;

    const configs = getConfigs();
    const activeOpenaiKey = configs.openaiApiKey;

    const isRealKey =
      activeOpenaiKey &&
      activeOpenaiKey !== "your-openai-api-key" &&
      activeOpenaiKey !== "sk-your-openai-api-key-here" &&
      activeOpenaiKey !== "your-openai-key-here" &&
      activeOpenaiKey !== "mock-key" &&
      activeOpenaiKey.trim().length > 0;

    let answer = "";

    if (isRealKey) {
      try {
        const client = new OpenAI({ apiKey: activeOpenaiKey });
        const formattedMessages = (messages ?? []).map((m: any) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text || m.content || "",
        }));
        const response = await client.chat.completions.create({
          model: configs.openaiModel || "gpt-4o-mini",
          messages: [
            { role: "system", content: configs.systemPrompt },
            ...formattedMessages,
          ],
          temperature: configs.openaiTemperature ?? 0.3,
          max_tokens: 500,
        });
        answer = response.choices?.[0]?.message?.content ?? "";
      } catch (error) {
        console.error(
          "[OpenAI Error] API call failed, falling back to simulation:",
          error,
        );
      }
    }

    if (!answer) {
      const last =
        [...(messages ?? [])]
          .reverse()
          .find((m) => m.role === "user")
          ?.text?.toLowerCase() ?? "";
      answer = simulateAnswer(last, configs);
    }

    if (!answer) {
      answer = `Thanks for your question! I'm your AI growth specialist at Digihood Studio. We help service businesses with AI receptionists, missed call recovery, and lead reactivation. Could you tell me a bit more about what you're looking for? I'd be happy to help or book you a free strategy call.`;
    }

    await prisma.chatbotLog.create({
      data: {
        sessionId: sessionId ?? "session-unknown",
        role: "assistant",
        message: answer,
        metadata: JSON.stringify({
          source: isRealKey ? "openai" : "simulation",
        }),
      },
    });

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error: any) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      { error: "An error occurred processing your message" },
      { status: 500 },
    );
  }
}
