import { z } from 'zod';

export const recommendationResultSchema = z.object({
    destinations: z.array(z.object({
        name: z.string(),
        country: z.string(),
        description: z.string(),
        estimatedBudget: z.number(),
        matchScore: z.number().min(0).max(100),
        bestTimeToVisit: z.string(),
        imageUrl: z.string().optional()
    })).min(1, "At least one destination must be recommended").max(5),
    insights: z.string().optional()
});

export type RecommendationResult = z.infer<typeof recommendationResultSchema>;

// Schema for the incoming API request to generate recommendations
export const generateRecommendationRequestSchema = z.object({
    prompt: z.string().min(5, "Prompt is too short"),
});
