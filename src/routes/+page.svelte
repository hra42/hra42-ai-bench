<script lang="ts">
  import Button from '$lib/components/atoms/Button.svelte';
  import Card from '$lib/components/atoms/Card.svelte';
  import Badge from '$lib/components/atoms/Badge.svelte';
</script>

<div class="min-h-screen bg-slate-50">
  <div class="container mx-auto px-4 py-8 md:py-12">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-5xl font-bold text-slate-900 mb-4">HRA42 AI Bench</h1>
        <p class="text-xl text-slate-600">
          Compare and benchmark Large Language Models with real-time streaming
        </p>
        
        <div class="flex justify-center gap-2 mt-6">
          <Badge variant="success">Phase 1: Foundation ✓</Badge>
          <Badge variant="success">Phase 2: Core Benchmarking ✓</Badge>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2 mb-8">
        <Card class="p-6">
          <h2 class="text-xl font-semibold text-slate-900 mb-3">🚀 Start Benchmarking</h2>
          <p class="text-slate-600 mb-4">
            Compare multiple LLMs side-by-side with text generation and real-time streaming responses.
          </p>
          <a href="/benchmark" class="block">
            <Button variant="primary" class="w-full">Launch Benchmark</Button>
          </a>
        </Card>

        <Card class="p-6">
          <h2 class="text-xl font-semibold text-slate-900 mb-3">📊 View History</h2>
          <p class="text-slate-600 mb-4">
            Analyze past benchmark results and track model performance over time.
          </p>
          <a href="/history" class="block">
            <Button variant="secondary" class="w-full">Browse Results</Button>
          </a>
        </Card>
      </div>

      <Card class="p-6 mb-8">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">✨ Phase 2 Features Completed</h3>
        <div class="grid gap-3 md:grid-cols-2">
          <div class="flex items-start gap-2">
            <span class="text-green-500 mt-1">✓</span>
            <div>
              <p class="font-medium text-slate-900">Text Generation Benchmarking</p>
              <p class="text-sm text-slate-600">Compare responses across models</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-500 mt-1">✓</span>
            <div>
              <p class="font-medium text-slate-900">Model Selection Interface</p>
              <p class="text-sm text-slate-600">Search and filter OpenRouter models</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-500 mt-1">✓</span>
            <div>
              <p class="font-medium text-slate-900">Real-time Progress Updates</p>
              <p class="text-sm text-slate-600">Server-Sent Events for streaming</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-500 mt-1">✓</span>
            <div>
              <p class="font-medium text-slate-900">Cost Calculation</p>
              <p class="text-sm text-slate-600">Track token usage and expenses</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-500 mt-1">✓</span>
            <div>
              <p class="font-medium text-slate-900">Execution Pipeline</p>
              <p class="text-sm text-slate-600">Sequential model processing</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-500 mt-1">✓</span>
            <div>
              <p class="font-medium text-slate-900">Result Display</p>
              <p class="text-sm text-slate-600">Side-by-side comparison grid</p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-slate-900 mb-3">🔧 Technical Stack</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div class="text-center p-3 bg-slate-100 rounded">
            <p class="font-medium text-slate-900">SvelteKit</p>
            <p class="text-xs text-slate-600">Full-stack framework</p>
          </div>
          <div class="text-center p-3 bg-slate-100 rounded">
            <p class="font-medium text-slate-900">DuckDB</p>
            <p class="text-xs text-slate-600">Analytics database</p>
          </div>
          <div class="text-center p-3 bg-slate-100 rounded">
            <p class="font-medium text-slate-900">Tailwind CSS</p>
            <p class="text-xs text-slate-600">Utility-first styling</p>
          </div>
          <div class="text-center p-3 bg-slate-100 rounded">
            <p class="font-medium text-slate-900">TypeScript</p>
            <p class="text-xs text-slate-600">Type safety</p>
          </div>
          <div class="text-center p-3 bg-slate-100 rounded">
            <p class="font-medium text-slate-900">OpenRouter</p>
            <p class="text-xs text-slate-600">LLM API provider</p>
          </div>
          <div class="text-center p-3 bg-slate-100 rounded">
            <p class="font-medium text-slate-900">SSE</p>
            <p class="text-xs text-slate-600">Real-time updates</p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</div>
