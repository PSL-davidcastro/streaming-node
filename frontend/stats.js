function filterByModel() {
  const modelSelect = document.getElementById("modelSelect");
  const currentFilter = document.getElementById("currentFilter");
  const selectedModel = modelSelect.value;

  if (selectedModel) {
    currentFilter.textContent = `Filtered: ${selectedModel}`;
    currentFilter.style.display = "inline";
  } else {
    currentFilter.style.display = "none";
  }

  loadStats();
}

async function loadModels() {
  try {
    const response = await fetch("/api/models");
    if (response.ok) {
      const data = await response.json();
      const modelSelect = document.getElementById("modelSelect");

      // Clear existing options except "All Models"
      modelSelect.innerHTML = '<option value="">All Models</option>';

      // Add available models
      data.availableModels.forEach((model) => {
        const option = document.createElement("option");
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error loading models:", error);
  }
}

async function loadStats() {
  const dashboard = document.getElementById("dashboard");
  const loading = document.getElementById("loading");
  const emptyState = document.getElementById("emptyState");
  const refreshBtn = document.getElementById("refreshBtn");
  const spinner = document.getElementById("spinner");
  const modelSelect = document.getElementById("modelSelect");

  // Show loading state
  dashboard.style.display = "none";
  emptyState.style.display = "none";
  loading.style.display = "block";
  refreshBtn.disabled = true;
  spinner.style.display = "inline-block";

  try {
    const selectedModel = modelSelect.value;
    const url = selectedModel
      ? `/api/evaluation-stats?model=${encodeURIComponent(selectedModel)}`
      : "/api/evaluation-stats";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch statistics");
    }

    const stats = await response.json();

    if (stats.totalEvaluations === 0) {
      loading.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    populateDashboard(stats);
    loading.style.display = "none";
    dashboard.style.display = "block";
  } catch (error) {
    console.error("Error loading stats:", error);
    loading.innerHTML = `<div style="color: #e74c3c;">Error loading statistics: ${error.message}</div>`;
  } finally {
    refreshBtn.disabled = false;
    spinner.style.display = "none";
  }
}

function populateDashboard(stats) {
  // Overview stats
  document.getElementById("totalEvaluations").textContent =
    stats.totalEvaluations;

  const successRate =
    stats.totalEvaluations > 0
      ? Math.round((stats.successfulEvaluations / stats.totalEvaluations) * 100)
      : 0;
  document.getElementById("successRate").textContent = `${successRate}%`;

  document.getElementById("avgOverallScore").textContent = stats.averageScores
    .overall
    ? stats.averageScores.overall.toFixed(1)
    : "-";

  document.getElementById("avgTotalTime").textContent = stats.performanceStats
    .averageTotalTime
    ? `${Math.round(stats.performanceStats.averageTotalTime)}ms`
    : "-";

  // Performance metrics
  document.getElementById("avgTimeToFirstToken").textContent = stats
    .performanceStats.averageTimeToFirstToken
    ? `${Math.round(stats.performanceStats.averageTimeToFirstToken)}ms`
    : "-";

  document.getElementById("avgEvaluationTime").textContent = stats
    .performanceStats.averageEvaluationTime
    ? `${Math.round(stats.performanceStats.averageEvaluationTime)}ms`
    : "-";

  // Token usage metrics
  if (stats.tokenStats) {
    document.getElementById("avgTotalTokens").textContent = stats.tokenStats
      .averageTotalTokens
      ? Math.round(stats.tokenStats.averageTotalTokens).toLocaleString()
      : "-";

    document.getElementById("totalTokensUsed").textContent = stats.tokenStats
      .totalTokensUsed
      ? stats.tokenStats.totalTokensUsed.toLocaleString()
      : "-";

    document.getElementById("avgStoryTokens").textContent = stats.tokenStats
      .averageStoryTokens
      ? Math.round(stats.tokenStats.averageStoryTokens).toLocaleString()
      : "-";

    document.getElementById("avgEvaluationTokens").textContent = stats
      .tokenStats.averageEvaluationTokens
      ? Math.round(stats.tokenStats.averageEvaluationTokens).toLocaleString()
      : "-";
  } else {
    // If no token stats available, show dashes
    document.getElementById("avgTotalTokens").textContent = "-";
    document.getElementById("totalTokensUsed").textContent = "-";
    document.getElementById("avgStoryTokens").textContent = "-";
    document.getElementById("avgEvaluationTokens").textContent = "-";
  }

  // Cost analytics
  if (stats.costStats) {
    document.getElementById("avgTotalCost").textContent = stats.costStats
      .averageTotalCost
      ? `$${stats.costStats.averageTotalCost.toFixed(6)}`
      : "-";

    document.getElementById("totalCosts").textContent = stats.costStats
      .totalCosts
      ? `$${stats.costStats.totalCosts.toFixed(4)}`
      : "-";

    document.getElementById("avgStoryCost").textContent = stats.costStats
      .averageStoryCost
      ? `$${stats.costStats.averageStoryCost.toFixed(6)}`
      : "-";

    document.getElementById("avgEvaluationCost").textContent = stats.costStats
      .averageEvaluationCost
      ? `$${stats.costStats.averageEvaluationCost.toFixed(6)}`
      : "-";

    // Cost efficiency metrics
    document.getElementById("avgCostPerQuality").textContent = stats.costStats
      .averageCostPerQualityPoint
      ? `$${stats.costStats.averageCostPerQualityPoint.toFixed(6)}`
      : "-";

    document.getElementById("avgQualityPerDollar").textContent = stats.costStats
      .averageQualityPerDollar
      ? stats.costStats.averageQualityPerDollar.toFixed(2)
      : "-";

    document.getElementById("avgCostPerWord").textContent = stats.costStats
      .averageCostPerWord
      ? `$${stats.costStats.averageCostPerWord.toFixed(6)}`
      : "-";

    document.getElementById("avgCostPerChar").textContent = stats.costStats
      .averageCostPerCharacter
      ? `$${stats.costStats.averageCostPerCharacter.toFixed(8)}`
      : "-";
  } else {
    // If no cost stats available, show dashes
    document.getElementById("avgTotalCost").textContent = "-";
    document.getElementById("totalCosts").textContent = "-";
    document.getElementById("avgStoryCost").textContent = "-";
    document.getElementById("avgEvaluationCost").textContent = "-";
    document.getElementById("avgCostPerQuality").textContent = "-";
    document.getElementById("avgQualityPerDollar").textContent = "-";
    document.getElementById("avgCostPerWord").textContent = "-";
    document.getElementById("avgCostPerChar").textContent = "-";
  }

  // Model breakdown
  populateModelBreakdown(stats.modelBreakdown);

  // Score breakdown
  populateScoreBreakdown(stats.averageScores);

  // Complexity analysis
  populateComplexityAnalysis(stats.complexityStats);

  // Recent evaluations
  populateRecentEvaluations(stats.recentEvaluations);
}

function populateModelBreakdown(modelBreakdown) {
  const container = document.getElementById("modelBreakdown");
  container.innerHTML = "";

  if (!modelBreakdown || Object.keys(modelBreakdown).length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #666;">No data available for selected model.</p>';
    return;
  }

  Object.entries(modelBreakdown).forEach(([model, data]) => {
    const modelDiv = document.createElement("div");
    modelDiv.className = "model-stat-item";
    modelDiv.style.marginBottom = "16px";

    const successRate =
      data.totalEvaluations > 0
        ? Math.round((data.successfulEvaluations / data.totalEvaluations) * 100)
        : 0;

    // Calculate average score from available score data
    let avgScore = "-";
    if (data.averageScores && data.averageScores.overall !== undefined) {
      avgScore = data.averageScores.overall.toFixed(1);
    } else if (data.averageScores) {
      // Calculate overall score from individual scores if overall is missing
      const scores = [];
      if (data.averageScores.contentQuality !== undefined)
        scores.push(data.averageScores.contentQuality);
      if (data.averageScores.writingStyle !== undefined)
        scores.push(data.averageScores.writingStyle);
      if (data.averageScores.creativity !== undefined)
        scores.push(data.averageScores.creativity);
      if (data.averageScores.emotionalImpact !== undefined)
        scores.push(data.averageScores.emotionalImpact);

      if (scores.length > 0) {
        const calculatedAvg =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
        avgScore = calculatedAvg.toFixed(1);
      }
    }

    modelDiv.innerHTML = `
            <div style="font-weight: bold; color: #2980b9;">${model}</div>
            <div class="stat-grid" style="margin-top: 8px;">
              <div class="stat-item">
                <div class="stat-value">${data.totalEvaluations}</div>
                <div class="stat-label">Total Evaluations</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${successRate}%</div>
                <div class="stat-label">Success Rate</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${avgScore}</div>
                <div class="stat-label">Avg Score</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${
                  data.averagePerformance?.totalTime
                    ? Math.round(data.averagePerformance.totalTime)
                    : "-"
                }ms</div>
                <div class="stat-label">Avg Time</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${
                  data.averageCosts?.totalCost
                    ? `$${data.averageCosts.totalCost.toFixed(6)}`
                    : "-"
                }</div>
                <div class="stat-label">Avg Cost</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${
                  data.totalCosts?.total
                    ? `$${data.totalCosts.total.toFixed(4)}`
                    : "-"
                }</div>
                <div class="stat-label">Total Cost</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${
                  data.costEfficiency?.qualityPerDollar
                    ? data.costEfficiency.qualityPerDollar.toFixed(2)
                    : "-"
                }</div>
                <div class="stat-label tooltip-container">
                  Quality/Dollar
                  <span class="tooltip-icon">ℹ️</span>
                  <div class="tooltip-text">
                    <strong>Quality per Dollar</strong><br/>
                    This metric shows how much quality score you get per dollar spent. It's calculated as: Overall Score ÷ Total Cost.<br/><br/>
                    Higher values indicate better cost efficiency - you're getting more quality for your money.
                  </div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${
                  data.costEfficiency?.costPerWord
                    ? `$${data.costEfficiency.costPerWord.toFixed(6)}`
                    : "-"
                }</div>
                <div class="stat-label">Cost/Word</div>
              </div>
            </div>
          `;

    container.appendChild(modelDiv);
  });
}

function populateScoreBreakdown(averageScores) {
  const container = document.getElementById("scoreBreakdown");
  container.innerHTML = "";

  const scoreLabels = {
    contentQuality: "Content Quality",
    writingStyle: "Writing Style",
    creativity: "Creativity",
    emotionalImpact: "Emotional Impact",
  };

  Object.entries(scoreLabels).forEach(([key, label]) => {
    const score = averageScores[key] || 0;
    const percentage = (score / 10) * 100;

    const scoreDiv = document.createElement("div");
    scoreDiv.style.marginBottom = "16px";
    scoreDiv.innerHTML = `
            <div class="score-text">
              <span>${label}</span>
              <span class="score-value">${score.toFixed(1)}/10</span>
            </div>
            <div class="score-bar">
              <div class="score-fill" style="width: ${percentage}%"></div>
            </div>
          `;
    container.appendChild(scoreDiv);
  });
}

function populateComplexityAnalysis(complexityStats) {
  const container = document.getElementById("complexityAnalysis");
  container.innerHTML = "";

  if (!complexityStats || Object.keys(complexityStats).length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #666;">No complexity data available yet. Generate stories with different prompt complexities to see analysis.</p>';
    return;
  }

  const complexityGrid = document.createElement("div");
  complexityGrid.className = "complexity-grid";

  Object.entries(complexityStats).forEach(([complexity, data]) => {
    if (data.totalEvaluations === 0) return; // Skip complexities with no data

    const complexityCard = document.createElement("div");
    complexityCard.className = "complexity-card";

    const successRate =
      data.totalEvaluations > 0
        ? Math.round((data.successfulEvaluations / data.totalEvaluations) * 100)
        : 0;

    const avgTime = data.averagePerformance?.totalTime
      ? Math.round(data.averagePerformance.totalTime)
      : 0;

    const avgTokens = data.averageTokenUsage?.totalTokens
      ? Math.round(data.averageTokenUsage.totalTokens)
      : 0;

    const avgCost = data.averageCosts?.totalCost
      ? data.averageCosts.totalCost.toFixed(6)
      : 0;

    complexityCard.innerHTML = `
            <div class="complexity-header">
              <div class="complexity-title">${complexity} Prompts</div>
              <div class="complexity-count">${
                data.totalEvaluations
              } evaluations</div>
            </div>
            
            <div class="complexity-metrics">
              <div class="complexity-metric">
                <div class="complexity-metric-value">${successRate}%</div>
                <div class="complexity-metric-label">Success Rate</div>
              </div>
              <div class="complexity-metric">
                <div class="complexity-metric-value">${avgTime}ms</div>
                <div class="complexity-metric-label">Avg Time</div>
              </div>
              <div class="complexity-metric">
                <div class="complexity-metric-value">${avgTokens.toLocaleString()}</div>
                <div class="complexity-metric-label">Avg Tokens</div>
              </div>
              <div class="complexity-metric">
                <div class="complexity-metric-value">$${avgCost}</div>
                <div class="complexity-metric-label">Avg Cost</div>
              </div>
            </div>

            ${
              data.averageScores && Object.keys(data.averageScores).length > 0
                ? `
              <div class="complexity-scores">
                ${
                  data.averageScores.overall
                    ? `
                  <div class="complexity-score-item">
                    <span class="complexity-score-label">Overall Score</span>
                    <span class="complexity-score-value">${data.averageScores.overall.toFixed(
                      1
                    )}/10</span>
                  </div>
                `
                    : ""
                }
                ${
                  data.averageScores.contentQuality
                    ? `
                  <div class="complexity-score-item">
                    <span class="complexity-score-label">Content Quality</span>
                    <span class="complexity-score-value">${data.averageScores.contentQuality.toFixed(
                      1
                    )}/10</span>
                  </div>
                `
                    : ""
                }
                ${
                  data.averageScores.writingStyle
                    ? `
                  <div class="complexity-score-item">
                    <span class="complexity-score-label">Writing Style</span>
                    <span class="complexity-score-value">${data.averageScores.writingStyle.toFixed(
                      1
                    )}/10</span>
                  </div>
                `
                    : ""
                }
                ${
                  data.averageScores.creativity
                    ? `
                  <div class="complexity-score-item">
                    <span class="complexity-score-label">Creativity</span>
                    <span class="complexity-score-value">${data.averageScores.creativity.toFixed(
                      1
                    )}/10</span>
                  </div>
                `
                    : ""
                }
                ${
                  data.averageScores.emotionalImpact
                    ? `
                  <div class="complexity-score-item">
                    <span class="complexity-score-label">Emotional Impact</span>
                    <span class="complexity-score-value">${data.averageScores.emotionalImpact.toFixed(
                      1
                    )}/10</span>
                  </div>
                `
                    : ""
                }
              </div>
            `
                : ""
            }

            ${
              data.evaluationComplexityBreakdown &&
              Object.keys(data.evaluationComplexityBreakdown).some(
                (key) =>
                  data.evaluationComplexityBreakdown[key].totalEvaluations > 0
              )
                ? `
              <div class="evaluation-breakdown">
                <div class="evaluation-breakdown-title">By Evaluation Complexity:</div>
                ${Object.entries(data.evaluationComplexityBreakdown)
                  .map(([evalComplexity, evalData]) => {
                    if (evalData.totalEvaluations === 0) return "";
                    const evalSuccessRate =
                      evalData.totalEvaluations > 0
                        ? Math.round(
                            (evalData.successfulEvaluations /
                              evalData.totalEvaluations) *
                              100
                          )
                        : 0;
                    const evalOverallScore = evalData.averageScores?.overall
                      ? evalData.averageScores.overall.toFixed(1)
                      : "-";
                    return `
                    <div class="evaluation-complexity-item">
                      <span class="evaluation-complexity-name">${evalComplexity}</span>
                      <span class="evaluation-complexity-data">${evalData.totalEvaluations} evals, ${evalSuccessRate}% success, ${evalOverallScore}/10 avg</span>
                    </div>
                  `;
                  })
                  .join("")}
              </div>
            `
                : ""
            }
          `;

    complexityGrid.appendChild(complexityCard);
  });

  if (complexityGrid.children.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #666;">No complexity data available for the selected filters.</p>';
  } else {
    container.appendChild(complexityGrid);
  }
}

function populateRecentEvaluations(recentEvaluations) {
  const container = document.getElementById("recentEvaluations");
  container.innerHTML = "";

  if (recentEvaluations.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #666;">No recent evaluations found.</p>';
    return;
  }

  recentEvaluations.forEach((evaluation) => {
    const evalDiv = document.createElement("div");
    evalDiv.className = "evaluation-item";

    const timestamp = new Date(evaluation.timestamp).toLocaleString();
    const overallScore = evaluation.evaluation?.overallScore || "Failed";
    const isSuccess = !evaluation.evaluation?.error;

    evalDiv.innerHTML = `
            <div class="evaluation-header">
              <span class="evaluation-timestamp">${timestamp}</span>
              <span class="evaluation-overall">${
                isSuccess ? `${overallScore}/10` : "Failed"
              }</span>
            </div>
            ${
              isSuccess
                ? `
              <div class="evaluation-details">
                <div class="evaluation-detail">
                  <strong>Model:</strong> ${evaluation.models.storyModel || "-"}
                </div>
                <div class="evaluation-detail">
                  <strong>Content:</strong> ${
                    evaluation.evaluation.contentQuality?.score || "-"
                  }/10
                </div>
                <div class="evaluation-detail">
                  <strong>Style:</strong> ${
                    evaluation.evaluation.writingStyle?.score || "-"
                  }/10
                </div>
                <div class="evaluation-detail">
                  <strong>Creativity:</strong> ${
                    evaluation.evaluation.creativity?.score || "-"
                  }/10
                </div>
                <div class="evaluation-detail">
                  <strong>Impact:</strong> ${
                    evaluation.evaluation.emotionalImpact?.score || "-"
                  }/10
                </div>
                <div class="evaluation-detail">
                  <strong>Total Time:</strong> ${
                    evaluation.performance.totalTime
                  }ms
                </div>
                <div class="evaluation-detail">
                  <strong>Words:</strong> ${evaluation.wordCount}
                </div>
                <div class="evaluation-detail">
                  <strong>Total Cost:</strong> ${
                    evaluation.costs?.total?.totalCost
                      ? `$${evaluation.costs.total.totalCost.toFixed(6)}`
                      : "-"
                  }
                </div>
                <div class="evaluation-detail">
                  <strong>Cost/Word:</strong> ${
                    evaluation.costEfficiency?.costPerWord
                      ? `$${evaluation.costEfficiency.costPerWord.toFixed(6)}`
                      : "-"
                  }
                </div>
              </div>
            `
                : `
              <div style="color: #e74c3c; font-size: 0.9rem;">
                Error: ${evaluation.evaluation?.message || "Unknown error"}
              </div>
            `
            }
          `;

    container.appendChild(evalDiv);
  });
}

// Load stats and models when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadModels();
  loadStats();
});
