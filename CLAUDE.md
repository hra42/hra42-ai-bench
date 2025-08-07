# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the production version
- `npm run preview` - Preview the production build locally

### Code Quality

- `npm run check` - Run type checking with svelte-check
- `npm run check:watch` - Run type checking in watch mode
- `npm run lint` - Check code formatting and run ESLint
- `npm run format` - Auto-format code with Prettier

## Architecture Overview

### Tech Stack

- **Framework**: SvelteKit (full-stack application framework)
- **Database**: DuckDB (embedded analytical database)
- **Styling**: Tailwind CSS v4 (utility-first, no custom CSS)
- **Language**: TypeScript
- **API Integration**: OpenRouter (unified LLM API provider)

### Project Structure

The application follows SvelteKit conventions with a clear separation of concerns:

- `src/routes/` - Page components and API endpoints
  - `benchmark/` - Main benchmarking interface
  - `history/` - Historical results viewer
  - `api/` - Backend API routes for model execution and results

- `src/lib/` - Shared code and components
  - `server/` - Server-side only code
    - `db/` - DuckDB integration (client, schema, queries)
    - `openrouter/` - OpenRouter API client and utilities
  - `components/` - UI components following atomic design
    - `atoms/` - Base components (Button, Input, Card, etc.)
    - `molecules/` - Composed components (ModelSelector, CostDisplay, etc.)
    - `organisms/` - Complex sections (BenchmarkConfigurator, ModelComparisonGrid, etc.)
    - `templates/` - Page compositions
  - `stores/` - Svelte stores for state management
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions

### Component Design System

All styling uses Tailwind CSS utilities exclusively. Follow these patterns:

**Color System**:

- Primary: `blue-500` to `blue-700`
- Success: `green-500`
- Warning: `amber-500`
- Danger: `red-500`
- Neutral: `slate-50` to `slate-900`

**Spacing Patterns**:

- Cards: `p-4 md:p-6`
- Sections: `py-8 md:py-12`
- Component gaps: `space-y-4` or `gap-4`

**Responsive Design**:

- Mobile-first approach
- Breakpoints: `md:` (768px), `lg:` (1024px), `xl:` (1280px)

### Database Schema

DuckDB tables:

- `benchmark_runs` - Core benchmark execution tracking
- `model_responses` - Individual model response data with metrics
- `models` - Cached model information from OpenRouter
- `benchmark_templates` - Reusable benchmark configurations

### Key Implementation Notes

1. **OpenRouter Integration**: All LLM interactions go through OpenRouter's unified API. Handle rate limiting, retries, and streaming responses.

2. **File Processing**: Support image uploads (JPEG, PNG, WebP) with Base64 encoding and PDF processing for document benchmarks.

3. **Real-time Updates**: Use Server-Sent Events for benchmark progress and streaming responses.

4. **Environment Variables**:
   - `OPENROUTER_API_KEY` - Required for API access
   - `DATABASE_PATH` - DuckDB file location (defaults to `data/hra42.duckdb`)

5. **Performance Considerations**:
   - Implement lazy loading for historical data
   - Use virtual scrolling for large result lists
   - Cache model information to reduce API calls

### Benchmark Types

The application supports five benchmark types:

1. **Text Generation** - Simple prompt/response comparison
2. **Structured Output** - JSON schema compliance testing
3. **Tool/Function Calling** - Function definition and execution
4. **Vision Analysis** - Image understanding capabilities
5. **Document Processing** - PDF text extraction and analysis

Each benchmark type has specific UI components and validation logic in the corresponding organism components.
