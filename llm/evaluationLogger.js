import fs from "node:fs/promises";
import path from "node:path";
import {
  calculateTotalCosts,
  calculateCostEfficiency,
} from "./costCalculator.js";

const LOGS_DIR = "logs";
const EVALUATION_LOG_FILE = "evaluation-logs.json";

// Ensure logs directory exists
async function ensureLogsDir() {
  try {
    await fs.access(LOGS_DIR);
  } catch {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  }
}

// Log evaluation data with timestamp and performance metrics
export async function logEvaluation(
  evaluationData,
  performanceStats,
  story,
  modelInfo = {},
  complexityInfo = {}
) {
  await ensureLogsDir();

  const logEntry = {
    timestamp: new Date().toISOString(),
    id: generateId(),
    models: {
      storyModel: modelInfo.storyModel || "unknown",
      evaluationModel: modelInfo.evaluationModel || "unknown",
    },
    complexity: {
      promptComplexity: complexityInfo.promptComplexity || "complex",
      evaluationComplexity: complexityInfo.evaluationComplexity || "complex",
    },
    performance: {
      timeToFirstToken: performanceStats.timeToFirstToken,
      totalTime: performanceStats.totalTime,
      evaluationTime: performanceStats.evaluationTime,
    },
    tokenUsage: {
      story: performanceStats.storyTokenUsage || null,
      evaluation: performanceStats.evaluationTokenUsage || null,
      total: {
        prompt_tokens:
          (performanceStats.storyTokenUsage?.prompt_tokens || 0) +
          (performanceStats.evaluationTokenUsage?.prompt_tokens || 0),
        completion_tokens:
          (performanceStats.storyTokenUsage?.completion_tokens || 0) +
          (performanceStats.evaluationTokenUsage?.completion_tokens || 0),
        total_tokens:
          (performanceStats.storyTokenUsage?.total_tokens || 0) +
          (performanceStats.evaluationTokenUsage?.total_tokens || 0),
      },
    },
    evaluation: evaluationData,
    storyLength: story ? story.length : 0,
    wordCount: story ? story.split(/\s+/).length : 0,
  };

  // Calculate cost metrics
  const costBreakdown = calculateTotalCosts(
    modelInfo.storyModel,
    performanceStats.storyTokenUsage,
    modelInfo.evaluationModel,
    performanceStats.evaluationTokenUsage
  );

  // Calculate cost efficiency metrics if evaluation has overall score
  let costEfficiency = null;
  if (
    evaluationData &&
    evaluationData.overallScore &&
    typeof evaluationData.overallScore === "number"
  ) {
    costEfficiency = calculateCostEfficiency(
      costBreakdown.total.totalCost,
      logEntry.storyLength,
      evaluationData.overallScore
    );
  }

  // Add cost data to log entry
  logEntry.costs = costBreakdown;
  if (costEfficiency) {
    logEntry.costEfficiency = costEfficiency;
  }

  const logFilePath = path.join(LOGS_DIR, EVALUATION_LOG_FILE);

  try {
    // Read existing logs
    let logs = [];
    try {
      const existingData = await fs.readFile(logFilePath, "utf-8");
      logs = JSON.parse(existingData);
    } catch {
      // File doesn't exist or is empty, start with empty array
      logs = [];
    }

    // Add new log entry
    logs.push(logEntry);

    // Keep only the last 1000 entries to prevent file from growing too large
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    // Write back to file
    await fs.writeFile(logFilePath, JSON.stringify(logs, null, 2));

    console.log(`Evaluation logged with ID: ${logEntry.id}`);
    return logEntry.id;
  } catch (error) {
    console.error("Failed to log evaluation:", error);
    throw error;
  }
}

// Retrieve all evaluation logs
export async function getEvaluationLogs() {
  await ensureLogsDir();

  const logFilePath = path.join(LOGS_DIR, EVALUATION_LOG_FILE);

  try {
    const data = await fs.readFile(logFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    // File doesn't exist, return empty array
    return [];
  }
}

// Get evaluation statistics
export async function getEvaluationStats(modelFilter = null) {
  console.log("getEvaluationStats called with filter:", modelFilter);
  try {
    const logs = await getEvaluationLogs();
    console.log("Logs length:", logs.length);

    if (logs.length === 0) {
      console.log("No logs found, returning empty stats");
      return {
        totalEvaluations: 0,
        averageScores: {},
        performanceStats: {},
        recentEvaluations: [],
        modelBreakdown: {},
      };
    }

    // Filter logs by story model if specified (only filter by story model, not evaluation model)
    const filteredLogs = modelFilter
      ? logs.filter((log) => log.models?.storyModel === modelFilter)
      : logs;

    // Get model breakdown statistics with enhanced tracking
    const modelBreakdown = {};

    // Initialize model tracking structures
    logs.forEach((log) => {
      if (log.models) {
        const storyModel = log.models.storyModel || "unknown";
        const evaluationModel = log.models.evaluationModel || "unknown";

        // Initialize story model tracking
        if (!modelBreakdown[storyModel]) {
          modelBreakdown[storyModel] = {
            type: "story",
            storyGenerations: 0,
            evaluations: 0,
            successfulEvaluations: 0,
            failedEvaluations: 0,
            totalEvaluations: 0,
            averageScores: {},
            averagePerformance: {},
            averageTokenUsage: {},
            lastUsed: null,
          };
        }

        // Track usage counts and last used timestamp
        const logTimestamp = new Date(log.timestamp);

        modelBreakdown[storyModel].storyGenerations++;
        if (
          !modelBreakdown[storyModel].lastUsed ||
          logTimestamp > new Date(modelBreakdown[storyModel].lastUsed)
        ) {
          modelBreakdown[storyModel].lastUsed = log.timestamp;
        }
      }
    });

    // Calculate detailed statistics per model
    Object.keys(modelBreakdown).forEach((model) => {
      const modelData = modelBreakdown[model];

      // Get logs for story models - need to link evaluations to story models
      const modelLogs = logs.filter((log) => {
        if (modelData.type === "story") {
          return log.models?.storyModel === model;
        } else {
          return log.models?.evaluationModel === model;
        }
      });

      // For story models, get evaluation results from logs where this model generated the story
      const successfulEvaluationLogs = logs.filter(
        (log) =>
          log.models?.storyModel === model && // Link evaluations to story model
          log.evaluation &&
          !log.evaluation.error &&
          log.evaluation.overallScore
      );

      // Calculate average scores - for story models, use evaluations of stories they generated
      if (successfulEvaluationLogs.length > 0) {
        const scoreFields = [
          "contentQuality",
          "writingStyle",
          "creativity",
          "emotionalImpact",
        ];

        scoreFields.forEach((field) => {
          const scores = successfulEvaluationLogs
            .map((log) => log.evaluation[field]?.score)
            .filter((score) => typeof score === "number");

          if (scores.length > 0) {
            modelData.averageScores[field] =
              scores.reduce((sum, score) => sum + score, 0) / scores.length;
          }
        });

        const overallScores = successfulEvaluationLogs
          .map((log) => log.evaluation.overallScore)
          .filter((score) => typeof score === "number");

        if (overallScores.length > 0) {
          modelData.averageScores.overall =
            overallScores.reduce((sum, score) => sum + score, 0) /
            overallScores.length;
        }
      }

      // Update success/failure counts for story models
      if (modelData.type === "story") {
        const storyEvaluations = logs.filter(
          (log) => log.models?.storyModel === model
        );

        modelData.totalEvaluations = storyEvaluations.length;
        modelData.successfulEvaluations = storyEvaluations.filter(
          (log) =>
            log.evaluation &&
            !log.evaluation.error &&
            log.evaluation.overallScore
        ).length;
        modelData.failedEvaluations =
          modelData.totalEvaluations - modelData.successfulEvaluations;
      }

      // Calculate average performance metrics
      if (modelLogs.length > 0) {
        const performances = modelLogs
          .map((log) => log.performance)
          .filter((p) => p);

        if (performances.length > 0) {
          modelData.averagePerformance = {
            timeToFirstToken:
              performances.reduce(
                (sum, p) => sum + (p.timeToFirstToken || 0),
                0
              ) / performances.length,
            totalTime:
              performances.reduce((sum, p) => sum + (p.totalTime || 0), 0) /
              performances.length,
            evaluationTime:
              performances.reduce(
                (sum, p) => sum + (p.evaluationTime || 0),
                0
              ) / performances.length,
          };
        }
      }

      // Calculate average token usage
      const tokenUsageLogs = modelLogs.filter((log) => log.tokenUsage);
      if (tokenUsageLogs.length > 0) {
        modelData.averageTokenUsage = {
          totalTokens:
            tokenUsageLogs.reduce(
              (sum, log) => sum + (log.tokenUsage.total?.total_tokens || 0),
              0
            ) / tokenUsageLogs.length,
          promptTokens:
            tokenUsageLogs.reduce(
              (sum, log) => sum + (log.tokenUsage.total?.prompt_tokens || 0),
              0
            ) / tokenUsageLogs.length,
          completionTokens:
            tokenUsageLogs.reduce(
              (sum, log) =>
                sum + (log.tokenUsage.total?.completion_tokens || 0),
              0
            ) / tokenUsageLogs.length,
        };

        // Calculate story-specific token usage for story models
        const storyTokenLogs = tokenUsageLogs.filter(
          (log) => log.models?.storyModel === model && log.tokenUsage.story
        );
        if (storyTokenLogs.length > 0) {
          modelData.averageTokenUsage.storyTokens =
            storyTokenLogs.reduce(
              (sum, log) => sum + (log.tokenUsage.story.total_tokens || 0),
              0
            ) / storyTokenLogs.length;
        }

        // Calculate evaluation-specific token usage for evaluation models
        const evalTokenLogs = tokenUsageLogs.filter(
          (log) =>
            log.models?.evaluationModel === model && log.tokenUsage.evaluation
        );
        if (evalTokenLogs.length > 0) {
          modelData.averageTokenUsage.evaluationTokens =
            evalTokenLogs.reduce(
              (sum, log) => sum + (log.tokenUsage.evaluation.total_tokens || 0),
              0
            ) / evalTokenLogs.length;
        }
      }

      // Calculate average cost metrics
      const costLogs = modelLogs.filter((log) => log.costs);
      if (costLogs.length > 0) {
        modelData.averageCosts = {
          totalCost:
            costLogs.reduce(
              (sum, log) => sum + (log.costs.total.totalCost || 0),
              0
            ) / costLogs.length,
          inputCost:
            costLogs.reduce(
              (sum, log) => sum + (log.costs.total.inputCost || 0),
              0
            ) / costLogs.length,
          outputCost:
            costLogs.reduce(
              (sum, log) => sum + (log.costs.total.outputCost || 0),
              0
            ) / costLogs.length,
        };

        // For story models, get cost breakdown for story generation specifically
        if (modelData.type === "story") {
          const storyCostLogs = costLogs.filter(
            (log) => log.models?.storyModel === model && log.costs.story
          );
          if (storyCostLogs.length > 0) {
            modelData.averageCosts.storyCost =
              storyCostLogs.reduce(
                (sum, log) => sum + (log.costs.story.totalCost || 0),
                0
              ) / storyCostLogs.length;
          }
        }

        // Calculate cost efficiency for story models
        if (modelData.type === "story") {
          const efficiencyLogs = costLogs.filter((log) => log.costEfficiency);
          if (efficiencyLogs.length > 0) {
            modelData.costEfficiency = {
              costPerCharacter:
                efficiencyLogs.reduce(
                  (sum, log) =>
                    sum + (log.costEfficiency.costPerCharacter || 0),
                  0
                ) / efficiencyLogs.length,
              costPerWord:
                efficiencyLogs.reduce(
                  (sum, log) => sum + (log.costEfficiency.costPerWord || 0),
                  0
                ) / efficiencyLogs.length,
              costPerQualityPoint:
                efficiencyLogs.reduce(
                  (sum, log) =>
                    sum + (log.costEfficiency.costPerQualityPoint || 0),
                  0
                ) / efficiencyLogs.length,
              qualityPerDollar:
                efficiencyLogs.reduce(
                  (sum, log) =>
                    sum + (log.costEfficiency.qualityPerDollar || 0),
                  0
                ) / efficiencyLogs.length,
            };
          }
        }

        // Calculate total cumulative costs for this model
        modelData.totalCosts = {
          total: costLogs.reduce(
            (sum, log) => sum + (log.costs.total.totalCost || 0),
            0
          ),
          input: costLogs.reduce(
            (sum, log) => sum + (log.costs.total.inputCost || 0),
            0
          ),
          output: costLogs.reduce(
            (sum, log) => sum + (log.costs.total.outputCost || 0),
            0
          ),
        };
      }
    });

    // Filter out failed evaluations for score calculations
    const successfulEvaluations = filteredLogs.filter(
      (log) =>
        log.evaluation && !log.evaluation.error && log.evaluation.overallScore
    );

    const totalEvaluations = filteredLogs.length;
    const successfulCount = successfulEvaluations.length;

    // Calculate average scores
    const averageScores = {};
    if (successfulCount > 0) {
      const scoreFields = [
        "contentQuality",
        "writingStyle",
        "creativity",
        "emotionalImpact",
      ];

      scoreFields.forEach((field) => {
        const scores = successfulEvaluations
          .map((log) => log.evaluation[field]?.score)
          .filter((score) => typeof score === "number");

        averageScores[field] =
          scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;
      });

      const overallScores = successfulEvaluations
        .map((log) => log.evaluation.overallScore)
        .filter((score) => typeof score === "number");

      averageScores.overall =
        overallScores.length > 0
          ? overallScores.reduce((sum, score) => sum + score, 0) /
            overallScores.length
          : 0;
    }

    // Calculate performance statistics
    const performanceStats = {};
    if (filteredLogs.length > 0) {
      const timeToFirstTokens = filteredLogs
        .map((log) => log.performance.timeToFirstToken)
        .filter((t) => t);
      const totalTimes = filteredLogs
        .map((log) => log.performance.totalTime)
        .filter((t) => t);
      const evaluationTimes = filteredLogs
        .map((log) => log.performance.evaluationTime)
        .filter((t) => t);

      performanceStats.averageTimeToFirstToken =
        timeToFirstTokens.length > 0
          ? timeToFirstTokens.reduce((sum, time) => sum + time, 0) /
            timeToFirstTokens.length
          : 0;

      performanceStats.averageTotalTime =
        totalTimes.length > 0
          ? totalTimes.reduce((sum, time) => sum + time, 0) / totalTimes.length
          : 0;

      performanceStats.averageEvaluationTime =
        evaluationTimes.length > 0
          ? evaluationTimes.reduce((sum, time) => sum + time, 0) /
            evaluationTimes.length
          : 0;
    }

    // Calculate token usage statistics
    const tokenStats = {};
    const logsWithTokens = filteredLogs.filter(
      (log) => log.tokenUsage && log.tokenUsage.total
    );
    if (logsWithTokens.length > 0) {
      const totalPromptTokens = logsWithTokens.reduce(
        (sum, log) => sum + (log.tokenUsage.total.prompt_tokens || 0),
        0
      );
      const totalCompletionTokens = logsWithTokens.reduce(
        (sum, log) => sum + (log.tokenUsage.total.completion_tokens || 0),
        0
      );
      const totalTokens = logsWithTokens.reduce(
        (sum, log) => sum + (log.tokenUsage.total.total_tokens || 0),
        0
      );

      tokenStats.averagePromptTokens =
        totalPromptTokens / logsWithTokens.length;
      tokenStats.averageCompletionTokens =
        totalCompletionTokens / logsWithTokens.length;
      tokenStats.averageTotalTokens = totalTokens / logsWithTokens.length;
      tokenStats.totalPromptTokens = totalPromptTokens;
      tokenStats.totalCompletionTokens = totalCompletionTokens;
      tokenStats.totalTokensUsed = totalTokens;

      // Calculate story vs evaluation token breakdown
      const storyTokens = logsWithTokens.filter((log) => log.tokenUsage.story);
      const evaluationTokens = logsWithTokens.filter(
        (log) => log.tokenUsage.evaluation
      );

      if (storyTokens.length > 0) {
        tokenStats.averageStoryTokens =
          storyTokens.reduce(
            (sum, log) => sum + (log.tokenUsage.story.total_tokens || 0),
            0
          ) / storyTokens.length;
      }

      if (evaluationTokens.length > 0) {
        tokenStats.averageEvaluationTokens =
          evaluationTokens.reduce(
            (sum, log) => sum + (log.tokenUsage.evaluation.total_tokens || 0),
            0
          ) / evaluationTokens.length;
      }
    }

    // Calculate cost statistics
    const costStats = {};
    const logsWithCosts = filteredLogs.filter((log) => log.costs);
    if (logsWithCosts.length > 0) {
      // Total costs
      const totalCosts = logsWithCosts.reduce(
        (sum, log) => sum + (log.costs.total.totalCost || 0),
        0
      );
      const totalStoryCosts = logsWithCosts.reduce(
        (sum, log) => sum + (log.costs.story.totalCost || 0),
        0
      );
      const totalEvaluationCosts = logsWithCosts.reduce(
        (sum, log) => sum + (log.costs.evaluation.totalCost || 0),
        0
      );

      // Average costs
      costStats.averageTotalCost = totalCosts / logsWithCosts.length;
      costStats.averageStoryCost = totalStoryCosts / logsWithCosts.length;
      costStats.averageEvaluationCost =
        totalEvaluationCosts / logsWithCosts.length;

      // Cumulative costs
      costStats.totalCosts = totalCosts;
      costStats.totalStoryCosts = totalStoryCosts;
      costStats.totalEvaluationCosts = totalEvaluationCosts;

      // Cost efficiency metrics
      const logsWithEfficiency = logsWithCosts.filter(
        (log) => log.costEfficiency
      );
      if (logsWithEfficiency.length > 0) {
        costStats.averageCostPerCharacter =
          logsWithEfficiency.reduce(
            (sum, log) => sum + (log.costEfficiency.costPerCharacter || 0),
            0
          ) / logsWithEfficiency.length;

        costStats.averageCostPerWord =
          logsWithEfficiency.reduce(
            (sum, log) => sum + (log.costEfficiency.costPerWord || 0),
            0
          ) / logsWithEfficiency.length;

        costStats.averageCostPerQualityPoint =
          logsWithEfficiency.reduce(
            (sum, log) => sum + (log.costEfficiency.costPerQualityPoint || 0),
            0
          ) / logsWithEfficiency.length;

        costStats.averageQualityPerDollar =
          logsWithEfficiency.reduce(
            (sum, log) => sum + (log.costEfficiency.qualityPerDollar || 0),
            0
          ) / logsWithEfficiency.length;
      }

      // Breakdown by input vs output costs
      const totalInputCosts = logsWithCosts.reduce(
        (sum, log) => sum + (log.costs.total.inputCost || 0),
        0
      );
      const totalOutputCosts = logsWithCosts.reduce(
        (sum, log) => sum + (log.costs.total.outputCost || 0),
        0
      );

      costStats.averageInputCost = totalInputCosts / logsWithCosts.length;
      costStats.averageOutputCost = totalOutputCosts / logsWithCosts.length;
      costStats.totalInputCosts = totalInputCosts;
      costStats.totalOutputCosts = totalOutputCosts;
    }

    // Get recent evaluations (last 10)
    const recentEvaluations = filteredLogs.slice(-10).reverse();

    // Filter model breakdown to only include story models (exclude evaluation/judge models)
    const storyModelBreakdown = {};
    Object.entries(modelBreakdown).forEach(([model, data]) => {
      if (data.type === "story") {
        storyModelBreakdown[model] = data;
      }
    });

    // sort story models by overall score
    const sortedStoryModels = Object.entries(storyModelBreakdown).sort(
      ([, a], [, b]) =>
        (b.averageScores.overall || 0) - (a.averageScores.overall || 0)
    );
    const sortedStoryModelBreakdown = {};
    sortedStoryModels.forEach(([model, data]) => {
      sortedStoryModelBreakdown[model] = data;
    });

    return {
      totalEvaluations,
      successfulEvaluations: successfulCount,
      failedEvaluations: totalEvaluations - successfulCount,
      averageScores,
      performanceStats,
      tokenStats,
      costStats,
      recentEvaluations,
      modelBreakdown: sortedStoryModelBreakdown,
      appliedFilter: modelFilter,
    };
  } catch (error) {
    console.error("Error in getEvaluationStats:", error);
    return {
      totalEvaluations: 0,
      averageScores: {},
      performanceStats: {},
      tokenStats: {},
      costStats: {},
      recentEvaluations: [],
      modelBreakdown: {},
      appliedFilter: modelFilter,
    };
  }
}

// Generate a simple ID for log entries
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
