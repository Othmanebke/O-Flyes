import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import axios from "axios";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();
const PORT = process.env.AI_PORT || 3003;
const DB_URL = process.env.NEXT_PUBLIC_API_DB || "http://localhost:3002";

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ── Types ─────────────────────────────────────────────────────────────────────
interface Activity {
  name: string;
  price: number;
  emoji: string;
}

interface EnrichedDestination {
  name: string;
  country: string;
  emoji: string;
  price_estimate: number;
  booking_url: string;
  flights_url: string;
  activities: Activity[];
}

// ── Gemini model ─────────────────────────────────────────────────────────────
function getModel() {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  });
}

function stripFences(raw: string) {
  return raw.replace(/^```json\n?|^```\n?|\n?```$/gm, "").trim();
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es O-Flyes, un assistant de voyage passionné et enthousiaste !
Tu adores aider les voyageurs à découvrir des destinations de rêve selon leur budget, leurs envies (plage, montagne, ville, culture, aventure…), le climat souhaité et la période de voyage.
Tu poses des questions précises pour affiner les recommandations.
Tu réponds TOUJOURS en français sauf si l'utilisateur écrit dans une autre langue.
Quand tu recommandes une destination, tu es TRÈS enthousiaste : émojis, descriptions vivantes, adjectifs inspirants.
RÈGLE IMPORTANTE : Dès que tu mentionnes des destinations concrètes, inclus TOUJOURS à la fin de ta réponse un bloc JSON encapsulé entre les balises <<<ENRICHED>>> et <<<END>>> avec ce format EXACT :
<<<ENRICHED>>>
[
  {
    "name": "Bali",
    "country": "Indonésie",
    "emoji": "🌴",
    "price_estimate": 1850,
    "booking_url": "https://www.booking.com/searchresults.fr.html?ss=Bali+Indonesie",
    "flights_url": "https://www.google.com/travel/flights?q=vols+Paris+Bali",
    "activities": [
      { "name": "Rizières de Tegallalang", "price": 5, "emoji": "🌾" },
      { "name": "Cours de surf à Kuta", "price": 25, "emoji": "🏄" },
      { "name": "Temple d'Uluwatu + Kecak", "price": 15, "emoji": "🛕" }
    ]
  }
]
<<<END>>>
Si tu poses uniquement des questions ou tu ne recommandes pas encore de destination précise, n'inclus PAS ce bloc JSON.`;

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", service: "ai", provider: "gemini" }));

// ── POST /chat – conversational chatbot ──────────────────────────────────────
app.post("/chat", async (req, res) => {
  const { messages, userId } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    userId?: string;
  };

  if (!messages?.length) return res.status(400).json({ error: "No messages" });

  try {
    const model = getModel();

    const history = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.role === "assistant" ? m.content.split("<<<ENRICHED>>>")[0].trim() : m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history,
      systemInstruction: { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    });

    const result = await chat.sendMessage(lastMessage);
    const raw = result.response.text();

    // ── Extract enriched block if present ────────────────────────────────────
    const enrichedMatch = raw.match(/<<<ENRICHED>>>([\s\S]*?)<<<END>>>/);
    let enriched: EnrichedDestination[] | undefined;
    let reply = raw;

    if (enrichedMatch) {
      try {
        enriched = JSON.parse(stripFences(enrichedMatch[1]));
      } catch (e) {
        console.error("[ai] Failed to parse enriched JSON:", e);
      }
      // Remove the JSON block from the visible reply
      reply = raw.replace(/<<<ENRICHED>>>[\s\S]*?<<<END>>>/, "").trim();
    }

    // Persist to DB if userId provided
    if (userId) {
      await axios.post(`${DB_URL}/chat`, {
        user_id: userId,
        role: "assistant",
        content: reply,
      }).catch(() => {});
    }

    res.json({ reply, enriched });
  } catch (err: any) {
    console.error("[ai] Gemini error:", err.message);
    res.status(500).json({ error: "AI service error", detail: err.message });
  }
});

// ── POST /recommend – structured recommendation ───────────────────────────────
app.post("/recommend", async (req, res) => {
  const { budget, climate, period, interests, duration_days } = req.body;

  const prompt = `${SYSTEM_PROMPT}

Recommande 3 destinations de voyage avec les critères suivants :
- Budget total : ${budget} €
- Climat préféré : ${climate}
- Période : ${period}
- Centres d'intérêt : ${interests?.join(", ")}
- Durée : ${duration_days} jours

Réponds UNIQUEMENT en JSON valide (pas de texte autour) avec ce format :
{
  "destinations": [
    {
      "name": "Nom destination",
      "country": "Pays",
      "why": "Pourquoi c'est idéal",
      "estimated_cost": 1200,
      "highlights": ["highlight1", "highlight2"]
    }
  ]
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const parsed = JSON.parse(stripFences(raw.replace(/<<<ENRICHED>>>[\s\S]*?<<<END>>>/, "")));
    res.json(parsed);
  } catch (err: any) {
    console.error("[ai] Gemini recommend error:", err.message);
    res.status(500).json({ error: "AI service error", detail: err.message });
  }
});

app.listen(PORT, () => console.log(`[ai-service] Gemini 1.5 Flash running on port ${PORT}`));
