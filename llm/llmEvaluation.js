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

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompts.evaluateLongStorySystemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.3,
    });

    const evaluationText = response.choices[0].message.content;

    // Try to parse as JSON, fallback to text if parsing fails
    try {
      return JSON.parse(evaluationText);
    } catch (parseError) {
      console.warn("Failed to parse evaluation as JSON, returning as text");
      return {
        error: "Failed to parse evaluation",
        rawResponse: evaluationText,
      };
    }
  } catch (error) {
    console.error("Error generating evaluation:", error);
    throw error;
  }
};
