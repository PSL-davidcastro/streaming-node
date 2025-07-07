const btn = document.getElementById("fetchBtn");
const output = document.getElementById("output");
const statsDiv = document.getElementById("stats");
const evaluationDiv = document.getElementById("evaluation");
const criteriaDiv = document.getElementById("criteria");
const overallScoreDiv = document.getElementById("overallScore");
const summaryDiv = document.getElementById("summary");
const modelSelect = document.getElementById("modelSelect");
const promptComplexitySelect = document.getElementById(
  "promptComplexitySelect"
);
const evaluationComplexitySelect = document.getElementById(
  "evaluationComplexitySelect"
);
const promptDescriptionDiv = document.getElementById("promptDescription");
const evaluationDescriptionDiv = document.getElementById(
  "evaluationDescription"
);

let complexitiesData = null;

// Load complexity options and descriptions
async function loadComplexities() {
  try {
    const response = await fetch("/api/prompt-complexities");
    complexitiesData = await response.json();

    // Update the description when selection changes
    updatePromptDescription();
    updateEvaluationDescription();
  } catch (error) {
    console.error("Failed to load complexities:", error);
  }
}

function updatePromptDescription() {
  if (!complexitiesData) return;
  const selectedKey = promptComplexitySelect.value;
  const complexity = complexitiesData.stories.find(
    (c) => c.key === selectedKey
  );
  if (complexity) {
    promptDescriptionDiv.textContent = complexity.description;
  }
}

function updateEvaluationDescription() {
  if (!complexitiesData) return;
  const selectedKey = evaluationComplexitySelect.value;
  const complexity = complexitiesData.evaluations.find(
    (c) => c.key === selectedKey
  );
  if (complexity) {
    evaluationDescriptionDiv.textContent = complexity.description;
  }
}

// Add event listeners for complexity changes
promptComplexitySelect.addEventListener("change", updatePromptDescription);
evaluationComplexitySelect.addEventListener(
  "change",
  updateEvaluationDescription
);

// Load complexities on page load
loadComplexities();

function displayEvaluation(evaluation) {
  if (!evaluation || evaluation.error) {
    evaluationDiv.style.display = "none";
    return;
  }

  // Clear previous content
  criteriaDiv.innerHTML = "";

  // Handle different evaluation complexities
  let criteria = [];

  if (evaluation.narrativeCraft !== undefined) {
    // Advanced evaluation with 6 criteria
    criteria = [
      { key: "narrativeCraft", name: "Narrative Craft" },
      { key: "literaryTechnique", name: "Literary Technique" },
      { key: "thematicDepth", name: "Thematic Depth" },
      { key: "worldBuilding", name: "World Building" },
      { key: "characterDevelopment", name: "Character Development" },
      { key: "emotionalImpact", name: "Emotional Impact" },
    ];
  } else {
    // Standard 4-criteria evaluation (simple and complex)
    criteria = [
      { key: "contentQuality", name: "Content Quality" },
      { key: "writingStyle", name: "Writing Style" },
      { key: "creativity", name: "Creativity" },
      { key: "emotionalImpact", name: "Emotional Impact" },
    ];
  }

  // Display criteria scores
  criteria.forEach((criterion) => {
    if (evaluation[criterion.key]) {
      const div = document.createElement("div");
      div.className = "criterion";
      div.innerHTML = `
              <h4>${criterion.name}</h4>
              <div class="score">${evaluation[criterion.key].score}/10</div>
              <div class="feedback">${evaluation[criterion.key].feedback}</div>
            `;
      criteriaDiv.appendChild(div);
    }
  });

  // Display overall score and summary
  if (evaluation.overallScore) {
    overallScoreDiv.textContent = evaluation.overallScore;
  }

  // Handle different summary types
  if (evaluation.summary) {
    summaryDiv.textContent = evaluation.summary;
  } else if (evaluation.literaryMerits) {
    // Advanced evaluation has different fields
    summaryDiv.innerHTML = `
            <div style="margin-bottom: 8px;"><strong>Literary Analysis:</strong> ${
              evaluation.literaryMerits
            }</div>
            ${
              evaluation.recommendations
                ? `<div><strong>Recommendations:</strong> ${evaluation.recommendations}</div>`
                : ""
            }
          `;
  }

  evaluationDiv.style.display = "block";
}

btn.addEventListener("click", async () => {
  output.textContent = "";
  statsDiv.textContent = "";
  evaluationDiv.style.display = "none";
  btn.disabled = true;
  try {
    const selectedModel = modelSelect.value;
    const promptComplexity = promptComplexitySelect.value;
    const evaluationComplexity = evaluationComplexitySelect.value;

    const url = `/llm?model=${encodeURIComponent(
      selectedModel
    )}&promptComplexity=${encodeURIComponent(
      promptComplexity
    )}&evaluationComplexity=${encodeURIComponent(evaluationComplexity)}`;

    const response = await fetch(url);
    if (!response.ok || !response.body) {
      throw new Error("Failed to fetch LLM stream");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let buffer = "";
    while (!done) {
      const { value, done: streamDone } = await reader.read();
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        // Check for stats marker
        const marker = "\n---STATS---\n";
        const markerIdx = buffer.indexOf(marker);
        if (markerIdx !== -1) {
          // Output before marker is the main output
          output.textContent += buffer.slice(0, markerIdx);
          // After marker is the stats JSON
          const statsStr = buffer.slice(markerIdx + marker.length);
          try {
            const stats = JSON.parse(statsStr);
            let statsHtml = `<b>Model:</b> ${selectedModel}<br><b>Story Complexity:</b> ${promptComplexity}<br><b>Evaluation Complexity:</b> ${evaluationComplexity}<br><b>Stats:</b><br>Time to first token: <b>${stats.timeToFirstToken} ms</b><br>Total time: <b>${stats.totalTime} ms</b>`;
            if (stats.evaluationTime) {
              statsHtml += `<br>Evaluation time: <b>${stats.evaluationTime} ms</b>`;
            }

            // Add token usage information
            if (stats.storyTokenUsage) {
              statsHtml += `<br><b>Story Tokens:</b> ${
                stats.storyTokenUsage.total_tokens || "N/A"
              }`;
              if (
                stats.storyTokenUsage.prompt_tokens &&
                stats.storyTokenUsage.completion_tokens
              ) {
                statsHtml += ` (${stats.storyTokenUsage.prompt_tokens} prompt + ${stats.storyTokenUsage.completion_tokens} completion)`;
              }
            }
            if (stats.evaluationTokenUsage) {
              statsHtml += `<br><b>Evaluation Tokens:</b> ${
                stats.evaluationTokenUsage.total_tokens || "N/A"
              }`;
              if (
                stats.evaluationTokenUsage.prompt_tokens &&
                stats.evaluationTokenUsage.completion_tokens
              ) {
                statsHtml += ` (${stats.evaluationTokenUsage.prompt_tokens} prompt + ${stats.evaluationTokenUsage.completion_tokens} completion)`;
              }
            }

            const totalTokens =
              (stats.storyTokenUsage?.total_tokens || 0) +
              (stats.evaluationTokenUsage?.total_tokens || 0);
            if (totalTokens > 0) {
              statsHtml += `<br><b>Total Tokens:</b> ${totalTokens}`;
            }

            // Add cost information
            if (stats.costs) {
              const costs = stats.costs;
              statsHtml += `<br><b>💰 Costs:</b>`;

              if (costs.story && costs.evaluation) {
                statsHtml += `<br>Story: <b>$${costs.story.totalCost.toFixed(
                  6
                )}</b> (${costs.story.tokens.total} tokens)`;
                statsHtml += `<br>Evaluation: <b>$${costs.evaluation.totalCost.toFixed(
                  6
                )}</b> (${costs.evaluation.tokens.total} tokens)`;
              }

              if (costs.total) {
                statsHtml += `<br><b>Total Cost: $${costs.total.totalCost.toFixed(
                  6
                )}</b>`;

                // Show cost breakdown for larger amounts
                if (costs.total.totalCost >= 0.001) {
                  statsHtml += ` (Input: $${costs.total.inputCost.toFixed(
                    6
                  )}, Output: $${costs.total.outputCost.toFixed(6)})`;
                }
              }
            }

            statsDiv.innerHTML = statsHtml;

            // Display evaluation if available
            if (stats.evaluation) {
              displayEvaluation(stats.evaluation);
            }
          } catch (e) {
            statsDiv.textContent = "Stats: (failed to parse)";
          }
          buffer = "";
          done = true;
          break;
        } else {
          // No marker yet, just append chunk to output
          output.textContent += chunk;
          output.scrollTop = output.scrollHeight;
          buffer = "";
        }
      }
      done = streamDone;
    }
  } catch (err) {
    output.textContent = "Error: " + err.message;
    statsDiv.textContent = "";
    evaluationDiv.style.display = "none";
  } finally {
    btn.disabled = false;
  }
});
