# HRA42 AI Bench - Advanced LLM Benchmarking Platform

[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![DuckDB](https://img.shields.io/badge/DuckDB-FFF000?style=for-the-badge&logo=duckdb&logoColor=black)](https://duckdb.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![License: Unlicense](https://img.shields.io/badge/License-Unlicense-blue.svg?style=for-the-badge)](http://unlicense.org/)

## 🚀 Overview

HRA42 AI Bench is a comprehensive benchmarking platform for comparing Large Language Model (LLM) performance across multiple dimensions. Built with modern web technologies, it provides real-time comparison of various AI models through OpenRouter's unified API, with detailed metrics tracking and cost analysis.

### ✨ Key Features

- **🎯 Multi-Modal Benchmarking**: Test models across text generation, structured output, vision analysis, and document processing
- **⚡ Real-Time Comparison**: Execute benchmarks on multiple models simultaneously with live streaming results
- **💰 Cost Tracking**: Detailed cost analysis per model, per token, and per benchmark run
- **📊 Performance Analytics**: Comprehensive metrics including response time, token usage, and quality scores
- **🗄️ Historical Analysis**: Track model performance over time with trend detection
- **🎨 Modern UI**: Responsive, accessible interface built with Tailwind CSS
- **🔒 Privacy-First**: All data stored locally using embedded DuckDB database

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [User Guide](#-user-guide)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- OpenRouter API key ([Get one here](https://openrouter.ai))

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/hra42/hra42-ai-bench.git
cd hra42-ai-bench
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:
```env
OPENROUTER_API_KEY=your-api-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
DATABASE_PATH=data/hra42.duckdb
```

4. **Initialize the database**
```bash
npm run db:init
```

5. **Start the development server**
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to access the application.

## 🐳 Docker Deployment

### Quick Start with Docker Compose

1. **Clone the repository**
```bash
git clone https://github.com/hra42/hra42-ai-bench.git
cd hra42-ai-bench
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env and add your OpenRouter API key
```

3. **Build and run with Docker Compose**
```bash
docker compose up -d --build
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Docker Commands

```bash
# View logs
docker compose logs -f

# Stop the application
docker compose down

# Stop and remove volumes (reset database)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build
```

### GitHub Container Registry

```bash
# Run directly from GitHub Container Registry
docker run -d \
  --name hra42-ai-bench \
  -p 3000:3000 \
  -e OPENROUTER_API_KEY=your-api-key \
  -v hra42_data:/app/data \
  ghcr.io/hra42/hra42-ai-bench:latest
```

### Development with Docker

For development with hot reload:

```bash
docker compose -f docker-compose.dev.yml up
```

Access the development server at [http://localhost:5173](http://localhost:5173)

## 🚀 Quick Start

### Running Your First Benchmark

1. **Navigate to the Benchmark page** from the main dashboard
2. **Select benchmark type** (Text, Structured, Vision, etc.)
3. **Choose models** to compare from the dropdown
4. **Configure your prompt** or upload files
5. **Click "Execute Benchmark"** to start
6. **View real-time results** as they stream in

### Example: Text Generation Benchmark

```typescript
// Example prompt configuration
const benchmark = {
  type: 'text',
  prompt: 'Explain quantum computing in simple terms',
  models: ['gpt-4', 'claude-3-opus', 'gemini-pro'],
  temperature: 0.7,
  maxTokens: 500
}
```

## 🎯 Features

### Benchmark Types

#### 📝 Text Generation
Compare how different models respond to the same prompt with detailed token usage and cost analysis.

#### 🔧 Structured Output
Test models' ability to generate valid JSON according to specified schemas.

#### 🛠️ Function Calling
Evaluate how well models understand and execute function definitions.

#### 🖼️ Vision Analysis
Compare image understanding capabilities across vision-enabled models.

#### 📄 Document Processing
Test PDF processing and document understanding abilities.

### Advanced Features

#### 🔄 Real-Time Streaming
- Server-Sent Events for live updates
- Progressive response rendering
- Concurrent model execution

#### 📊 Analytics Dashboard
- Cost per token analysis
- Response time comparison
- Quality metrics tracking
- Historical trend analysis

#### 💾 Data Management
- Export results to CSV/JSON
- Save benchmark templates
- Historical data browsing
- Batch result comparison

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | SvelteKit | Full-stack framework |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Database | DuckDB | Embedded analytics |
| API | OpenRouter | Unified LLM access |
| Language | TypeScript | Type safety |
| State | Svelte Stores | Reactive state management |

### Project Structure

```
hra42-ai-bench/
├── src/
│   ├── routes/              # Pages and API endpoints
│   │   ├── benchmark/       # Main benchmarking interface
│   │   ├── history/         # Historical results viewer
│   │   └── api/            # Backend API routes
│   ├── lib/
│   │   ├── server/         # Server-side code
│   │   │   ├── db/         # DuckDB integration
│   │   │   └── openrouter/ # API client
│   │   ├── components/     # UI components (atomic design)
│   │   │   ├── atoms/      # Basic components
│   │   │   ├── molecules/  # Composed components
│   │   │   ├── organisms/  # Complex sections
│   │   │   └── templates/  # Page layouts
│   │   ├── stores/         # State management
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Helper functions
│   └── app.html            # App shell
├── static/                 # Static assets
├── tests/                  # Test files
└── data/                   # Database storage
```

### Database Schema

```sql
-- Core tables
CREATE TABLE benchmark_runs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    prompt TEXT,
    config JSON,
    status TEXT,
    created_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE model_responses (
    id TEXT PRIMARY KEY,
    run_id TEXT REFERENCES benchmark_runs(id),
    model TEXT NOT NULL,
    response TEXT,
    tokens_used INTEGER,
    cost DECIMAL(10,6),
    latency_ms INTEGER,
    error TEXT,
    metadata JSON
);

CREATE TABLE models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT,
    context_length INTEGER,
    pricing JSON,
    capabilities JSON,
    updated_at TIMESTAMP
);
```

## 📚 API Documentation

### Core Endpoints

#### `GET /api/models`
Fetch available models from OpenRouter.

**Response:**
```json
{
  "models": [
    {
      "id": "openai/gpt-4",
      "name": "GPT-4",
      "contextLength": 8192,
      "pricing": {
        "prompt": 0.03,
        "completion": 0.06
      }
    }
  ]
}
```

#### `POST /api/execute`
Execute a benchmark run.

**Request:**
```json
{
  "type": "text",
  "models": ["gpt-4", "claude-3"],
  "prompt": "Your prompt here",
  "config": {
    "temperature": 0.7,
    "maxTokens": 500
  }
}
```

#### `GET /api/execute/stream`
Stream benchmark execution results via Server-Sent Events.

#### `GET /api/results/:runId`
Fetch results for a specific benchmark run.

#### `GET /api/history`
Retrieve historical benchmark data with filtering options.

#### `POST /api/export`
Export benchmark results in various formats (CSV, JSON, Excel).

## 📖 User Guide

### Workflow Examples

#### Comparing Model Creativity
1. Select "Text Generation" benchmark type
2. Choose creative writing models
3. Set temperature to 0.9 for more creative outputs
4. Enter a creative prompt
5. Compare responses for originality and coherence

#### Testing JSON Generation
1. Select "Structured Output" benchmark
2. Define your JSON schema
3. Choose models with JSON mode support
4. Execute and validate schema compliance

#### Analyzing Images
1. Select "Vision Analysis" benchmark
2. Upload image (JPEG, PNG, WebP)
3. Choose vision-capable models
4. Add analysis prompt
5. Compare interpretation accuracy

### Best Practices

- **Model Selection**: Choose 3-5 models for optimal comparison
- **Prompt Engineering**: Use clear, specific prompts for consistent results
- **Cost Management**: Monitor token usage and set limits
- **Template Usage**: Save successful benchmark configurations
- **Export Strategy**: Regular exports for long-term analysis

## 🔧 Development

### Commands

```bash
# Development
npm run dev        # Start dev server with hot reload
npm run build      # Build for production
npm run preview    # Preview production build

# Code Quality
npm run check      # Type checking
npm run lint       # Linting and formatting check
npm run format     # Auto-format code

# Database
npm run db:init    # Initialize database
npm run db:migrate # Run migrations
npm run db:seed    # Seed sample data

# Testing
npm run test       # Run tests
npm run test:ui    # Run tests with UI
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key | Required |
| `OPENROUTER_BASE_URL` | API base URL | `https://openrouter.ai/api/v1` |
| `DATABASE_PATH` | DuckDB file location | `data/hra42.duckdb` |
| `PUBLIC_APP_NAME` | Application name | `HRA42 AI Bench` |
| `PUBLIC_MAX_FILE_SIZE` | Max upload size | `20971520` (20MB) |

### Component Development

All components follow atomic design principles:

```svelte
<!-- Example: atoms/Button.svelte -->
<script lang="ts">
  export let variant: 'primary' | 'secondary' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<button
  class="px-4 py-2 rounded-lg transition-colors
         {variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
         {size === 'sm' ? 'text-sm' : ''}"
  on:click
>
  <slot />
</button>
```

### Adding New Benchmark Types

1. Define type in `src/lib/types/benchmark.ts`
2. Create UI component in `src/lib/components/organisms/`
3. Add execution logic in `src/routes/api/execute/+server.ts`
4. Update result display in `src/lib/components/organisms/ModelResponseCard.svelte`

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use Tailwind utility classes exclusively
- Write comprehensive tests
- Document complex logic
- Keep components small and focused

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai) for unified LLM API access
- [SvelteKit](https://kit.svelte.dev) for the amazing framework
- [DuckDB](https://duckdb.org) for the powerful embedded database
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Docker](https://www.docker.com) for containerization support

## 📄 License

This project is released into the public domain under the **Unlicense** - see the [LICENSE](LICENSE) file for details.

This means you can:
- ✅ Use this software for any purpose
- ✅ Modify and distribute it freely
- ✅ Use it in commercial projects
- ✅ Do whatever you want with it

No attribution required, no restrictions imposed.

### Unlicensing Contributions

To ensure this project remains completely free and unencumbered by anyone's copyright monopoly,
we require that all contributors explicitly dedicate their contributions to the public domain.

**All contributions must include the following waiver:**

```
I dedicate any and all copyright interest in this software to the
public domain. I make this dedication for the benefit of the public at
large and to the detriment of my heirs and successors. I intend this
dedication to be an overt act of relinquishment in perpetuity of all
present and future rights to this software under copyright law.
```

#### How to Submit Your Waiver

For any non-trivial contribution:

1. **Include the waiver in your pull request description**
2. **OR** Add the waiver as a comment in the relevant issue
3. Sign your commits
   - Follow this GitHub Documenation: https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits