import fs from "node:fs";
import dotenv from "dotenv";
dotenv.config();
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import express from "express";
import { generateStream } from "./llm.js"; // Ensure this path is correct
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
    const stream = await generateStream();
    for await (const chunk of stream) {
      switch (chunk.type) {
        case "response.created":
          timeToFirstToken = Date.now() - startTime;
          break;
        case "response.output_text.delta":
          res.write(chunk.delta);
          break;
        case "response.error":
          console.error("Error in response:", chunk.error);
          res.write("Error: " + chunk.error + "\n");
          break;
      }
    }
    const elapsedTime = Date.now() - startTime;
    res.end();
    console.log({
      endpoint: "/llm",
      timeToFirstToken: `${timeToFirstToken} ms`,
      totalTime: `${elapsedTime} ms`,
    });
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).end("Error generating text");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
  console.log(`Try: http://localhost:${PORT}/stream`);
  console.log(`Try: http://localhost:${PORT}/llm`);
});
