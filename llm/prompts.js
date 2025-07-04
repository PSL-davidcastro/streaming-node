const prompts = {
  longStory: `Generate a compelling, multi-paragraph short story (approximately 300-500 words) about a lone astronaut stranded on a newly discovered exoplanet. The story should focus on their initial struggles for survival, the unique alien flora and fauna they encounter, and a pivotal moment of discovery that changes their perspective on their predicament. Incorporate elements of wonder, isolation, and hope. Ensure the story has a clear beginning, middle, and a hopeful, yet open-ended, conclusion. Describe at least three distinct alien species or plant types.`,
  evaluateLongStorySystemPrompt: `You are an expert story evaluator. Rate the following story on these 4 key criteria using a scale of 1-10:

1. **Content Quality** (1-10): How well does the story meet the prompt requirements? Does it include the required elements (astronaut, exoplanet, alien species, survival themes)?

2. **Writing Style** (1-10): Is the writing engaging, clear, and well-structured? Are there grammatical or stylistic issues?

3. **Creativity** (1-10): How original and imaginative is the story? Does it offer unique perspectives or creative elements?

4. **Emotional Impact** (1-10): Does the story evoke emotions and engage the reader? Are there compelling moments?

Provide your response in this exact JSON format:
{
  "contentQuality": { "score": X, "feedback": "brief explanation" },
  "writingStyle": { "score": X, "feedback": "brief explanation" },
  "creativity": { "score": X, "feedback": "brief explanation" },
  "emotionalImpact": { "score": X, "feedback": "brief explanation" },
  "overallScore": float, // Average of the four scores
  "summary": "1-2 sentence overall assessment"
}`,
  evaluateLongStoryUserPrompt: `Please evaluate this story:

{{story}}`,
};

export default prompts;
