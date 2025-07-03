import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(
  "OpenAI client initialized with API key:",
  process.env.OPENAI_API_KEY ? "Yes" : "No"
);

export const generateStream = async () => {
  const stream = await client.responses.create({
    model: "gpt-4.1",
    input: "Write a one-sentence bedtime story about a unicorn.",
    stream: true,
  });
  return stream;
};
