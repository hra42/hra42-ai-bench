# Architecture Documentation

## System Overview

HRA42 AI Bench is built as a full-stack web application using SvelteKit, providing a unified platform for benchmarking Large Language Models through OpenRouter's API.

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Web UI - SvelteKit]
        Stores[Svelte Stores]
    end

    subgraph "API Layer"
        API[SvelteKit API Routes]
        SSE[Server-Sent Events]
    end

    subgraph "Service Layer"
        OR[OpenRouter Client]
        DB[DuckDB Client]
        FileProc[File Processor]
    end

    subgraph "External Services"
        OpenRouter[OpenRouter API]
    end

    subgraph "Data Layer"
        DuckDB[(DuckDB)]
        Files[File Storage]
    end

    UI --> Stores
    Stores --> API
    API --> SSE
    API --> OR
    API --> DB
    API --> FileProc
    OR --> OpenRouter
    DB --> DuckDB
    FileProc --> Files
```

## Component Architecture

### Frontend Architecture

```mermaid
graph TD
    subgraph "Pages"
        Home[Home/Dashboard]
        Benchmark[Benchmark Page]
        History[History Page]
    end

    subgraph "Templates"
        BenchTemplate[BenchmarkingInterface]
        HistTemplate[HistoryView]
        DashTemplate[DashboardView]
    end

    subgraph "Organisms"
        Config[BenchmarkConfigurator]
        Grid[ModelComparisonGrid]
        Runner[BenchmarkRunner]
        Table[HistoryTable]
    end

    subgraph "Molecules"
        ModelSel[ModelSelector]
        CostDisp[CostDisplay]
        FileUp[FileUploader]
        MetricCard[MetricCard]
    end

    subgraph "Atoms"
        Button[Button]
        Input[Input]
        Card[Card]
        Badge[Badge]
    end

    Home --> DashTemplate
    Benchmark --> BenchTemplate
    History --> HistTemplate

    BenchTemplate --> Config
    BenchTemplate --> Grid
    BenchTemplate --> Runner

    HistTemplate --> Table

    Config --> ModelSel
    Config --> FileUp
    Grid --> MetricCard
    Grid --> CostDisp

    ModelSel --> Button
    ModelSel --> Input
    CostDisp --> Badge
    MetricCard --> Card
```

### Backend Architecture

```mermaid
graph LR
    subgraph "API Routes"
        Models[/api/models]
        Execute[/api/execute]
        Results[/api/results]
        Export[/api/export]
    end

    subgraph "Services"
        ModelService[Model Service]
        BenchmarkService[Benchmark Service]
        ResultService[Result Service]
        ExportService[Export Service]
    end

    subgraph "Data Access"
        DBClient[DuckDB Client]
        ORClient[OpenRouter Client]
    end

    Models --> ModelService
    Execute --> BenchmarkService
    Results --> ResultService
    Export --> ExportService

    ModelService --> ORClient
    ModelService --> DBClient
    BenchmarkService --> ORClient
    BenchmarkService --> DBClient
    ResultService --> DBClient
    ExportService --> DBClient
```

## Data Flow

### Benchmark Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant SSE
    participant OpenRouter
    participant DuckDB

    User->>UI: Configure Benchmark
    UI->>API: POST /api/execute
    API->>DuckDB: Create benchmark_run
    API->>UI: Return runId

    UI->>SSE: Connect to stream

    loop For each model
        API->>OpenRouter: Send prompt
        OpenRouter-->>API: Stream response
        API-->>SSE: Stream chunks
        SSE-->>UI: Update display
        API->>DuckDB: Save response
    end

    API->>DuckDB: Update run status
    API-->>SSE: Send complete event
    SSE-->>UI: Show final results
```

### File Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant FileProcessor
    participant Storage

    User->>UI: Upload file
    UI->>UI: Validate file type/size
    UI->>API: Send file data
    API->>FileProcessor: Process file

    alt Image File
        FileProcessor->>FileProcessor: Convert to Base64
        FileProcessor->>API: Return encoded data
    else PDF File
        FileProcessor->>FileProcessor: Extract text
        FileProcessor->>FileProcessor: Parse structure
        FileProcessor->>API: Return extracted data
    end

    API->>Storage: Store temporarily
    API->>UI: Return file reference
```

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    BENCHMARK_RUNS ||--o{ MODEL_RESPONSES : contains
    BENCHMARK_RUNS ||--o| BENCHMARK_TEMPLATES : uses
    MODELS ||--o{ MODEL_RESPONSES : generates

    BENCHMARK_RUNS {
        text id PK
        text type
        text prompt
        json config
        text status
        timestamp created_at
        timestamp completed_at
        text template_id FK
    }

    MODEL_RESPONSES {
        text id PK
        text run_id FK
        text model_id FK
        text response
        integer prompt_tokens
        integer completion_tokens
        decimal cost
        integer latency_ms
        text error
        json metadata
        timestamp created_at
    }

    MODELS {
        text id PK
        text name
        text provider
        integer context_length
        json pricing
        json capabilities
        timestamp updated_at
    }

    BENCHMARK_TEMPLATES {
        text id PK
        text name
        text description
        text type
        json config
        timestamp created_at
    }
```

### Table Details

#### benchmark_runs

- **Purpose**: Track benchmark execution sessions
- **Indexes**: `created_at`, `type`, `status`
- **Partitioning**: Monthly by `created_at`

#### model_responses

- **Purpose**: Store individual model responses and metrics
- **Indexes**: `run_id`, `model_id`, `created_at`
- **Constraints**: Foreign key to `benchmark_runs`

#### models

- **Purpose**: Cache model information from OpenRouter
- **Indexes**: `provider`, `updated_at`
- **Update frequency**: Daily

#### benchmark_templates

- **Purpose**: Store reusable benchmark configurations
- **Indexes**: `type`, `created_at`

## State Management

### Store Architecture

```mermaid
graph TD
    subgraph "Application Stores"
        BenchmarkStore[benchmark.ts]
        ResultStore[results.ts]
        ModelStore[models.ts]
        UIStore[ui.ts]
    end

    subgraph "Store State"
        BenchConfig[Benchmark Config]
        ActiveRun[Active Run]
        Results[Results Cache]
        ModelList[Model List]
        UIState[UI State]
    end

    BenchmarkStore --> BenchConfig
    BenchmarkStore --> ActiveRun
    ResultStore --> Results
    ModelStore --> ModelList
    UIStore --> UIState
```

### State Flow

```typescript
// Benchmark configuration flow
benchmarkStore.set({
  type: 'text',
  models: ['gpt-4', 'claude-3'],
  prompt: 'Test prompt',
  config: { temperature: 0.7 }
})
↓
// Execution triggers
resultStore.startRun(runId)
↓
// Real-time updates
resultStore.updateModelResponse(modelId, chunk)
↓
// Completion
resultStore.completeRun(summary)
```

## Security Architecture

### Authentication & Authorization

```mermaid
graph TD
    subgraph "Security Layers"
        ENV[Environment Variables]
        ServerAuth[Server-side Auth]
        RateLimit[Rate Limiting]
        InputVal[Input Validation]
    end

    subgraph "Protected Resources"
        ORAPI[OpenRouter API]
        DB[Database]
        Files[File System]
    end

    ENV --> ServerAuth
    ServerAuth --> ORAPI
    ServerAuth --> DB
    RateLimit --> ORAPI
    InputVal --> Files
```

### Security Measures

1. **API Key Management**
   - Server-side only storage
   - Environment variable configuration
   - Never exposed to client

2. **Input Validation**
   - File type restrictions
   - Size limitations (20MB default)
   - Schema validation for structured inputs

3. **Rate Limiting**
   - Per-IP rate limiting
   - Model-specific limits
   - Exponential backoff

4. **Data Privacy**
   - Local database storage
   - No external data transmission
   - Temporary file cleanup

## Performance Optimization

### Caching Strategy

```mermaid
graph LR
    subgraph "Cache Layers"
        ModelCache[Model Info Cache]
        ResultCache[Result Cache]
        FileCache[File Cache]
    end

    subgraph "Cache Policies"
        TTL[TTL: 24 hours]
        LRU[LRU Eviction]
        Size[Size Limits]
    end

    ModelCache --> TTL
    ResultCache --> LRU
    FileCache --> Size
```

### Optimization Techniques

1. **Frontend Optimizations**
   - Lazy loading for history
   - Virtual scrolling for large lists
   - Debounced search inputs
   - Component code splitting

2. **Backend Optimizations**
   - Batch database operations
   - Connection pooling
   - Streaming responses
   - Efficient query indexing

3. **Network Optimizations**
   - Server-Sent Events for real-time updates
   - Compression for API responses
   - CDN for static assets
   - HTTP/2 support

## Deployment Architecture

### Container Architecture

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["node", "build"]
```

### Deployment Options

```mermaid
graph TD
    subgraph "Deployment Targets"
        Docker[Docker Container]
        K8s[Kubernetes]
        Cloud[Cloud Platforms]
    end

    subgraph "Infrastructure"
        LB[Load Balancer]
        App[App Instances]
        DB[DuckDB Volume]
        Storage[File Storage]
    end

    Docker --> App
    K8s --> LB
    LB --> App
    App --> DB
    App --> Storage
    Cloud --> K8s
```

## Monitoring & Observability

### Metrics Collection

```mermaid
graph LR
    subgraph "Metrics"
        AppMetrics[Application Metrics]
        APIMetrics[API Metrics]
        DBMetrics[Database Metrics]
    end

    subgraph "Collection"
        Prometheus[Prometheus]
        Grafana[Grafana]
        Logs[Log Aggregation]
    end

    AppMetrics --> Prometheus
    APIMetrics --> Prometheus
    DBMetrics --> Prometheus
    Prometheus --> Grafana
    AppMetrics --> Logs
```

### Key Metrics

1. **Application Metrics**
   - Request rate
   - Response time
   - Error rate
   - Active users

2. **Benchmark Metrics**
   - Execution time
   - Success rate
   - Model performance
   - Cost per run

3. **System Metrics**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

## Scalability Considerations

### Horizontal Scaling

```mermaid
graph LR
    subgraph "Load Balancer"
        LB[HAProxy/Nginx]
    end

    subgraph "Application Tier"
        App1[Instance 1]
        App2[Instance 2]
        App3[Instance N]
    end

    subgraph "Data Tier"
        DuckDB1[DuckDB Primary]
        DuckDB2[DuckDB Replica]
    end

    LB --> App1
    LB --> App2
    LB --> App3

    App1 --> DuckDB1
    App2 --> DuckDB1
    App3 --> DuckDB1

    DuckDB1 -.-> DuckDB2
```

### Scaling Strategies

1. **Application Scaling**
   - Stateless design
   - Session affinity for SSE
   - Shared file storage
   - Database connection pooling

2. **Database Scaling**
   - Read replicas
   - Query optimization
   - Index management
   - Partitioning strategy

3. **API Scaling**
   - Rate limiting
   - Request queuing
   - Caching layer
   - CDN integration

## Technology Decisions

### Why SvelteKit?

- **Full-stack framework**: API routes + UI in one
- **Performance**: Compiled, no virtual DOM
- **Developer experience**: Simple, intuitive API
- **TypeScript**: First-class support
- **SSR/SSG**: Flexible rendering options

### Why DuckDB?

- **Embedded database**: No separate service
- **OLAP optimized**: Perfect for analytics
- **SQL interface**: Familiar querying
- **Performance**: Columnar storage, vectorized execution
- **Portability**: Single file database

### Why Tailwind CSS?

- **Consistency**: Design system constraints
- **Performance**: PurgeCSS removes unused styles
- **Maintainability**: No custom CSS to manage
- **Responsive**: Mobile-first utilities
- **Customization**: Easy theming

### Why OpenRouter?

- **Unified API**: Single integration for all models
- **Model variety**: Access to 100+ models
- **Pricing transparency**: Clear cost structure
- **Reliability**: Built-in fallbacks
- **Features**: Streaming, function calling support

## Future Architecture Considerations

### Planned Enhancements

1. **Microservices Migration**
   - Separate benchmark executor service
   - Independent result processor
   - Dedicated export service

2. **Event-Driven Architecture**
   - Message queue for benchmark jobs
   - Event sourcing for audit trail
   - WebSocket for real-time updates

3. **Advanced Analytics**
   - Time-series database for metrics
   - ML-based quality scoring
   - Automated benchmark recommendations

4. **Multi-tenancy**
   - User authentication system
   - Organization management
   - Role-based access control
   - Usage quotas

5. **Plugin System**
   - Custom benchmark types
   - Model provider plugins
   - Export format plugins
   - UI theme plugins
