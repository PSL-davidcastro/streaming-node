# Streaming Node POC

This project demonstrates streaming responses from a Node.js server using Express and the OpenAI API. It includes endpoints for streaming file content and generating streamed responses from a language model.

## Features

- **/stream**: Streams the contents of the current file with a delay and transforms the output to uppercase.
- **/llm**: Streams generated text from OpenAI's GPT-4.1 model.
- Modular code with support for environment variables via `dotenv`.

## Project Structure

- `index.js`: Main Express server with streaming endpoints.
- `llm.js`: Handles OpenAI API streaming logic.
- `prompts.js`: Contains prompt(s) for the language model.
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

- Visit [http://localhost:3000/stream](http://localhost:3000/stream) to see file streaming in action.
- Visit [http://localhost:3000/llm](http://localhost:3000/llm) to get a streamed story from the LLM.

## Requirements

- Node.js 18+
- OpenAI API key
