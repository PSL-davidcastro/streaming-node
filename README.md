# Streaming Node POC

This project demonstrates streaming responses from a Node.js server using Express and the OpenAI API. It includes endpoints for streaming file content and generating streamed responses from a language model.

## Features

- **/stream**: Streams the contents of the current file with a delay and transforms the output to uppercase.
- **/llm**: Streams generated text from OpenAI's GPT-4 model and provides automatic evaluation.
- **Frontend Interface**: Interactive web UI for testing the streaming LLM functionality with real-time display and performance metrics.
- **Evaluation Pipeline**: Automatic story evaluation using AI with scoring on content quality, writing style, creativity, and emotional impact.
- **Performance Dashboard**: Comprehensive analytics dashboard tracking evaluation performance over time with historical data and trends.
- **Evaluation Logging**: Persistent storage of evaluation results and performance metrics for long-term analysis.
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
- Visit [http://localhost:3000/llm](http://localhost:3000/llm) to get a streamed story from the LLM.
- Visit [http://localhost:3000/api/evaluation-stats](http://localhost:3000/api/evaluation-stats) to get evaluation statistics as JSON.

### Frontend Interface

- Visit [http://localhost:3000/](http://localhost:3000/) to access the interactive web interface.
- Visit [http://localhost:3000/stats](http://localhost:3000/stats) to view the performance dashboard.

The main interface provides:

- A "Generate Story" button to trigger LLM streaming
- Real-time display of the generated content as it streams
- Performance metrics including time to first token and total generation time
- **Story Evaluation Dashboard**: After story generation, view automatic AI evaluation with:
  - Content Quality scoring (1-10)
  - Writing Style assessment (1-10)
  - Creativity rating (1-10)
  - Emotional Impact score (1-10)
  - Overall score and summary
- Clean, modern UI with responsive design

The performance dashboard provides:

- **Historical Analytics**: Track evaluation performance over time
- **Score Trends**: View average scores across all evaluation criteria
- **Performance Metrics**: Monitor generation and evaluation timing
- **Recent Activity**: See latest evaluations with detailed breakdowns
- **Success Rate Tracking**: Monitor evaluation success/failure rates

## Requirements

- Node.js 18+
- OpenAI API key

## Evaluation Pipeline

The application includes an automated evaluation system that assesses generated stories on four key criteria:

1. **Content Quality (1-10)**: How well the story meets prompt requirements and includes requested elements
2. **Writing Style (1-10)**: Clarity, engagement, structure, and grammatical correctness
3. **Creativity (1-10)**: Originality, imagination, and unique perspectives
4. **Emotional Impact (1-10)**: Ability to evoke emotions and engage the reader

The evaluation runs automatically after story generation and displays results in a clean, organized dashboard with individual criterion scores, feedback, and an overall assessment.
