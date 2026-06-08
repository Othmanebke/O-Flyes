import { getGroqChatCompletion } from '@/lib/ai/groq';

/**
 * Calls Groq in JSON mode and parses the result, falling back to a safe default
 * if the model errors or returns malformed JSON. Used by every agent so a single
 * flaky LLM call degrades gracefully instead of breaking the whole pipeline.
 */
export async function callAgentJson<T>(systemPrompt: string, userPrompt: string, fallback: T, maxTokens = 1200): Promise<T> {
    try {
        const completion = await getGroqChatCompletion(
            [
                { role: 'system' as const, content: systemPrompt },
                { role: 'user' as const, content: userPrompt },
            ],
            'llama-3.3-70b-versatile',
            maxTokens,
            true
        );
        const text = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(text) as T;
    } catch (e) {
        console.error('[agents] LLM call failed, using fallback:', e);
        return fallback;
    }
}
