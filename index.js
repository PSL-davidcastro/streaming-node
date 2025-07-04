import fs from "node:fs";
import dotenv from "dotenv";
dotenv.config();
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import express from "express";
import { generateStream } from "./llm/llm.js"; // Ensure this path is correct
import { generateEvaluation } from "./llm/llmEvaluation.js"; // Ensure this path is correct
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
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    const startTime = Date.now();
    let timeToFirstToken = 0;
    let output = "";
    const stream = await generateStream();
    for await (const chunk of stream) {
      if (timeToFirstToken === 0) {
        timeToFirstToken = Date.now() - startTime;
      }

      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        res.write(content);
        output += content;
      }
    }
    const stats = {
      timeToFirstToken: timeToFirstToken,
      totalTime: Date.now() - startTime,
    };

    // Generate evaluation
    console.log("Starting evaluation...");
    const evaluationStartTime = Date.now();
    let evaluation = null;
    try {
      evaluation = await generateEvaluation(output);
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
    };

    // Send stats and evaluation as a final chunk with a marker
    res.write(`\n---STATS---\n${JSON.stringify(finalStats)}`);
    res.end();
    const elapsedTime = Date.now() - startTime;
    console.log({
      endpoint: "/llm",
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

// server static frontend files
app.use(express.static("frontend"));
// Serve the index.html file for the root path
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "frontend" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
  console.log(`Try: http://localhost:${PORT}/stream`);
  console.log(`Try: http://localhost:${PORT}/llm`);
  console.log(`Try: http://localhost:${PORT}/`); // For the frontend
});
