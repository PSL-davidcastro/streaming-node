import fs from "node:fs";
import dotenv from "dotenv";
dotenv.config();
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import express from "express";
import { generateStream, getStoryModel } from "./llm/llm.js"; // Ensure this path is correct
import { generateEvaluation, getEvaluationModel } from "./llm/llmEvaluation.js"; // Ensure this path is correct
import prompts from "./llm/prompts.js"; // Import prompts for complexity levels
import {
  logEvaluation,
  getEvaluationStats,
  getEvaluationLogs,
} from "./llm/evaluationLogger.js";
import { calculateTotalCosts, formatCost } from "./llm/costCalculator.js";
import { time } from "node:console";

const delayMs = 500;

const delay = new Transform({
  transform(chunk, enc, cb) {
    setTimeout(() => cb(null, chunk), delayMs);
  },
});

const upper = new Transform({
  transform(chunk, enc, cb) {
    this.push("[STREAM] " + chunk.toString().toUpperCase() + "\n");
    cb();
  },
});

const app = express();

app.get("/stream", async (req, res) => {
  const readStream = fs.createReadStream(import.meta.filename, {
    highWaterMark: 5,
  });
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  try {
    await pipeline(readStream, delay, upper, res, { end: true });
  } catch (err) {
    res.status(500).end("Pipeline error: " + err.message);
  }
});

app.get("/llm", async (req, res) => {
  try {
    // Get the selected model and complexity from query parameters
    const selectedModel = req.query.model || "o4-mini-2025-04-16";
    const promptComplexity = req.query.promptComplexity || "complex";
    const evaluationComplexity = req.query.evaluationComplexity || "complex";

    console.log(`Using model: ${selectedModel} for story generation`);
    console.log(`Using prompt complexity: ${promptComplexity}`);
    console.log(`Using evaluation complexity: ${evaluationComplexity}`);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    const startTime = Date.now();
    let timeToFirstToken = 0;
    let output = "";
    let storyTokenUsage = null;

    try {
      const stream = await generateStream(selectedModel, promptComplexity);
      for await (const chunk of stream) {
        if (timeToFirstToken === 0) {
          timeToFirstToken = Date.now() - startTime;
        }

        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          res.write(content);
          output += content;
        }

        // Capture token usage from the final chunk
        if (chunk.usage) {
          storyTokenUsage = chunk.usage;
        }
      }
    } catch (modelError) {
      console.error("Error with model:", selectedModel, modelError);
      res
        .status(400)
        .end(`Error with model "${selectedModel}": ${modelError.message}`);
      return;
    }
    const stats = {
      timeToFirstToken: timeToFirstToken,
      totalTime: Date.now() - startTime,
      storyTokenUsage: storyTokenUsage,
    };

    // Generate evaluation
    console.log("Starting evaluation...");
    const evaluationStartTime = Date.now();
    let evaluation = null;
    try {
      evaluation = await generateEvaluation(output, evaluationComplexity);
      console.log(
        "Evaluation completed in",
        Date.now() - evaluationStartTime,
        "ms"
      );
    } catch (evalError) {
      console.error("Evaluation failed:", evalError);
      evaluation = { error: "Evaluation failed", message: evalError.message };
    }

    const finalStats = {
      ...stats,
      evaluationTime: Date.now() - evaluationStartTime,
      evaluation: evaluation,
      evaluationTokenUsage: evaluation?.tokenUsage || null,
    };

    // Calculate cost information
    const costBreakdown = calculateTotalCosts(
      selectedModel,
      storyTokenUsage,
      getEvaluationModel(),
      evaluation?.tokenUsage || null
    );

    // Add cost information to final stats
    finalStats.costs = costBreakdown;

    // Log evaluation data for performance tracking
    try {
      const modelInfo = {
        storyModel: selectedModel,
        evaluationModel: getEvaluationModel(),
      };
      const complexityInfo = {
        promptComplexity: promptComplexity,
        evaluationComplexity: evaluationComplexity,
      };
      await logEvaluation(
        evaluation,
        finalStats,
        output,
        modelInfo,
        complexityInfo
      );
    } catch (logError) {
      console.error("Failed to log evaluation:", logError);
      // Don't fail the request if logging fails
    }

    // Send stats and evaluation as a final chunk with a marker
    res.write(`\n---STATS---\n${JSON.stringify(finalStats)}`);
    res.end();
    const elapsedTime = Date.now() - startTime;
    console.log({
      endpoint: "/llm",
      selectedModel: selectedModel,
      timeToFirstToken: `${timeToFirstToken} ms`,
      totalTime: `${elapsedTime} ms`,
      evaluationTime: `${Date.now() - evaluationStartTime} ms`,
      evaluation,
    });
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).end("Error generating text");
  }
});

// API endpoint to get evaluation statistics
app.get("/api/evaluation-stats", async (req, res) => {
  try {
    console.log("API endpoint called: /api/evaluation-stats");
    const modelFilter = req.query.model || null;
    console.log("Model filter:", modelFilter);
    const stats = await getEvaluationStats(modelFilter);
    console.log("Stats retrieved:", stats ? "success" : "null");
    console.log("Stats keys:", Object.keys(stats || {}));
    res.json(stats);
  } catch (error) {
    console.error("Error fetching evaluation stats:", error);
    res.status(500).json({ error: "Failed to fetch evaluation statistics" });
  }
});

// API endpoint to get available models
app.get("/api/models", async (req, res) => {
  try {
    const logs = await getEvaluationLogs();
    const storyModels = new Set();

    logs.forEach((log) => {
      if (log.models && log.models.storyModel) {
        storyModels.add(log.models.storyModel);
      }
    });

    // Add current story model even if not in logs yet
    storyModels.add(getStoryModel());

    res.json({
      currentModels: {
        story: getStoryModel(),
        evaluation: getEvaluationModel(),
      },
      availableModels: Array.from(storyModels).filter(
        (model) => model !== "unknown"
      ),
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ error: "Failed to fetch models" });
  }
});

// API endpoint to get available prompt complexities
app.get("/api/prompt-complexities", async (req, res) => {
  try {
    const complexities = prompts.getAvailableComplexities();
    res.json(complexities);
  } catch (error) {
    console.error("Error fetching prompt complexities:", error);
    res.status(500).json({ error: "Failed to fetch prompt complexities" });
  }
});

// server static frontend files
app.use(express.static("frontend"));
// Serve the index.html file for the root path
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "frontend" });
});

// Serve the stats dashboard
app.get("/stats", (req, res) => {
  res.sendFile("stats.html", { root: "frontend" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
  console.log(`Try: http://localhost:${PORT}/stream`);
  console.log(`Try: http://localhost:${PORT}/llm`);
  console.log(`Try: http://localhost:${PORT}/`); // For the frontend
  console.log(`Try: http://localhost:${PORT}/stats`); // For the stats dashboard
});
