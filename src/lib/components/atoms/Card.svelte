<script lang="ts">
	export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
	export let shadow: 'none' | 'sm' | 'md' | 'lg' = 'md';
	export let hover: boolean = false;

	const paddingClasses = {
		none: '',
		sm: 'p-3',
		md: 'p-4 md:p-6',
		lg: 'p-6 md:p-8'
	};

	const shadowClasses = {
		none: '',
		sm: 'shadow-sm',
		md: 'shadow-md',
		lg: 'shadow-lg'
	};

	$: cardClass = `
    bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${hover ? 'transition-shadow hover:shadow-lg dark:hover:shadow-slate-700/50' : ''}
  `;
</script>

<div class={cardClass} {...$$restProps}>
	<slot />
</div>
