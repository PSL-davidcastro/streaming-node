import fs from "node:fs/promises";
import path from "node:path";

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
export async function logEvaluation(evaluationData, performanceStats, story) {
  await ensureLogsDir();

  const logEntry = {
    timestamp: new Date().toISOString(),
    id: generateId(),
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
export async function getEvaluationStats() {
  const logs = await getEvaluationLogs();

  if (logs.length === 0) {
    return {
      totalEvaluations: 0,
      averageScores: {},
      performanceStats: {},
      recentEvaluations: [],
    };
  }

  // Filter out failed evaluations for score calculations
  const successfulEvaluations = logs.filter(
    (log) =>
      log.evaluation && !log.evaluation.error && log.evaluation.overallScore
  );

  const totalEvaluations = logs.length;
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
  if (logs.length > 0) {
    const timeToFirstTokens = logs
      .map((log) => log.performance.timeToFirstToken)
      .filter((t) => t);
    const totalTimes = logs
      .map((log) => log.performance.totalTime)
      .filter((t) => t);
    const evaluationTimes = logs
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
  const logsWithTokens = logs.filter(
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

    tokenStats.averagePromptTokens = totalPromptTokens / logsWithTokens.length;
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

  // Get recent evaluations (last 10)
  const recentEvaluations = logs.slice(-10).reverse();

  return {
    totalEvaluations,
    successfulEvaluations: successfulCount,
    failedEvaluations: totalEvaluations - successfulCount,
    averageScores,
    performanceStats,
    tokenStats,
    recentEvaluations,
  };
}

// Generate a simple ID for log entries
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
