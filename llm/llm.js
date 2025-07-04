import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import prompts from "./prompts.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model used for story generation (default)
const DEFAULT_STORY_MODEL = "o4-mini-2025-04-16";

export const generateStream = async (
  model = DEFAULT_STORY_MODEL,
  promptComplexity = "complex"
) => {
  const stream = await client.chat.completions.create({
    model: model,
    messages: [
      {
        role: "user",
        content: prompts.getStoryPrompt(promptComplexity),
      },
    ],
    stream: true,
    stream_options: { include_usage: true },
    temperature: 1,
  });
  return stream;
};

export const getStoryModel = () => DEFAULT_STORY_MODEL;
