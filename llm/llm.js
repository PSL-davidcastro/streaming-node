import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import prompts from "./prompts.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model used for story generation
const STORY_MODEL = "o4-mini-2025-04-16";

export const generateStream = async () => {
  const stream = await client.chat.completions.create({
    model: STORY_MODEL,
    messages: [
      {
        role: "user",
        content: prompts.longStory,
      },
    ],
    stream: true,
    stream_options: { include_usage: true },
  });
  return stream;
};

export const getStoryModel = () => STORY_MODEL;
