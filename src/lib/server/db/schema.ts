export const createSchema = `
-- Models table for caching OpenRouter model information
CREATE TABLE IF NOT EXISTS models (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  context_length INTEGER,
  pricing_prompt DOUBLE,
  pricing_completion DOUBLE,
  top_provider VARCHAR,
  supports_tools BOOLEAN DEFAULT false,
  supports_vision BOOLEAN DEFAULT false,
  supports_json_output BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Benchmark templates for reusable configurations
CREATE TABLE IF NOT EXISTS benchmark_templates (
  id VARCHAR PRIMARY KEY DEFAULT (gen_random_uuid()::VARCHAR),
  name VARCHAR NOT NULL,
  description TEXT,
  benchmark_type VARCHAR NOT NULL CHECK (benchmark_type IN ('text', 'structured', 'tool', 'vision', 'document')),
  system_prompt TEXT,
  user_prompt TEXT,
  json_schema TEXT,
  tool_definitions TEXT,
  expected_output TEXT,
  evaluation_criteria TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Benchmark runs tracking
CREATE TABLE IF NOT EXISTS benchmark_runs (
  id VARCHAR PRIMARY KEY DEFAULT (gen_random_uuid()::VARCHAR),
  name VARCHAR NOT NULL,
  description TEXT,
  benchmark_type VARCHAR NOT NULL CHECK (benchmark_type IN ('text', 'structured', 'tool', 'vision', 'document')),
  template_id VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_models INTEGER DEFAULT 0,
  completed_models INTEGER DEFAULT 0,
  system_prompt TEXT,
  user_prompt TEXT,
  json_schema TEXT,
  tool_definitions TEXT,
  max_tokens INTEGER,
  temperature DECIMAL(3, 2),
  total_cost DOUBLE DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model responses for each benchmark run
CREATE TABLE IF NOT EXISTS model_responses (
  id VARCHAR PRIMARY KEY DEFAULT (gen_random_uuid()::VARCHAR),
  run_id VARCHAR NOT NULL,
  model_id VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'error')),
  response_text TEXT,
  response_json TEXT,
  tool_calls TEXT,
  error_message TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost DOUBLE,
  latency_ms INTEGER,
  openrouter_latency_ms INTEGER,
  generation_time_ms INTEGER,
  moderation_latency_ms INTEGER,
  time_to_first_token_ms INTEGER,
  tokens_per_second DECIMAL(10, 2),
  evaluation_score DECIMAL(5, 2),
  evaluation_notes TEXT,
  metadata TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_status ON benchmark_runs(status);
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_created_at ON benchmark_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_responses_run_id ON model_responses(run_id);
CREATE INDEX IF NOT EXISTS idx_model_responses_model_id ON model_responses(model_id);
CREATE INDEX IF NOT EXISTS idx_model_responses_status ON model_responses(status);

-- View for benchmark results summary
CREATE OR REPLACE VIEW benchmark_results_summary AS
SELECT 
  br.id as run_id,
  br.name as run_name,
  br.benchmark_type,
  br.status as run_status,
  m.name as model_name,
  m.id as model_id,
  mr.status as response_status,
  mr.cost,
  mr.latency_ms,
  mr.total_tokens,
  mr.tokens_per_second,
  mr.evaluation_score,
  br.created_at as run_created_at,
  mr.completed_at as response_completed_at
FROM benchmark_runs br
JOIN model_responses mr ON br.id = mr.run_id
JOIN models m ON mr.model_id = m.id
ORDER BY br.created_at DESC, mr.evaluation_score DESC;
`;
