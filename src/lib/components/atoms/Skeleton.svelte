<script lang="ts">
	export let variant: 'text' | 'circular' | 'rectangular' | 'rounded' = 'text';
	export let width = '100%';
	export let height = '1rem';
	export let animation: 'pulse' | 'wave' | 'none' = 'pulse';

	const variantClasses = {
		text: 'rounded',
		circular: 'rounded-full',
		rectangular: 'rounded-none',
		rounded: 'rounded-lg'
	};

	const animationClasses = {
		pulse: 'animate-pulse',
		wave: 'animate-shimmer',
		none: ''
	};
</script>

<div
	class="bg-slate-200 {variantClasses[variant]} {animationClasses[animation]}"
	style="width: {width}; height: {height};"
	role="status"
	aria-label="Loading..."
/>

<style>
	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.animate-shimmer {
		background: linear-gradient(
			90deg,
			rgb(226 232 240) 25%,
			rgb(203 213 225) 50%,
			rgb(226 232 240) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}
</style>
