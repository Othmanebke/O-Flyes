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

// ── Gemini model ─────────────────────────────────────────────────────────────
function getModel() {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT,       threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,      threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  });
}

// ── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es O-Flyes, un assistant de voyage intelligent et chaleureux.
Tu aides les utilisateurs à trouver leur destination idéale selon leur budget, leurs envies (plage, montagne, ville, culture…), leur préférence de climat (chaud/froid), et leur période de voyage.
Tu poses des questions précises pour affiner les recommandations.
Tu réponds toujours en français sauf si l'utilisateur écrit dans une autre langue.
Quand tu identifies une ou plusieurs destinations pertinentes, tu indiques leur nom, leur budget estimé (vol + hôtel pour 2 personnes / 2 semaines) et pourquoi elles correspondent.
Reste concis, amical et enthousiaste.
Si l'utilisateur mentionne un budget, propose des destinations qui correspondent à ce budget.`;

// ── Health ───────────────────────────────────────────────────────────────────
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

    // Build chat history (all messages except last user message)
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    // Start chat with history
    const chat = model.startChat({
      history,
      systemInstruction: { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    });

    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();

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

    // Strip markdown code fences if present
    const clean = raw.replace(/^```json\n?|^```\n?|\n?```$/g, "").trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err: any) {
    console.error("[ai] Gemini recommend error:", err.message);
    res.status(500).json({ error: "AI service error", detail: err.message });
  }
});

app.listen(PORT, () => console.log(`[ai-service] Gemini 1.5 Flash running on port ${PORT}`));
