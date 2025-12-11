/**
 * OpenAI Configuration
 *
 * Centralized configuration for OpenAI API usage across all Cloud Functions.
 * Update the model version here to change it everywhere.
 */

/**
 * The OpenAI model to use for complex AI operations.
 * Updated: December 2025
 */
export const OPENAI_MODEL = 'gpt-5.1-2025-11-13';

/**
 * Mini model for simple, cost-effective tasks (grading, comparisons)
 * GPT-4o-mini is ~10-20x cheaper than full models
 */
export const OPENAI_MODEL_MINI = 'gpt-4o-mini';

/**
 * Model configuration for different use cases
 */
export const OPENAI_CONFIG = {
  // Vision tasks (food analysis, menu scanning)
  vision: {
    model: OPENAI_MODEL,
    maxCompletionTokens: 2000,
    temperature: 0.3, // Lower for more consistent results
  },

  // Extraction tasks (parsing structured data)
  extraction: {
    model: OPENAI_MODEL,
    maxCompletionTokens: 4000,
    temperature: 0.2,
  },

  // Generation tasks (recommendations, summaries)
  generation: {
    model: OPENAI_MODEL,
    maxCompletionTokens: 1500,
    temperature: 0.4,
  },

  // Assessment tasks (health scoring, analysis)
  assessment: {
    model: OPENAI_MODEL,
    maxCompletionTokens: 2000,
    temperature: 0.3,
  },

  // Simple grading tasks (use mini model for cost savings)
  grading: {
    model: OPENAI_MODEL_MINI,
    maxCompletionTokens: 500,
    temperature: 0.2, // Low temp for consistent grading
  },

  // Simple comparison/verdict tasks (use mini model)
  comparison: {
    model: OPENAI_MODEL_MINI,
    maxCompletionTokens: 400,
    temperature: 0.3,
  },
} as const;

/**
 * Helper to get model config by task type
 */
export function getModelConfig(task: keyof typeof OPENAI_CONFIG) {
  return OPENAI_CONFIG[task];
}
