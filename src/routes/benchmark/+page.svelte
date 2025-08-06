<script lang="ts">
  import ModelSelector from '$lib/components/molecules/ModelSelector.svelte';
  import BenchmarkRunner from '$lib/components/organisms/BenchmarkRunner.svelte';
  import ResultsGrid from '$lib/components/organisms/ResultsGrid.svelte';
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-slate-900">Benchmark LLMs</h1>
    <p class="text-slate-600 mt-2">Compare multiple language models side-by-side with real-time streaming</p>
  </div>

  <div class="grid gap-6 lg:grid-cols-3">
    <!-- Left Column: Model Selection and Configuration -->
    <div class="lg:col-span-1 space-y-6">
      <ModelSelector />
      <BenchmarkRunner />
    </div>

    <!-- Right Column: Results -->
    <div class="lg:col-span-2">
      <ResultsGrid />
    </div>
  </div>
</div>

<style>
  .container {
    min-height: calc(100vh - 4rem);
  }
</style>