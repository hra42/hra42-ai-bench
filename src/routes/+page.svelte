<script lang="ts">
  import Button from '$lib/components/atoms/Button.svelte';
  import Card from '$lib/components/atoms/Card.svelte';
  import Badge from '$lib/components/atoms/Badge.svelte';
</script>

<div class="min-h-screen bg-slate-50">
  <div class="container mx-auto px-4 py-8 md:py-12">
    <div class="max-w-4xl mx-auto">
      <Card>
        <div class="text-center space-y-4">
          <h1 class="text-4xl font-bold text-slate-900">HRA42 AI Benchmark</h1>
          <p class="text-lg text-slate-600">
            Comprehensive benchmarking platform for AI models
          </p>
          
          <div class="flex justify-center gap-2 py-4">
            <Badge variant="success">Phase 1: Foundation</Badge>
            <Badge variant="info">In Development</Badge>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
            <Card padding="sm" shadow="sm">
              <h3 class="font-semibold text-slate-900 mb-2">✅ SvelteKit Setup</h3>
              <p class="text-sm text-slate-600">TypeScript configured</p>
            </Card>
            
            <Card padding="sm" shadow="sm">
              <h3 class="font-semibold text-slate-900 mb-2">✅ Tailwind CSS v4</h3>
              <p class="text-sm text-slate-600">Utility-first styling ready</p>
            </Card>
            
            <Card padding="sm" shadow="sm">
              <h3 class="font-semibold text-slate-900 mb-2">✅ DuckDB Integration</h3>
              <p class="text-sm text-slate-600">Database schema created</p>
            </Card>
            
            <Card padding="sm" shadow="sm">
              <h3 class="font-semibold text-slate-900 mb-2">✅ Component Library</h3>
              <p class="text-sm text-slate-600">Atomic design system</p>
            </Card>
            
            <Card padding="sm" shadow="sm">
              <h3 class="font-semibold text-slate-900 mb-2">✅ OpenRouter Client</h3>
              <p class="text-sm text-slate-600">API integration ready</p>
            </Card>
            
            <Card padding="sm" shadow="sm">
              <h3 class="font-semibold text-slate-900 mb-2">✅ Database Schema</h3>
              <p class="text-sm text-slate-600">Tables and indexes created</p>
            </Card>
          </div>
          
          <div class="flex justify-center gap-4">
            <a href="/benchmark">
              <Button>Start Benchmarking</Button>
            </a>
            <a href="/history">
              <Button variant="secondary">View History</Button>
            </a>
          </div>
        </div>
      </Card>
    </div>
  </div>
</div>
