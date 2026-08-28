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

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API Error:", errorText);
        throw new Error(`Groq API Request Failed: ${response.status}`);
    }

    return response.json();
}
