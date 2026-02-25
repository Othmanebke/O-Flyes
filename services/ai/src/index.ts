import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import Groq from "groq-sdk";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.AI_PORT || 3003;
const DB_URL = process.env.DB_URL || process.env.NEXT_PUBLIC_API_DB || "http://localhost:3002";

app.get("/", (req, res) => res.send("AIVANA AI Service is running."));
console.log(` - PORT: ${PORT}`);
console.log(` - DB_URL: ${DB_URL}`);

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[ai-service] ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

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
app.get("/health", (_req, res) => res.json({ status: "ok", service: "ai", provider: "groq" }));

// ── POST /chat – conversational chatbot ──────────────────────────────────────
app.post("/chat", async (req, res) => {
  const { messages, userId, tripId } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    userId?: string;
    tripId?: string;
  };

  if (!messages?.length) return res.status(400).json({ error: "No messages" });

  try {
    let contextPrompt = "";

    // Fetch Trip Context if tripId is provided
    if (tripId) {
      try {
        const tripRes = await axios.get(`${DB_URL}/trips/${tripId}`);
        const bookingsRes = await axios.get(`${DB_URL}/trips/${tripId}/bookings`).catch(() => ({ data: [] }));

        const trip = tripRes.data;
        const bookings = bookingsRes.data;

        contextPrompt = `\n[CONTEXTE DU VOYAGE ACTUEL]
Destination: ${trip.destination_name || trip.destination || 'Non définie'}
Dates: du ${trip.start_date || '?'} au ${trip.end_date || '?'}
Budget: ${trip.budget || 'Non défini'} €
Préférences: ${JSON.stringify(trip.preferences)}
Réservations actuelles: ${bookings.length > 0 ? bookings.map((b: any) => `- ${b.type}: ${b.title} (${b.status})`).join(', ') : 'Aucune'}
`;
      } catch (e: any) {
        console.warn("[ai] Could not fetch trip context:", e.message);
      }
    }

    const allMessages = messages.slice(0, -1);
    const firstUserIdx = allMessages.findIndex(m => m.role === "user");
    const trimmedHistory = firstUserIdx >= 0 ? allMessages.slice(firstUserIdx) : [];

    const history = trimmedHistory.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.role === "assistant" ? m.content.split("<<<ENRICHED>>>")[0].trim() : m.content,
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT + contextPrompt },
        ...history,
        { role: "user", content: lastMessage }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const raw = chatCompletion.choices[0]?.message?.content || "";

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
      reply = raw.replace(/<<<ENRICHED>>>[\s\S]*?<<<END>>>/, "").trim();
    }

    // Persist to DB if userId provided
    if (userId) {
      await axios.post(`${DB_URL}/chat`, {
        user_id: userId,
        trip_id: tripId,
        role: "user",
        content: lastMessage,
      }).catch((e) => console.error("Error saving user msg", e));

      await axios.post(`${DB_URL}/chat`, {
        user_id: userId,
        trip_id: tripId,
        role: "assistant",
        content: reply,
      }).catch((e) => console.error("Error saving assistant msg", e));
    }

    res.json({ reply, enriched });
  } catch (err: any) {
    console.error("[ai] Groq error:", err.message);
    res.status(500).json({ error: "AI service error", detail: err.message });
  }
});

// ── POST /extract – extract booking from email ─────────────────────────────
app.post("/extract", async (req, res) => {
  const { emailBody } = req.body;
  if (!emailBody) return res.status(400).json({ error: "No email body" });

  const prompt = `Extraction de données de voyage de cet email. 
Réponds UNIQUEMENT en JSON valide suivant ce format :
{
  "booking": {
    "type": "flight" | "hotel" | "activity" | "transport",
    "title": "Nom du vol ou de l'hôtel",
    "provider": "Compagnie ou plateforme",
    "confirmation_number": "Code de confirmation",
    "start_date": "ISO-8601 date",
    "end_date": "ISO-8601 date (optionnel)",
    "price": 123.45,
    "currency": "EUR"
  }
}

EMAIL CONTENT :
${emailBody}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, // low temp for extraction
      max_tokens: 1024,
    });

    const raw = chatCompletion.choices[0]?.message?.content || "";
    const cleaned = stripFences(raw);
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (err: any) {
    console.error("[ai] Extraction error:", err.message);
    res.status(500).json({ error: "Extraction failed" });
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
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const raw = chatCompletion.choices[0]?.message?.content || "";
    const parsed = JSON.parse(stripFences(raw.replace(/<<<ENRICHED>>>[\s\S]*?<<<END>>>/, "")));
    res.json(parsed);
  } catch (err: any) {
    console.error("[ai] Groq recommend error:", err.message);
    res.status(500).json({ error: "AI service error", detail: err.message });
  }
});

app.listen(PORT, () => console.log(`[ai-service] Groq Llama 3 running on port ${PORT}`));
