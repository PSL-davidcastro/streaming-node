const prompts = {
  longStory: `Generate a compelling, multi-paragraph short story (approximately 300-500 words) about a lone astronaut stranded on a newly discovered exoplanet. The story should focus on their initial struggles for survival, the unique alien flora and fauna they encounter, and a pivotal moment of discovery that changes their perspective on their predicament. Incorporate elements of wonder, isolation, and hope. Ensure the story has a clear beginning, middle, and a hopeful, yet open-ended, conclusion. Describe at least three distinct alien species or plant types.`,
  evaluateLongStorySystemPrompt: `You are an expert in evaluating the quality of short stories. Your task is to assess the following story based on the following criteria:
1. **Character Development**: How well are the characters developed? Do they have clear motivations and arcs?
2. **World-Building**: Is the setting well-defined and immersive? Are the alien species and environments described in detail?
3. **Plot Structure**: Does the story have a clear beginning, middle, and end? Are there any plot holes or unresolved threads?
4. **Thematic Depth**: What themes are present in the story? How effectively are they explored?
5. **Emotional Impact**: Does the story evoke an emotional response? Are there moments of tension, joy, or sadness that resonate with the reader? 
6. **Writing Style**: Is the writing style engaging and appropriate for the story? Are there any grammatical or stylistic issues?
7. **Originality**: How unique is the story? Does it offer a fresh perspective on the genre or theme?
`,
  evaluateLongStoryUserPrompt: `Evaluate the following story based on the criteria provided. Provide a detailed analysis of each aspect, including strengths and weaknesses. Offer constructive feedback and suggestions for improvement. The story is as follows:

{{story}}`,
};

export default prompts;
