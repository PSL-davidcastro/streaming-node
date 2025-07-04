const prompts = {
  longStory: `Generate a profoundly moving, multi-paragraph short story (approximately 300-500 words) about a lone astronaut, Anya Sharma, whose deep-seated dreams of cosmic exploration have been brutally shattered, leaving her stranded and isolated on a newly discovered exoplanet. The narrative should intimately explore her raw, initial struggles for survival – the gnawing fear, the desperate search for solace amidst the alien vastness, and the agonizing realization of her profound solitude.

Weave in vivid, almost sentient descriptions of the unique alien flora and fauna she encounters. These encounters should not just be observations, but visceral experiences that stir her weary soul – perhaps a bioluminescent plant that mirrors her fading hope, or a creature whose mournful cry echoes her own silent despair.

The core of the story must revolve around a pivotal moment of discovery – not just a scientific breakthrough, but a deeply personal epiphany that fundamentally shifts her perspective. This moment should be a fragile spark in the overwhelming darkness, a revelation that reawakens her dormant sense of wonder and injects a tenuous, yet potent, thread of hope into her bleak existence.

Infuse the story with overwhelming feelings of aching isolation, a fragile, almost ethereal sense of wonder at the alien beauty, and the defiant resilience of the human spirit clinging to the faintest flicker of hope. Ensure the story has a clear, emotionally resonant beginning that plunges the reader into Anya's despair, a middle that builds tension and explores her internal landscape, and a hopeful, yet poignantly open-ended, conclusion that leaves the reader with a lingering sense of possibility and the echoes of her newfound resolve. Describe at least three distinct alien species or plant types, ensuring their descriptions evoke a strong emotional response.`,
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
