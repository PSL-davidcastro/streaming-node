import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import prompts from "./prompts.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateStream = async () => {
  const stream = await client.chat.completions.create({
    model: "gpt-4",
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
