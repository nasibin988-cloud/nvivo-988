/**
 * OpenAI Configuration
 *
 * Centralized configuration for OpenAI API usage across all Cloud Functions.
 * Update the model version here to change it everywhere.
 */

/**
 * The OpenAI model to use for all AI operations.
 * Updated: December 2025
 */
export const OPENAI_MODEL = 'gpt-5.1-2025-11-13';

/**
 * Model configuration for different use cases
 * Note: Using max_completion_tokens (not max_tokens) for GPT-5.x models
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
} as const;

/**
 * Helper to get model config by task type
 */
export function getModelConfig(task: keyof typeof OPENAI_CONFIG) {
  return OPENAI_CONFIG[task];
}
