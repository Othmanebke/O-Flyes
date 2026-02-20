import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";
import axios from "axios";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();
const PORT = process.env.AI_PORT || 3003;
const DB_URL = process.env.NEXT_PUBLIC_API_DB || "http://localhost:3002";

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es O-Flyes, un assistant de voyage intelligent et chaleureux.
Tu aides les utilisateurs à trouver leur destination idéale selon leur budget, leurs envies (plage, montagne, ville, culture…), leur préférence de climat (chaud/froid), et leur période de voyage.
Tu poses des questions précises pour affiner les recommandations.
Tu réponds toujours en français sauf si l'utilisateur écrit dans une autre langue.
Quand tu identifies une ou plusieurs destinations pertinentes, tu indiques leur nom et pourquoi elles correspondent.
Reste concis, amical et enthousiaste.`;

// ── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", service: "ai" }));

// ── POST /chat – conversational chatbot ──────────────────────────────────────
app.post("/chat", async (req, res) => {
  const { messages, userId } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    userId?: string;
  };

  if (!messages?.length) return res.status(400).json({ error: "No messages" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 600,
      temperature: 0.8,
    });

    const reply = completion.choices[0].message.content;

    // Persist to DB if userId provided
    if (userId) {
      await axios.post(`${DB_URL}/chat`, {
        user_id: userId,
        role: "assistant",
        content: reply,
      }).catch(() => {});
    }

    res.json({ reply });
  } catch (err: any) {
    console.error(err.message);
    const status = err?.status || err?.response?.status;
    if (status === 429) {
      return res.status(429).json({ error: "quota_exceeded", message: "Quota OpenAI dépassé" });
    }
    res.status(500).json({ error: "AI service error" });
  }
});

// ── POST /recommend – structured recommendation ───────────────────────────────
app.post("/recommend", async (req, res) => {
  const { budget, climate, period, interests, duration_days } = req.body;

  const prompt = `
Recommande 3 destinations de voyage avec les critères suivants :
- Budget total : ${budget} €
- Climat préféré : ${climate}
- Période : ${period}
- Centres d'intérêt : ${interests?.join(", ")}
- Durée : ${duration_days} jours

Réponds en JSON avec ce format :
[
  {
    "name": "Nom destination",
    "country": "Pays",
    "why": "Pourquoi c'est idéal",
    "estimated_cost": 1200,
    "highlights": ["highlight1", "highlight2"]
  }
]
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const raw = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: "AI service error" });
  }
});

app.listen(PORT, () => console.log(`[ai-service] running on port ${PORT}`));
