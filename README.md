# Streaming Node LLM with comprehensive Evaluation (AI Judge)

This project demonstrates streaming responses from a Node.js server using Express and the OpenAI API. It's a comprehensive AI story generation and evaluation platform that creates sci-fi stories about astronauts stranded on alien exoplanets, then automatically evaluates the quality of the generated content using a secondary AI model.

## Features

- **/stream**: Streams the contents of the current file with a delay and transforms the output to uppercase.
- **/llm**: Generates and streams compelling sci-fi stories about astronauts stranded on alien exoplanets, featuring unique alien flora and fauna.
- **Automatic Story Evaluation**: Each generated story is automatically evaluated by a separate AI model (GPT-4.1 Mini) for content quality, writing style, creativity, and emotional impact.
- **Model Selection**: Choose from multiple OpenAI models for story generation with support for GPT-4.1, GPT-4.1 Mini, GPT-4.1 Nano, and o4-mini variants.
- **Real-time Streaming Interface**: Interactive web UI that displays stories as they're generated token by token.
- **Comprehensive Analytics Dashboard**: Track evaluation performance, token usage, model comparison, and historical trends.
- **Token Usage Analytics**: Detailed tracking of OpenAI API token consumption for cost analysis and optimization.
- **Evaluation Logging**: Persistent storage of evaluation results and performance metrics for long-term analysis.
- **Story-Specific Prompts**: Specialized prompts designed to generate engaging sci-fi narratives with specific requirements (astronaut protagonist, alien species, survival themes, hopeful endings).
- Modular code with support for environment variables via `dotenv`.

## Project Structure

- `index.js`: Main Express server with streaming endpoints.
- `llm/llm.js`: Handles OpenAI API streaming logic.
- `llm/llmEvaluation.js`: Contains story evaluation functionality using OpenAI.
- `llm/evaluationLogger.js`: Manages persistent logging of evaluation data and performance metrics.
- `llm/prompts.js`: Contains prompt(s) for the language model.
- `frontend/index.html`: Interactive web interface for testing LLM streaming with real-time display.
- `frontend/stats.html`: Performance dashboard for viewing evaluation analytics and historical data.
- `package.json`: Project metadata and dependencies.

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Set up environment variables:**
   - Create a `.env` file in the project root with your OpenAI API key:
     ```env
     OPENAI_API_KEY=your_openai_api_key_here
     ```
3. **Run the server:**
   ```sh
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## Usage

### API Endpoints

- Visit [http://localhost:3000/stream](http://localhost:3000/stream) to see file streaming in action.
- Visit [http://localhost:3000/llm](http://localhost:3000/llm) to get a streamed sci-fi story about an astronaut on an exoplanet.
  - Supports model selection via query parameter: `?model=gpt-4.1-2025-04-14`
- Visit [http://localhost:3000/api/evaluation-stats](http://localhost:3000/api/evaluation-stats) to get evaluation statistics as JSON.
  - Supports filtering by model: `?model=o4-mini-2025-04-16`
- Visit [http://localhost:3000/api/models](http://localhost:3000/api/models) to get available models and current model configuration.

### Frontend Interface

- Visit [http://localhost:3000/](http://localhost:3000/) to access the interactive web interface.
- Visit [http://localhost:3000/stats](http://localhost:3000/stats) to view the performance dashboard.

The main interface provides:

- **Model Selection Dropdown**: Choose from available OpenAI models including:
  - o4-mini-2025-04-16 (Default)
  - GPT-4.1 (gpt-4.1-2025-04-14)
  - GPT-4.1 Mini (gpt-4.1-mini-2025-04-14)
  - GPT-4.1 Nano (gpt-4.1-nano-2025-04-14)
- **"Generate Story" Button**: Triggers generation of a sci-fi story about an astronaut stranded on an alien exoplanet
- **Real-time Story Streaming**: Watch the story unfold token by token as it's generated
- **Performance Metrics**: View time to first token, total generation time, and detailed token usage
- **Token Usage Tracking**: Real-time display of token consumption for both story generation and evaluation
  - Story tokens (prompt + completion breakdown)
  - Evaluation tokens (prompt + completion breakdown)
  - Total token count across both operations
- **Automatic Story Evaluation**: After story generation, view AI-powered evaluation with:
  - Content Quality scoring (1-10) - How well the story meets the specific prompt requirements
  - Writing Style assessment (1-10) - Grammar, clarity, structure, and engagement
  - Creativity rating (1-10) - Originality and imaginative elements
  - Emotional Impact score (1-10) - Ability to evoke emotions and engage readers
  - Overall score and detailed summary
- **Modern, Responsive UI**: Clean interface optimized for both desktop and mobile viewing

The performance dashboard provides:

- **Model Filtering**: Filter analytics by specific story generation models to compare performance
- **Historical Analytics**: Track evaluation performance over time
- **Score Trends**: View average scores across all evaluation criteria
- **Performance Metrics**: Monitor generation and evaluation timing
- **Token Usage Analytics**: Comprehensive token consumption tracking and analysis
  - Average tokens per story generation
  - Average tokens per evaluation
  - Total tokens consumed across all sessions
  - Breakdown between prompt and completion tokens
  - Cost analysis and optimization insights
- **Recent Activity**: See latest evaluations with detailed breakdowns
- **Success Rate Tracking**: Monitor evaluation success/failure rates

## Model Selection

The application supports multiple OpenAI models for story generation, allowing you to compare performance, quality, and cost across different model variants:

### Available Models

- **o4-mini-2025-04-16** (Default): Optimized for speed and cost-effectiveness
- **GPT-4.1 (gpt-4.1-2025-04-14)**: Latest full-featured model with enhanced capabilities
- **GPT-4.1 Mini (gpt-4.1-mini-2025-04-14)**: Balanced performance and cost
- **GPT-4.1 Nano (gpt-4.1-nano-2025-04-14)**: Lightweight model for basic tasks

### Model Selection Features

- **Frontend Dropdown**: Easy model selection in the web interface
- **API Parameter**: Programmatic model selection via `?model=` query parameter
- **Performance Tracking**: Individual analytics for each model's performance
- **Model Comparison**: Compare evaluation scores, token usage, and timing across models
- **Historical Data**: Track usage patterns and performance trends per model

### Model Analytics

The performance dashboard provides model-specific insights:

- **Per-Model Statistics**: Average scores, token usage, and performance metrics for each model
- **Model Comparison**: Side-by-side comparison of different models' performance
- **Success Rates**: Track evaluation success/failure rates by model
- **Cost Analysis**: Monitor token consumption and estimated costs per model
- **Usage Patterns**: Identify which models are used most frequently

## Requirements

- Node.js 18+
- OpenAI API key

## Story Theme & Content

This application is specifically designed to generate science fiction stories with a focused narrative premise:

### Story Elements
- **Protagonist**: A lone astronaut stranded on an alien world
- **Setting**: Newly discovered exoplanets with unique environments
- **Themes**: Survival, isolation, wonder, and hope
- **Required Content**: 
  - Initial survival struggles
  - At least three distinct alien species or plant types
  - A pivotal moment of discovery that changes the protagonist's perspective
  - Hopeful, open-ended conclusions

### Story Structure
- **Length**: Approximately 300-500 words
- **Format**: Multi-paragraph short story
- **Tone**: Incorporates elements of wonder, isolation, and hope
- **Narrative Arc**: Clear beginning, middle, and hopeful conclusion

The specialized prompts ensure consistent, engaging sci-fi narratives that can be meaningfully evaluated and compared across different AI models.

## Evaluation Pipeline

The application includes an automated evaluation system specifically designed to assess the quality of generated sci-fi stories about astronauts on exoplanets. The evaluation runs automatically after each story generation using GPT-4.1 Mini as the evaluation model.

### Evaluation Criteria

The stories are assessed on four key criteria using a 1-10 scale:

1. **Content Quality (1-10)**: How well the story meets the specific prompt requirements including:
   - Features a lone astronaut protagonist
   - Takes place on a newly discovered exoplanet
   - Includes survival themes and struggles
   - Describes at least three distinct alien species or plant types
   - Has a hopeful, open-ended conclusion

2. **Writing Style (1-10)**: Clarity, engagement, structure, and grammatical correctness
3. **Creativity (1-10)**: Originality, imagination, and unique perspectives in describing alien worlds
4. **Emotional Impact (1-10)**: Ability to evoke emotions like wonder, isolation, and hope

### Evaluation Process

- **Automatic Trigger**: Evaluation begins immediately after story generation completes
- **Structured Output**: Results are returned in JSON format with scores, feedback, and summary
- **Performance Tracking**: Evaluation timing and token usage are logged for analysis
- **Error Handling**: Graceful fallback if evaluation fails, with detailed error logging

The evaluation runs automatically after story generation and displays results in a clean, organized dashboard with individual criterion scores, detailed feedback for each category, and an overall assessment.

## Token Usage Analytics

The application provides comprehensive token usage tracking to help monitor OpenAI API consumption and optimize costs:

### Real-time Token Tracking

- **Story Generation**: Tracks tokens used for the main story generation request
- **Evaluation**: Tracks tokens used for the automated story evaluation
- **Breakdown**: Displays prompt tokens vs completion tokens for each operation
- **Total Count**: Shows combined token usage across both operations

### Historical Analytics

- **Average Usage**: Track average token consumption per story and evaluation
- **Total Consumption**: Monitor cumulative token usage across all sessions
- **Trend Analysis**: Identify patterns in token usage over time
- **Cost Estimation**: Calculate approximate API costs based on token consumption

### Performance Optimization

- **Efficiency Metrics**: Compare token usage against story quality and length
- **Usage Patterns**: Identify opportunities to optimize prompts and reduce costs
- **Budget Tracking**: Monitor token consumption to stay within API usage limits
