import { getGroqChatCompletion } from './groq';

export async function generateRecommendationsJson(context: string): Promise<string> {
  const prompt = `Based on the following user context, recommend some travel destinations.
You MUST respond strictly in valid JSON format matching exactly this structure without any markdown formatting or surrounding text:
{
  "destinations": [
    {
      "name": "string",
      "country": "string",
      "description": "string",
      "estimatedBudget": 0,
      "matchScore": 0,
      "bestTimeToVisit": "string"
    }
  ],
  "insights": "string"
}

User context:
${context}
`;

  const messages = [
    { role: 'system' as const, content: 'You are an expert travel assistant. You only output valid raw JSON.' },
    { role: 'user' as const, content: prompt }
  ];

  // Request a JSON response from Groq
  // Some Groq models natively support response_format: { type: "json_object" }
  // we will try to extract the JSON from text just in case.
  const completion = await getGroqChatCompletion(messages, "qwen/qwen3.6-27b", 1500);

  return completion.choices[0]?.message?.content || "{}";
}

export function extractJsonFromText(text: string): string {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return text;
}
