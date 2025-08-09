# API Documentation

## Overview

The HRA42 AI Bench API provides RESTful endpoints for managing benchmarks, executing model comparisons, and retrieving results. All API endpoints are prefixed with `/api` and return JSON responses unless otherwise specified.

## Authentication

Currently, the API uses OpenRouter API keys for authentication. The key should be configured in environment variables and is handled server-side.

## Base URL

```
http://localhost:5173/api  # Development
https://your-domain.com/api  # Production
```

## Endpoints

### Models

#### GET /api/models

Fetch all available models from OpenRouter.

**Response:**
```json
{
  "models": [
    {
      "id": "openai/gpt-4",
      "name": "GPT-4",
      "description": "OpenAI's most capable model",
      "contextLength": 8192,
      "pricing": {
        "prompt": 0.03,
        "completion": 0.06,
        "image": 0.01,
        "request": 0
      },
      "topProvider": {
        "contextLength": 8192,
        "maxCompletionTokens": 4096,
        "isModerated": false
      },
      "architecture": {
        "modality": "text",
        "tokenizer": "GPT",
        "instructType": "none"
      }
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Failed to fetch models

#### GET /api/models/:modelId

Get details for a specific model.

**Parameters:**
- `modelId` (path) - The model identifier (e.g., "openai/gpt-4")

**Response:**
```json
{
  "id": "openai/gpt-4",
  "name": "GPT-4",
  "contextLength": 8192,
  "pricing": {
    "prompt": 0.03,
    "completion": 0.06
  },
  "capabilities": {
    "vision": false,
    "functionCalling": true,
    "jsonMode": true
  }
}
```

### Benchmark Execution

#### POST /api/execute

Execute a benchmark run across multiple models.

**Request Body:**
```json
{
  "type": "text",
  "models": ["openai/gpt-4", "anthropic/claude-3-opus"],
  "prompt": "Explain quantum computing",
  "systemPrompt": "You are a helpful assistant",
  "config": {
    "temperature": 0.7,
    "maxTokens": 500,
    "topP": 1.0,
    "stream": false
  },
  "files": [
    {
      "type": "image",
      "data": "base64_encoded_image_data",
      "mimeType": "image/png"
    }
  ]
}
```

**Response:**
```json
{
  "runId": "run_abc123",
  "status": "pending",
  "models": ["openai/gpt-4", "anthropic/claude-3-opus"],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Benchmark initiated successfully
- `400 Bad Request` - Invalid request parameters
- `500 Internal Server Error` - Server error

#### GET /api/execute/stream

Stream benchmark execution results using Server-Sent Events.

**Query Parameters:**
- `runId` - The benchmark run ID
- `models` - Comma-separated list of model IDs

**Response:** Server-Sent Events stream

```
event: start
data: {"runId": "run_abc123", "status": "running"}

event: model_start
data: {"model": "openai/gpt-4", "status": "processing"}

event: model_chunk
data: {"model": "openai/gpt-4", "chunk": "Quantum computing is"}

event: model_complete
data: {
  "model": "openai/gpt-4",
  "response": "Full response text...",
  "metrics": {
    "promptTokens": 10,
    "completionTokens": 150,
    "totalTokens": 160,
    "latencyMs": 1234,
    "cost": 0.0048
  }
}

event: complete
data: {"runId": "run_abc123", "status": "completed"}
```

### Results

#### GET /api/results/:runId

Retrieve results for a specific benchmark run.

**Parameters:**
- `runId` (path) - The benchmark run identifier

**Response:**
```json
{
  "run": {
    "id": "run_abc123",
    "type": "text",
    "prompt": "Explain quantum computing",
    "status": "completed",
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:30:15Z"
  },
  "responses": [
    {
      "id": "resp_def456",
      "model": "openai/gpt-4",
      "response": "Quantum computing is...",
      "promptTokens": 10,
      "completionTokens": 150,
      "totalTokens": 160,
      "latencyMs": 1234,
      "cost": 0.0048,
      "error": null
    }
  ],
  "summary": {
    "totalCost": 0.0096,
    "averageLatency": 1500,
    "successRate": 1.0
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Run not found

#### GET /api/results

List all benchmark results with optional filtering.

**Query Parameters:**
- `limit` (number) - Maximum results to return (default: 50)
- `offset` (number) - Pagination offset (default: 0)
- `type` (string) - Filter by benchmark type
- `model` (string) - Filter by model
- `startDate` (string) - Filter by date range start (ISO 8601)
- `endDate` (string) - Filter by date range end (ISO 8601)
- `status` (string) - Filter by status (pending, running, completed, failed)

**Response:**
```json
{
  "results": [
    {
      "id": "run_abc123",
      "type": "text",
      "models": ["gpt-4", "claude-3"],
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z",
      "totalCost": 0.0096,
      "responseCount": 2
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### History & Analytics

#### GET /api/history

Retrieve historical benchmark data for analysis.

**Query Parameters:**
- `groupBy` (string) - Group results by: day, week, month
- `metrics` (string) - Comma-separated metrics: cost, latency, tokens
- `models` (string) - Comma-separated model IDs
- `startDate` (string) - Start date (ISO 8601)
- `endDate` (string) - End date (ISO 8601)

**Response:**
```json
{
  "history": [
    {
      "date": "2024-01-15",
      "metrics": {
        "totalRuns": 25,
        "totalCost": 1.25,
        "averageLatency": 1250,
        "totalTokens": 15000
      },
      "models": {
        "openai/gpt-4": {
          "runs": 10,
          "cost": 0.50,
          "averageLatency": 1100
        }
      }
    }
  ],
  "summary": {
    "totalRuns": 250,
    "totalCost": 12.50,
    "topModel": "openai/gpt-4",
    "trend": "increasing"
  }
}
```

#### GET /api/history/compare

Compare performance across models over time.

**Query Parameters:**
- `models` (string, required) - Comma-separated model IDs
- `metric` (string) - Metric to compare: cost, latency, quality
- `period` (string) - Time period: 7d, 30d, 90d

**Response:**
```json
{
  "comparison": {
    "models": ["openai/gpt-4", "anthropic/claude-3"],
    "metric": "latency",
    "data": [
      {
        "date": "2024-01-15",
        "openai/gpt-4": 1100,
        "anthropic/claude-3": 950
      }
    ]
  }
}
```

### Export

#### POST /api/export

Export benchmark results in various formats.

**Request Body:**
```json
{
  "format": "csv",
  "filters": {
    "runIds": ["run_abc123", "run_def456"],
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "models": ["openai/gpt-4"]
  },
  "includeResponses": true,
  "includeMetrics": true
}
```

**Response:**
- For JSON format: Returns JSON data directly
- For CSV format: Returns CSV file with appropriate headers
- For Excel format: Returns XLSX file as binary

**Headers:**
```
Content-Type: application/json | text/csv | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="benchmark_export_2024-01-15.csv"
```

#### GET /api/export/templates

Get available export templates.

**Response:**
```json
{
  "templates": [
    {
      "id": "basic",
      "name": "Basic Export",
      "description": "Essential benchmark data",
      "fields": ["id", "type", "models", "cost", "latency"]
    },
    {
      "id": "detailed",
      "name": "Detailed Export",
      "description": "Complete benchmark data with responses",
      "fields": ["id", "type", "models", "prompt", "responses", "metrics"]
    }
  ]
}
```

### Templates

#### GET /api/templates

List saved benchmark templates.

**Response:**
```json
{
  "templates": [
    {
      "id": "template_abc123",
      "name": "Creative Writing Test",
      "description": "Test creative writing capabilities",
      "type": "text",
      "config": {
        "prompt": "Write a short story about...",
        "temperature": 0.9,
        "maxTokens": 1000
      },
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

#### POST /api/templates

Save a new benchmark template.

**Request Body:**
```json
{
  "name": "JSON Generation Test",
  "description": "Test structured output generation",
  "type": "structured",
  "config": {
    "prompt": "Generate a user object",
    "schema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "age": {"type": "number"}
      }
    }
  }
}
```

**Response:**
```json
{
  "id": "template_xyz789",
  "name": "JSON Generation Test",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### DELETE /api/templates/:templateId

Delete a benchmark template.

**Parameters:**
- `templateId` (path) - The template identifier

**Response:**
```json
{
  "message": "Template deleted successfully"
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid model ID provided",
    "details": {
      "field": "models",
      "value": "invalid-model"
    }
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | API rate limit exceeded |
| `MODEL_ERROR` | Model API error |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Internal server error |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Global limit**: 1000 requests per hour
- **Benchmark execution**: 100 runs per hour
- **Model-specific limits**: Varies by provider

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1705320000
```

## Webhooks

Configure webhooks to receive notifications about benchmark events:

### POST /api/webhooks

Register a webhook endpoint.

**Request Body:**
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["benchmark.completed", "benchmark.failed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

- `benchmark.started` - Benchmark execution started
- `benchmark.completed` - Benchmark execution completed
- `benchmark.failed` - Benchmark execution failed
- `model.completed` - Individual model response completed
- `model.failed` - Individual model response failed

### Webhook Payload

```json
{
  "event": "benchmark.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "runId": "run_abc123",
    "type": "text",
    "models": ["gpt-4", "claude-3"],
    "status": "completed",
    "summary": {
      "totalCost": 0.0096,
      "averageLatency": 1500
    }
  }
}
```

## WebSocket Support

For real-time updates, connect to the WebSocket endpoint:

```javascript
const ws = new WebSocket('ws://localhost:5173/api/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Subscribe to benchmark updates
ws.send(JSON.stringify({
  action: 'subscribe',
  runId: 'run_abc123'
}));
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { BenchmarkClient } from '@hra42/ai-bench-sdk';

const client = new BenchmarkClient({
  baseUrl: 'http://localhost:5173/api',
  apiKey: process.env.OPENROUTER_API_KEY
});

// Execute benchmark
const result = await client.execute({
  type: 'text',
  models: ['gpt-4', 'claude-3'],
  prompt: 'Explain quantum computing',
  config: {
    temperature: 0.7,
    maxTokens: 500
  }
});

// Get results
const responses = await client.getResults(result.runId);
```

### Python

```python
from hra42_bench import BenchmarkClient

client = BenchmarkClient(
    base_url="http://localhost:5173/api",
    api_key=os.environ["OPENROUTER_API_KEY"]
)

# Execute benchmark
result = client.execute(
    type="text",
    models=["gpt-4", "claude-3"],
    prompt="Explain quantum computing",
    config={
        "temperature": 0.7,
        "max_tokens": 500
    }
)

# Stream results
for event in client.stream_results(result.run_id):
    print(f"Model: {event.model}, Status: {event.status}")
```

### cURL

```bash
# Get available models
curl http://localhost:5173/api/models

# Execute benchmark
curl -X POST http://localhost:5173/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "models": ["openai/gpt-4"],
    "prompt": "Hello, world!",
    "config": {
      "temperature": 0.7,
      "maxTokens": 100
    }
  }'

# Get results
curl http://localhost:5173/api/results/run_abc123

# Export results as CSV
curl -X POST http://localhost:5173/api/export \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "filters": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  }' \
  -o export.csv
```

## Best Practices

1. **Error Handling**: Always implement proper error handling for API responses
2. **Rate Limiting**: Respect rate limits and implement exponential backoff
3. **Streaming**: Use SSE for long-running benchmarks to get real-time updates
4. **Caching**: Cache model information to reduce API calls
5. **Batch Operations**: Use batch endpoints when comparing multiple models
6. **Pagination**: Always use pagination for large result sets
7. **Filtering**: Use specific filters to reduce response payload size

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Core benchmark execution endpoints
- Model management
- Result retrieval and export
- SSE streaming support

### v1.1.0 (2024-02-01)
- Added webhook support
- WebSocket real-time updates
- Template management
- Enhanced filtering options
- Batch operations