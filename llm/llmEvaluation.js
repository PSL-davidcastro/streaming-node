import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import prompts from "./prompts.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateEvaluation = async (story) => {
  console.log("Generating evaluation for the story...");
  if (!story || typeof story !== "string") {
    throw new Error("Invalid story input. Please provide a valid string.");
  }
  const userPrompt = prompts.evaluateLongStoryUserPrompt.replace(
    "{{story}}",
    story
  );
  const systemPrompt = prompts.evaluateLongStorySystemPrompt;
  const evaluation = await client.responses.create({
    model: "gpt-4.1",
    instructions: systemPrompt,
    input: userPrompt,
  });
  return evaluation;
};
