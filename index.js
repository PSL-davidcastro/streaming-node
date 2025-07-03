import fs from "node:fs";
import dotenv from "dotenv";
dotenv.config();
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import express from "express";
import { generateText } from "./llm.js"; // Ensure this path is correct

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
  const output = await generateText();
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(output);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
  console.log(`Try: http://localhost:${PORT}/stream`);
  console.log(`Try: http://localhost:${PORT}/llm`);
});
