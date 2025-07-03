import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import prompts from "./prompts.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateStream = async () => {
  const stream = await client.responses.create({
    model: "gpt-4.1",
    input: prompts.longStory,
    stream: true,
  });
  return stream;
};
