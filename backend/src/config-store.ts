import fs from "fs";
import path from "path";

const CONFIG_FILE_PATH = path.resolve(__dirname, "../prisma/configs.json");

export interface SystemConfigs {
  openaiApiKey: string;
  openaiModel: string;
  openaiTemperature: number;
  systemPrompt: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  elevenLabsApiKey: string;
  voiceProfile: string;
  crmConnected: {
    gohighlevel: boolean;
    hubspot: boolean;
    salesforce: boolean;
  };
  kbEntries: { q: string; a: string }[];
  publisherNote: string;
}

const defaultConfigs: SystemConfigs = {
  openaiApiKey: process.env.OPENAI_API_KEY || "mock-key",
  openaiModel: "gpt-4o-mini",
  openaiTemperature: 0.3,
  systemPrompt: `You are a warm, consultative, high-ticket sales specialist for Digihood Studio — a premium enterprise AI automation agency for service businesses.

COMPANY OVERVIEW:
Digihood Studio provides AI-powered phone answering, missed call recovery, and lead reactivation for home service businesses (HVAC, plumbing, electrical, roofing, cleaning, landscaping, etc). We help businesses never miss a lead and recover revenue 24/7.

CORE SERVICES:
1. AI Receptionist & Appointment Setter – 24/7 inbound call answering, lead qualification, appointment booking, weekly reporting. Live in 48 hours.
2. Missed Call Recovery – AI text-back within 10 seconds of any missed call, automated SMS, email alerts, CRM integration. Recovers 15-30% of lost leads.
3. Dead Lead Reactivation – AI email/SMS campaigns to revive cold contacts with lead scoring and revenue recovery reporting. Recovers $5k-$20k+ in dormant pipeline.

PRICING PACKAGES (month-to-month, no contracts):
- Starter: AI receptionist, custom scripts, weekly reports, email support
- Growth (Most Popular): Everything in Starter + missed call recovery, SMS follow-ups, CRM integration, bi-weekly strategy calls
- Dominance: Everything in Growth + dead lead reactivation, unlimited contacts, brand-trained voice, dedicated success manager

GUARANTEES:
- Live AI agent setup within 48 hours
- Missed calls recovered within 10 seconds
- Full ROI reporting dashboard
- Most clients see ROI within 30 days
- Month-to-month, cancel anytime

YOUR ROLE:
- You are a friendly, knowledgeable sales consultant — NOT a robot
- Qualify leads by asking about their business type, size, and current call volume
- Guide conversations naturally toward booking a free 30-minute strategy call/demo
- Be concise (under 150 words), conversational, and results-focused
- Adapt your tone to match the prospect's energy
- If asked something outside your knowledge, offer to connect them with a team specialist
- NEVER make up pricing figures — guide them to book a call for a custom quote`,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "ACmock",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "mocktoken",
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || "+15550199",
  elevenLabsApiKey: "mock-eleven-labs-key",
  voiceProfile: "Rachel",
  crmConnected: {
    gohighlevel: true,
    hubspot: false,
    salesforce: false,
  },
  kbEntries: [
    {
      q: "What is the setup time?",
      a: "AI receptionist setup is live within 48 hours.",
    },
    {
      q: "Is there a contract?",
      a: "All packages are month-to-month with no long-term contract.",
    },
  ],
  publisherNote:
    "Delivery Agent Note: Integrated ServiceTitan. AI Callback rules successfully live.",
};

let activeConfigs: SystemConfigs = { ...defaultConfigs };

// Load configurations on import
try {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    const rawData = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
    const parsed = JSON.parse(rawData);
    activeConfigs = { ...defaultConfigs, ...parsed };
    console.log("Successfully loaded persisted server configurations.");
  } else {
    // Write defaults
    fs.writeFileSync(
      CONFIG_FILE_PATH,
      JSON.stringify(defaultConfigs, null, 2),
      "utf-8",
    );
    console.log("Created new default configs.json file.");
  }
} catch (error) {
  console.error("Failed to load or initialize server configurations:", error);
}

export function getConfigs(): SystemConfigs {
  return activeConfigs;
}

export function updateConfigs(updates: Partial<SystemConfigs>): SystemConfigs {
  activeConfigs = {
    ...activeConfigs,
    ...updates,
    crmConnected: updates.crmConnected
      ? { ...activeConfigs.crmConnected, ...updates.crmConnected }
      : activeConfigs.crmConnected,
  };

  try {
    fs.writeFileSync(
      CONFIG_FILE_PATH,
      JSON.stringify(activeConfigs, null, 2),
      "utf-8",
    );
  } catch (error) {
    console.error("Failed to persist server configurations:", error);
  }

  return activeConfigs;
}

let apiCallCount = 0;

export function incrementApiCallCount() {
  apiCallCount++;
}

export function getApiCallCount() {
  return apiCallCount;
}
