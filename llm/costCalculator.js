// Cost calculation utilities for OpenAI API usage
// Pricing data in USD per 1,000 tokens (as of July 2025)

const MODEL_PRICING = {
  // GPT-4.1 models
  "gpt-4.1-2025-04-14": {
    input: 2, // $2.00 per 1M input tokens
    output: 8, // $8.00 per 1M output tokens
  },
  "gpt-4.1-mini-2025-04-14": {
    input: 0.4, // $0.40 per 1M input tokens
    output: 1.6, // $1.60 per 1M output tokens
  },
  "gpt-4.1-nano-2025-04-14": {
    input: 0.1, // $0.10 per 1M input tokens
    output: 0.4, // $0.40 per 1M output tokens
  },

  // o4-mini models (estimated pricing)
  "o4-mini-2025-04-16": {
    input: 1.1, // $1.10 per 1K input tokens
    output: 4.4, // $4.40 per 1M output tokens
  },

  // Fallback pricing for unknown models
  default: {
    input: 0.002, // Conservative estimate
    output: 0.008, // Conservative estimate
  },
};

/**
 * Calculate cost for a single API call based on token usage
 * @param {string} model - The model name used
 * @param {object} tokenUsage - Token usage object with prompt_tokens and completion_tokens
 * @returns {object} Cost breakdown with input, output, and total costs
 */
export function calculateCost(model, tokenUsage) {
  if (!tokenUsage || typeof tokenUsage !== "object") {
    return {
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      currency: "USD",
    };
  }

  const pricing = MODEL_PRICING[model] || MODEL_PRICING.default;
  const promptTokens = tokenUsage.prompt_tokens || 0;
  const completionTokens = tokenUsage.completion_tokens || 0;

  // Calculate costs (pricing is per 1,000,000 tokens)
  const inputCost = (promptTokens / 1000000) * pricing.input;
  const outputCost = (completionTokens / 1000000) * pricing.output;
  const totalCost = inputCost + outputCost;

  return {
    inputCost: Number(inputCost.toFixed(6)),
    outputCost: Number(outputCost.toFixed(6)),
    totalCost: Number(totalCost.toFixed(6)),
    currency: "USD",
    model: model,
    tokens: {
      prompt: promptTokens,
      completion: completionTokens,
      total: promptTokens + completionTokens,
    },
  };
}

/**
 * Calculate total costs for story generation and evaluation
 * @param {string} storyModel - Model used for story generation
 * @param {object} storyTokenUsage - Token usage for story generation
 * @param {string} evaluationModel - Model used for evaluation
 * @param {object} evaluationTokenUsage - Token usage for evaluation
 * @returns {object} Combined cost breakdown
 */
export function calculateTotalCosts(
  storyModel,
  storyTokenUsage,
  evaluationModel,
  evaluationTokenUsage
) {
  const storyCost = calculateCost(storyModel, storyTokenUsage);
  const evaluationCost = calculateCost(evaluationModel, evaluationTokenUsage);

  return {
    story: storyCost,
    evaluation: evaluationCost,
    total: {
      inputCost: Number(
        (storyCost.inputCost + evaluationCost.inputCost).toFixed(6)
      ),
      outputCost: Number(
        (storyCost.outputCost + evaluationCost.outputCost).toFixed(6)
      ),
      totalCost: Number(
        (storyCost.totalCost + evaluationCost.totalCost).toFixed(6)
      ),
      currency: "USD",
    },
    combined: {
      totalTokens: storyCost.tokens.total + evaluationCost.tokens.total,
      promptTokens: storyCost.tokens.prompt + evaluationCost.tokens.prompt,
      completionTokens:
        storyCost.tokens.completion + evaluationCost.tokens.completion,
    },
  };
}

/**
 * Get pricing information for a specific model
 * @param {string} model - The model name
 * @returns {object} Pricing information
 */
export function getModelPricing(model) {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING.default;
  return {
    model: model,
    inputPricePerM: pricing.input,
    outputPricePerM: pricing.output,
    currency: "USD",
  };
}

/**
 * Get all available model pricing
 * @returns {object} All model pricing information
 */
export function getAllModelPricing() {
  return Object.entries(MODEL_PRICING)
    .filter(([model]) => model !== "default")
    .reduce((acc, [model, pricing]) => {
      acc[model] = {
        inputPricePerM: pricing.input,
        outputPricePerM: pricing.output,
        currency: "USD",
      };
      return acc;
    }, {});
}

/**
 * Format cost for display
 * @param {number} cost - Cost in USD
 * @param {boolean} showCents - Whether to show cents for very small amounts
 * @returns {string} Formatted cost string
 */
export function formatCost(cost, showCents = true) {
  if (cost === 0) return "$0.00";

  if (cost < 0.01 && showCents) {
    // For very small amounts, show more decimal places
    return `$${cost.toFixed(6)}`;
  } else if (cost < 1) {
    return `$${cost.toFixed(4)}`;
  } else {
    return `$${cost.toFixed(2)}`;
  }
}

/**
 * Calculate cost efficiency metrics
 * @param {number} totalCost - Total cost in USD
 * @param {number} storyLength - Length of generated story (characters)
 * @param {number} overallScore - Overall evaluation score (1-10)
 * @returns {object} Efficiency metrics
 */
export function calculateCostEfficiency(totalCost, storyLength, overallScore) {
  return {
    costPerCharacter:
      storyLength > 0 ? Number((totalCost / storyLength).toFixed(8)) : 0,
    costPerWord:
      storyLength > 0 ? Number((totalCost / (storyLength / 5)).toFixed(6)) : 0, // Estimate ~5 chars per word
    costPerQualityPoint:
      overallScore > 0 ? Number((totalCost / overallScore).toFixed(6)) : 0,
    qualityPerDollar:
      totalCost > 0 ? Number((overallScore / totalCost).toFixed(2)) : 0,
  };
}
