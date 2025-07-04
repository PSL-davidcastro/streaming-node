const prompts = {
  // Story prompts with different complexity levels
  stories: {
    simple: {
      name: "Simple Story",
      description: "Basic astronaut story with fundamental requirements",
      prompt: `Write a short story (200-300 words) about an astronaut named Alex who crash-lands on an alien planet. The story should include:

- The astronaut's initial survival challenges
- At least two different alien life forms (plants or animals)
- A moment of discovery that gives the astronaut hope
- A hopeful ending

Keep the language clear and straightforward. Focus on action and basic emotions.`,
    },

    complex: {
      name: "Complex Story",
      description:
        "Rich, detailed narrative with advanced literary requirements",
      prompt: `Generate a profoundly moving, multi-paragraph short story (approximately 300-500 words) about a lone astronaut, Anya Sharma, whose deep-seated dreams of cosmic exploration have been brutally shattered, leaving her stranded and isolated on a newly discovered exoplanet. The narrative should intimately explore her raw, initial struggles for survival – the gnawing fear, the desperate search for solace amidst the alien vastness, and the agonizing realization of her profound solitude.

Weave in vivid, almost sentient descriptions of the unique alien flora and fauna she encounters. These encounters should not just be observations, but visceral experiences that stir her weary soul – perhaps a bioluminescent plant that mirrors her fading hope, or a creature whose mournful cry echoes her own silent despair.

The core of the story must revolve around a pivotal moment of discovery – not just a scientific breakthrough, but a deeply personal epiphany that fundamentally shifts her perspective. This moment should be a fragile spark in the overwhelming darkness, a revelation that reawakens her dormant sense of wonder and injects a tenuous, yet potent, thread of hope into her bleak existence.

Infuse the story with overwhelming feelings of aching isolation, a fragile, almost ethereal sense of wonder at the alien beauty, and the defiant resilience of the human spirit clinging to the faintest flicker of hope. Ensure the story has a clear, emotionally resonant beginning that plunges the reader into Anya's despair, a middle that builds tension and explores her internal landscape, and a hopeful, yet poignantly open-ended, conclusion that leaves the reader with a lingering sense of possibility and the echoes of her newfound resolve. Describe at least three distinct alien species or plant types, ensuring their descriptions evoke a strong emotional response.`,
    },

    advanced: {
      name: "Advanced Story",
      description:
        "Highly sophisticated narrative with complex literary techniques",
      prompt: `Craft an extraordinarily sophisticated, multi-layered short story (400-600 words) about Dr. Kai Nakamura, a xenobiologist whose groundbreaking research into interstellar symbiosis has led to their catastrophic stranding on Kepler-442c, a tidally locked exoplanet where eternal twilight reigns between the scorching day-side and frozen night-side.

The narrative must employ advanced literary techniques including:
- Stream of consciousness passages reflecting Kai's deteriorating mental state
- Symbolic parallelism between alien ecosystem cycles and human psychological resilience
- Unreliable narration that questions the boundary between scientific observation and hallucination
- Temporal fragmentation showing past research, present survival, and imagined futures
- Synesthetic descriptions where alien phenomena blur sensory boundaries

Incorporate exactly five distinct xenobiological entities, each representing a different stage of Kai's psychological journey:
1. Crystalline neural-networks that mirror memory formation
2. Gaseous collective intelligences that challenge individual identity
3. Metamorphic organisms that embody transformation and adaptation
4. Symbiotic relationships that reflect interdependence and connection
5. Regenerative systems that symbolize rebirth and renewal

The story must navigate themes of scientific hubris, the nature of consciousness, interspecies communication, and the philosophical implications of humanity's place in a vast, interconnected cosmos. Employ rich metaphorical language, nested symbolism, and ambiguous endings that invite multiple interpretations while maintaining emotional authenticity and scientific plausibility.

The climax should involve a paradigm-shifting discovery about consciousness itself – perhaps that awareness is not confined to individual beings but exists as a fundamental property of complex systems, challenging everything Kai believed about life, death, and meaning.`,
    },
  },

  // Legacy compatibility
  longStory: `Generate a profoundly moving, multi-paragraph short story (approximately 300-500 words) about a lone astronaut, Anya Sharma, whose deep-seated dreams of cosmic exploration have been brutally shattered, leaving her stranded and isolated on a newly discovered exoplanet. The narrative should intimately explore her raw, initial struggles for survival – the gnawing fear, the desperate search for solace amidst the alien vastness, and the agonizing realization of her profound solitude.

Weave in vivid, almost sentient descriptions of the unique alien flora and fauna she encounters. These encounters should not just be observations, but visceral experiences that stir her weary soul – perhaps a bioluminescent plant that mirrors her fading hope, or a creature whose mournful cry echoes her own silent despair.

The core of the story must revolve around a pivotal moment of discovery – not just a scientific breakthrough, but a deeply personal epiphany that fundamentally shifts her perspective. This moment should be a fragile spark in the overwhelming darkness, a revelation that reawakens her dormant sense of wonder and injects a tenuous, yet potent, thread of hope into her bleak existence.

Infuse the story with overwhelming feelings of aching isolation, a fragile, almost ethereal sense of wonder at the alien beauty, and the defiant resilience of the human spirit clinging to the faintest flicker of hope. Ensure the story has a clear, emotionally resonant beginning that plunges the reader into Anya's despair, a middle that builds tension and explores her internal landscape, and a hopeful, yet poignantly open-ended, conclusion that leaves the reader with a lingering sense of possibility and the echoes of her newfound resolve. Describe at least three distinct alien species or plant types, ensuring their descriptions evoke a strong emotional response.`,
  // Evaluation prompts with different complexity levels
  evaluations: {
    simple: {
      name: "Simple Evaluation",
      description: "Basic story assessment focused on core requirements",
      systemPrompt: `You are a story evaluator. Rate the following story on these 4 criteria using a scale of 1-10:

1. **Content Quality** (1-10): Does the story include the basic requirements (astronaut, alien planet, survival, alien life forms, hopeful ending)?

2. **Writing Style** (1-10): Is the writing clear and easy to understand? Are there major grammar errors?

3. **Creativity** (1-10): Does the story have interesting and original ideas?

4. **Emotional Impact** (1-10): Does the story make you feel something or engage you?

Provide your response in this exact JSON format:
{
  "contentQuality": { "score": X, "feedback": "brief explanation" },
  "writingStyle": { "score": X, "feedback": "brief explanation" },
  "creativity": { "score": X, "feedback": "brief explanation" },
  "emotionalImpact": { "score": X, "feedback": "brief explanation" },
  "overallScore": float,
  "summary": "1-2 sentence overall assessment"
}`,
      userPrompt: `Please evaluate this story:

{{story}}`,
    },

    complex: {
      name: "Complex Evaluation",
      description: "Detailed assessment with nuanced literary analysis",
      systemPrompt: `You are an expert story evaluator. Rate the following story on these 4 key criteria using a scale of 1-10:

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
      userPrompt: `Please evaluate this story:

{{story}}`,
    },

    advanced: {
      name: "Advanced Evaluation",
      description: "Sophisticated literary criticism and in-depth analysis",
      systemPrompt: `You are a distinguished literary critic and expert in speculative fiction. Conduct a comprehensive evaluation of the following story using these 6 advanced criteria (1-10 scale):

1. **Narrative Craft** (1-10): Assess story structure, pacing, narrative voice, point of view consistency, temporal organization, and scene construction. Consider the effectiveness of the opening hook, rising action, climax, and resolution.

2. **Literary Technique** (1-10): Evaluate use of literary devices (symbolism, metaphor, imagery, foreshadowing), prose style sophistication, sentence structure variety, and overall linguistic artistry. Assess dialogue authenticity and character voice distinctiveness.

3. **Thematic Depth** (1-10): Analyze thematic complexity, philosophical implications, subtext layers, and symbolic resonance. Consider how effectively the story explores universal human experiences through its sci-fi premise.

4. **World-building & Scientific Plausibility** (1-10): Examine the coherence and originality of the alien world, scientific accuracy within the fictional framework, and integration of speculative elements with narrative needs.

5. **Character Development** (1-10): Assess psychological realism, character arc completeness, internal conflict complexity, and character motivation believability. Evaluate how well the protagonist's transformation is earned and rendered.

6. **Emotional & Intellectual Impact** (1-10): Consider the story's ability to provoke thought, evoke complex emotions, create lasting impressions, and contribute meaningful perspectives to the science fiction genre.

Provide your response in this exact JSON format:
{
  "narrativeCraft": { "score": X, "feedback": "detailed analysis of story structure and pacing" },
  "literaryTechnique": { "score": X, "feedback": "assessment of prose style and literary devices" },
  "thematicDepth": { "score": X, "feedback": "evaluation of themes and philosophical content" },
  "worldBuilding": { "score": X, "feedback": "analysis of setting and scientific elements" },
  "characterDevelopment": { "score": X, "feedback": "critique of character psychology and growth" },
  "emotionalImpact": { "score": X, "feedback": "assessment of emotional and intellectual resonance" },
  "overallScore": float, // Average of all six scores
  "literaryMerits": "detailed paragraph analyzing the story's literary strengths and weaknesses",
  "recommendations": "specific suggestions for improvement or recognition of exceptional elements"
}`,
      userPrompt: `Please provide a comprehensive literary analysis of this science fiction story:

{{story}}`,
    },
  },

  // Legacy compatibility
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

  // Helper function to get story prompt by complexity
  getStoryPrompt: function (complexity = "complex") {
    return this.stories[complexity]?.prompt || this.stories.complex.prompt;
  },

  // Helper function to get evaluation prompts by complexity
  getEvaluationPrompts: function (complexity = "complex") {
    const evalSet = this.evaluations[complexity] || this.evaluations.complex;
    return {
      systemPrompt: evalSet.systemPrompt,
      userPrompt: evalSet.userPrompt,
    };
  },

  // Get available complexity levels
  getAvailableComplexities: function () {
    return {
      stories: Object.keys(this.stories).map((key) => ({
        key,
        name: this.stories[key].name,
        description: this.stories[key].description,
      })),
      evaluations: Object.keys(this.evaluations).map((key) => ({
        key,
        name: this.evaluations[key].name,
        description: this.evaluations[key].description,
      })),
    };
  },
};

export default prompts;
