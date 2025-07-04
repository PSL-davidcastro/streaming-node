# Streaming Node POC

This project demonstrates streaming responses from a Node.js server using Express and the OpenAI API. It includes endpoints for streaming file content and generating streamed responses from a language model.

## Features

- **/stream**: Streams the contents of the current file with a delay and transforms the output to uppercase.
- **/llm**: Streams generated text from OpenAI's GPT-4.1 model.
- **Frontend Interface**: Interactive web UI for testing the streaming LLM functionality with real-time display and performance metrics.
- Modular code with support for environment variables via `dotenv`.

## Project Structure

- `index.js`: Main Express server with streaming endpoints.
- `llm/llm.js`: Handles OpenAI API streaming logic.
- `llm/llmEvaluation.js`: Contains story evaluation functionality using OpenAI.
- `llm/prompts.js`: Contains prompt(s) for the language model.
- `frontend/index.html`: Interactive web interface for testing LLM streaming with real-time display.
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

### Frontend Interface
- Visit [http://localhost:3000/](http://localhost:3000/) to access the interactive web interface.
- The frontend provides:
  - A "Generate Story" button to trigger LLM streaming
  - Real-time display of the generated content as it streams
  - Performance metrics including time to first token and total generation time
  - Clean, modern UI with responsive design

## Requirements

- Node.js 18+
- OpenAI API key
