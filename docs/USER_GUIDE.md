# User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Benchmark Types](#benchmark-types)
3. [Model Selection](#model-selection)
4. [Running Benchmarks](#running-benchmarks)
5. [Analyzing Results](#analyzing-results)
6. [Advanced Features](#advanced-features)
7. [Tips & Best Practices](#tips--best-practices)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### First-Time Setup

1. **Access the Application**
   - Open your browser and navigate to the application URL
   - The dashboard will load automatically

2. **Verify API Connection**
   - Check the status indicator in the top-right corner
   - Green = Connected to OpenRouter
   - Red = Connection issue (check API key)

3. **Explore Available Models**
   - Navigate to the Benchmark page
   - Click the model selector dropdown
   - Browse available models and their capabilities

### Understanding the Interface

```
┌─────────────────────────────────────────┐
│  🏠 Dashboard  📊 Benchmark  📈 History │  <- Navigation
├─────────────────────────────────────────┤
│                                         │
│  [Benchmark Configuration Area]         │  <- Setup
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [Results Display Area]                 │  <- Output
│                                         │
└─────────────────────────────────────────┘
```

## Benchmark Types

### 📝 Text Generation

**Purpose**: Compare how models respond to open-ended prompts

**Use Cases**:
- Creative writing evaluation
- Instruction following
- General knowledge testing
- Reasoning capabilities

**Configuration**:
```
1. Select "Text Generation" tab
2. Enter your prompt
3. Optional: Add system prompt
4. Adjust parameters:
   - Temperature (0-2): Creativity level
   - Max Tokens: Response length limit
   - Top P: Nucleus sampling
```

**Example Prompts**:
- "Write a haiku about artificial intelligence"
- "Explain the water cycle to a 5-year-old"
- "List 5 innovative uses for paperclips"

### 🔧 Structured Output

**Purpose**: Test JSON generation and schema compliance

**Use Cases**:
- API response generation
- Data extraction
- Form filling
- Structured data creation

**Configuration**:
```
1. Select "Structured Output" tab
2. Define your JSON schema
3. Enter a prompt describing desired output
4. Enable strict mode for validation
```

**Example Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "age": {"type": "number"},
    "skills": {
      "type": "array",
      "items": {"type": "string"}
    }
  },
  "required": ["name", "age"]
}
```

### 🛠️ Function Calling

**Purpose**: Evaluate function understanding and execution

**Use Cases**:
- Tool use testing
- API integration
- Workflow automation
- Agent capabilities

**Configuration**:
```
1. Select "Function Calling" tab
2. Define available functions
3. Enter a prompt requiring function use
4. Review function call sequences
```

**Example Function**:
```json
{
  "name": "get_weather",
  "description": "Get weather for a location",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {"type": "string"},
      "units": {"enum": ["celsius", "fahrenheit"]}
    }
  }
}
```

### 🖼️ Vision Analysis

**Purpose**: Compare image understanding capabilities

**Use Cases**:
- Image description
- Object detection
- OCR capabilities
- Visual reasoning

**Configuration**:
```
1. Select "Vision Analysis" tab
2. Upload image (drag & drop or click)
3. Enter analysis prompt
4. Select vision-capable models only
```

**Supported Formats**:
- JPEG/JPG (up to 20MB)
- PNG (up to 20MB)
- WebP (up to 20MB)
- GIF (first frame only)

### 📄 Document Processing

**Purpose**: Test PDF understanding and extraction

**Use Cases**:
- Document summarization
- Information extraction
- Table parsing
- Contract analysis

**Configuration**:
```
1. Select "Document Processing" tab
2. Upload PDF document
3. Enter processing instructions
4. Choose extraction type
```

**Limitations**:
- Max 50 pages
- Text-based PDFs work best
- Scanned documents may have issues

## Model Selection

### Understanding Model Categories

#### Provider Groups
- **OpenAI**: GPT-4, GPT-3.5
- **Anthropic**: Claude 3 family
- **Google**: Gemini models
- **Meta**: Llama models
- **Mistral**: Mistral/Mixtral
- **Others**: Specialized models

#### Capability Indicators
- 💬 **Text**: Basic text generation
- 🎯 **JSON**: Structured output support
- 🔧 **Functions**: Function calling capable
- 👁️ **Vision**: Image understanding
- 📄 **Documents**: Enhanced document processing

### Selection Strategy

#### For Best Quality
```
1. Select top-tier models:
   - GPT-4 Turbo
   - Claude 3 Opus
   - Gemini Pro 1.5
2. Use lower temperature (0.3-0.5)
3. Increase max tokens
```

#### For Cost Efficiency
```
1. Select efficient models:
   - GPT-3.5 Turbo
   - Claude 3 Haiku
   - Mistral 7B
2. Limit max tokens
3. Use precise prompts
```

#### For Speed
```
1. Select fast models:
   - GPT-3.5 Turbo
   - Claude Instant
   - Smaller open models
2. Reduce max tokens
3. Enable streaming
```

### Model Comparison Matrix

| Feature | GPT-4 | Claude 3 | Gemini | Llama 3 |
|---------|-------|----------|--------|---------|
| Context | 128K | 200K | 1M | 8K |
| Vision | ✅ | ✅ | ✅ | ❌ |
| Functions | ✅ | ✅ | ✅ | Limited |
| JSON Mode | ✅ | ✅ | ✅ | ❌ |
| Speed | Medium | Fast | Medium | Fast |
| Cost | High | Medium | Medium | Low |

## Running Benchmarks

### Step-by-Step Process

#### 1. Preparation
```
✓ Choose benchmark type
✓ Select 2-5 models for comparison
✓ Prepare your prompt/files
✓ Configure parameters
✓ Review estimated costs
```

#### 2. Execution
```
1. Click "Execute Benchmark"
2. Monitor real-time progress
3. Watch streaming responses
4. Check for errors
5. Wait for completion
```

#### 3. During Execution
- **Progress Bar**: Shows overall completion
- **Model Cards**: Individual model status
- **Streaming Text**: Live response updates
- **Metrics**: Real-time token counts
- **Abort Button**: Cancel if needed

### Configuration Parameters

#### Temperature (0.0 - 2.0)
- **0.0**: Deterministic, consistent
- **0.7**: Balanced creativity (default)
- **1.5**: Very creative, varied
- **2.0**: Maximum randomness

#### Max Tokens
- **Short**: 100-200 (quick responses)
- **Medium**: 500-1000 (detailed answers)
- **Long**: 2000-4000 (extensive content)
- **Maximum**: Model-specific limit

#### Top P (0.0 - 1.0)
- **0.1**: Very focused
- **0.9**: Diverse vocabulary
- **1.0**: Consider all options

#### Frequency Penalty (-2.0 to 2.0)
- **-2.0**: Allow repetition
- **0.0**: Neutral (default)
- **2.0**: Avoid repetition

## Analyzing Results

### Result Components

#### Response Quality
- **Relevance**: Does it answer the prompt?
- **Accuracy**: Is information correct?
- **Completeness**: Is response thorough?
- **Coherence**: Is it well-structured?

#### Performance Metrics
- **Latency**: Time to first token (ms)
- **Speed**: Tokens per second
- **Total Time**: End-to-end duration
- **Token Usage**: Prompt + completion

#### Cost Analysis
- **Input Cost**: Prompt token charges
- **Output Cost**: Completion token charges
- **Total Cost**: Combined pricing
- **Cost/Token**: Efficiency metric

### Comparison Views

#### Side-by-Side View
```
┌──────────┬──────────┬──────────┐
│  Model A │  Model B │  Model C │
├──────────┼──────────┼──────────┤
│ Response │ Response │ Response │
│   Text   │   Text   │   Text   │
├──────────┼──────────┼──────────┤
│ Metrics  │ Metrics  │ Metrics  │
└──────────┴──────────┴──────────┘
```

#### Unified View
- All responses in single column
- Color-coded by model
- Sortable by metric

#### Diff View
- Highlight differences
- Show unique content
- Identify commonalities

### Interpreting Metrics

#### Response Time Analysis
```
Fast: < 500ms    - Excellent
Good: 500-1500ms - Acceptable
Slow: > 1500ms   - May impact UX
```

#### Token Efficiency
```
Efficient: < 1.5x prompt length
Normal: 1.5-3x prompt length
Verbose: > 3x prompt length
```

#### Cost Effectiveness
```
Budget: < $0.01 per request
Standard: $0.01-0.10 per request
Premium: > $0.10 per request
```

## Advanced Features

### Benchmark Templates

#### Creating Templates
```
1. Configure a benchmark
2. Click "Save as Template"
3. Name your template
4. Add description
5. Use across sessions
```

#### Using Templates
```
1. Click "Load Template"
2. Select from saved templates
3. Modify if needed
4. Execute benchmark
```

#### Sharing Templates
```
1. Export template as JSON
2. Share with team
3. Import on other instances
```

### Batch Processing

#### Running Multiple Prompts
```
1. Prepare prompt list (CSV/JSON)
2. Upload to batch interface
3. Select models and config
4. Execute batch run
5. Download results
```

#### Scheduling Benchmarks
```
1. Configure benchmark
2. Set schedule (hourly/daily)
3. Enable notifications
4. Review automated results
```

### Data Export

#### Export Formats
- **CSV**: Spreadsheet analysis
- **JSON**: Programmatic processing
- **PDF**: Reports and documentation
- **Markdown**: Documentation

#### Export Options
```
✓ Include responses
✓ Include metrics
✓ Include configuration
✓ Include timestamps
✓ Include costs
```

### Historical Analysis

#### Trend Detection
```
1. Navigate to History
2. Select date range
3. Choose metrics to track
4. View trend charts
5. Identify patterns
```

#### Performance Tracking
- Model improvements over time
- Cost trends
- Response time changes
- Quality variations

## Tips & Best Practices

### Prompt Engineering

#### Be Specific
```
❌ "Tell me about dogs"
✅ "Write a 200-word summary of golden retriever characteristics, focusing on temperament and care requirements"
```

#### Provide Context
```
❌ "Analyze this"
✅ "As a data scientist, analyze this sales data and identify three key trends"
```

#### Use Examples
```
❌ "Format nicely"
✅ "Format as bullet points, like:
    • Point 1: Description
    • Point 2: Description"
```

### Cost Optimization

#### Strategies
1. **Test with smaller models first**
2. **Use appropriate max tokens**
3. **Batch similar requests**
4. **Cache common responses**
5. **Monitor usage regularly**

#### Budget Alerts
```
1. Set daily/monthly limits
2. Configure email alerts
3. Auto-pause at threshold
4. Review cost reports
```

### Performance Optimization

#### Speed Tips
- Use streaming for long responses
- Select geographically closer models
- Reduce max tokens when possible
- Avoid peak usage times
- Enable response caching

#### Quality Tips
- Use system prompts effectively
- Provide clear instructions
- Include relevant examples
- Specify output format
- Use appropriate temperature

## Troubleshooting

### Common Issues

#### "Model not available"
**Causes**:
- Model deprecated
- Regional restrictions
- Temporary outage

**Solutions**:
1. Refresh model list
2. Check model status page
3. Select alternative model
4. Contact support

#### "Benchmark stuck"
**Causes**:
- Network timeout
- Model overload
- Large request

**Solutions**:
1. Wait 2-3 minutes
2. Click abort and retry
3. Reduce request size
4. Try different model

#### "Invalid response format"
**Causes**:
- Model limitations
- Incorrect schema
- Prompt issues

**Solutions**:
1. Simplify schema
2. Add format examples
3. Use JSON-capable models
4. Enable strict mode

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `RATE_LIMITED` | Too many requests | Wait and retry |
| `INVALID_API_KEY` | Authentication failed | Check API key |
| `MODEL_ERROR` | Model failed | Try different model |
| `TIMEOUT` | Request took too long | Reduce complexity |
| `INSUFFICIENT_QUOTA` | Out of credits | Add credits |

### Getting Help

#### Documentation
- Check this user guide
- Review API documentation
- Read architecture docs
- Browse FAQ section

#### Support Channels
- GitHub Issues: Bug reports
- GitHub Discussions: Questions
- Email Support: Direct help
- Community Discord: Real-time chat

### Performance Tips

#### Slow Loading
1. Clear browser cache
2. Check network connection
3. Disable browser extensions
4. Try different browser
5. Report persistent issues

#### Export Problems
1. Check file size limits
2. Verify export permissions
3. Try different format
4. Export smaller batches
5. Check disk space

#### Display Issues
1. Refresh the page
2. Check browser compatibility
3. Update browser version
4. Disable ad blockers
5. Report rendering bugs