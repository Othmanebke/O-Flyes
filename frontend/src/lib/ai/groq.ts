export async function getGroqChatCompletion(messages: any[], model: string = "llama-3.3-70b-versatile", maxTokens: number = 1000) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not set in the environment variables.");
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages,
            model,
            temperature: 0.7,
            max_tokens: maxTokens,
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API Error:", errorText);
        throw new Error(`Groq API Request Failed: ${response.status}`);
    }

    return response.json();
}
