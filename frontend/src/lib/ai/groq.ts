interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GroqRequestBody {
    messages: GroqMessage[];
    model: string;
    temperature: number;
    max_tokens: number;
    response_format?: { type: string };
    reasoning_format?: string;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(apiKey: string, body: GroqRequestBody) {
    const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
    });

    if (response.ok) return { ok: true as const, data: await response.json() };
    return { ok: false as const, status: response.status, errorText: await response.text() };
}

export async function getGroqChatCompletion(messages: GroqMessage[], model: string = "openai/gpt-oss-20b", maxTokens: number = 2000, jsonMode: boolean = false) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not set in the environment variables.");
    }

    const body: GroqRequestBody = {
        messages,
        model,
        temperature: 0.7,
        max_tokens: maxTokens,
    };

    if (jsonMode) {
        body.response_format = { type: "json_object" };
    }

    let result = await callGroq(apiKey, body);

    // Tous les modèles Groq n'acceptent pas response_format: json_object (ils répondent
    // alors 400). Plutôt que de casser le chat, on réessaie sans ce paramètre : les
    // appelants savent déjà extraire le JSON d'une réponse texte.
    if (!result.ok && result.status === 400 && jsonMode) {
        console.error("Groq API Error (json_object mode):", result.errorText);
        delete body.response_format;
        result = await callGroq(apiKey, body);
    }

    if (!result.ok) {
        // On remonte le détail renvoyé par Groq, sinon on ne voit qu'un code HTTP nu
        // et le diagnostic est impossible depuis le client.
        console.error("Groq API Error:", result.errorText);
        const detail = result.errorText?.slice(0, 300) || "no error body";
        throw new Error(`Groq API Request Failed: ${result.status} — ${detail}`);
    }

    return result.data;
}
