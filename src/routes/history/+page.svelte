<script lang="ts">
  import Card from '$lib/components/atoms/Card.svelte';
  import Button from '$lib/components/atoms/Button.svelte';
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-slate-900">Benchmark History</h1>
    <p class="text-slate-600 mt-2">View and analyze past benchmark results</p>
  </div>

  <Card class="p-8">
    <div class="text-center text-slate-500">
      <svg class="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-lg font-medium mb-2">No benchmark history yet</p>
      <p class="text-sm mb-6">Run your first benchmark to see results here</p>
      <a href="/benchmark">
        <Button variant="primary">Start First Benchmark</Button>
      </a>
    </div>
  </Card>
</div>