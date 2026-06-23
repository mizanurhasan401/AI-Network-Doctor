import { z } from 'zod'

/** Validates raw model JSON before we trust it as an AiRecommendation. */
export const aiRecommendationSchema = z.object({
  problemSummaryBn: z.string().min(1),
  rootCauseBn: z.string().min(1),
  impactBn: z.string().min(1),
  solutionsBn: z.array(z.string().min(1)).min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  confidence: z.number().min(0).max(1)
})

export type RawAiRecommendation = z.infer<typeof aiRecommendationSchema>
