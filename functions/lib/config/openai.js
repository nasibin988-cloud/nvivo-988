"use strict";
/**
 * OpenAI Configuration
 *
 * Centralized configuration for OpenAI API usage across all Cloud Functions.
 * Update the model version here to change it everywhere.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENAI_CONFIG = exports.OPENAI_MODEL = void 0;
exports.getModelConfig = getModelConfig;
/**
 * The OpenAI model to use for all AI operations.
 * Updated: December 2025
 */
exports.OPENAI_MODEL = 'gpt-5.1-2025-11-13';
/**
 * Model configuration for different use cases
 * Note: Using max_completion_tokens (not max_tokens) for GPT-5.x models
 */
exports.OPENAI_CONFIG = {
    // Vision tasks (food analysis, menu scanning)
    vision: {
        model: exports.OPENAI_MODEL,
        maxCompletionTokens: 2000,
        temperature: 0.3, // Lower for more consistent results
    },
    // Extraction tasks (parsing structured data)
    extraction: {
        model: exports.OPENAI_MODEL,
        maxCompletionTokens: 4000,
        temperature: 0.2,
    },
    // Generation tasks (recommendations, summaries)
    generation: {
        model: exports.OPENAI_MODEL,
        maxCompletionTokens: 1500,
        temperature: 0.4,
    },
    // Assessment tasks (health scoring, analysis)
    assessment: {
        model: exports.OPENAI_MODEL,
        maxCompletionTokens: 2000,
        temperature: 0.3,
    },
};
/**
 * Helper to get model config by task type
 */
function getModelConfig(task) {
    return exports.OPENAI_CONFIG[task];
}
//# sourceMappingURL=openai.js.map