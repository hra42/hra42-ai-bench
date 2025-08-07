<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '$lib/components/molecules/ThemeToggle.svelte';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-slate-900 transition-colors">
	<nav class="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-8">
					<a href="/" class="text-xl font-bold text-slate-900 dark:text-white">
						HRA42 Bench
					</a>
					
					<div class="hidden md:flex items-center gap-6">
						<a 
							href="/" 
							class="text-sm font-medium transition-colors"
							class:text-blue-600={$page.url.pathname === '/'}
							class:dark:text-blue-400={$page.url.pathname === '/'}
							class:text-slate-600={$page.url.pathname !== '/'}
							class:dark:text-slate-300={$page.url.pathname !== '/'}
							class:hover:text-slate-900={$page.url.pathname !== '/'}
							class:dark:hover:text-white={$page.url.pathname !== '/'}
						>
							Dashboard
						</a>
						<a 
							href="/benchmark" 
							class="text-sm font-medium transition-colors"
							class:text-blue-600={$page.url.pathname === '/benchmark'}
							class:dark:text-blue-400={$page.url.pathname === '/benchmark'}
							class:text-slate-600={$page.url.pathname !== '/benchmark'}
							class:dark:text-slate-300={$page.url.pathname !== '/benchmark'}
							class:hover:text-slate-900={$page.url.pathname !== '/benchmark'}
							class:dark:hover:text-white={$page.url.pathname !== '/benchmark'}
						>
							Benchmark
						</a>
					</div>
				</div>
				
				<div class="flex items-center gap-4">
					<ThemeToggle />
				</div>
			</div>
		</div>
	</nav>
	
	<main class="flex-1">
		{@render children?.()}
	</main>
</div>