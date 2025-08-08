<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let accept = 'image/*,.pdf';
	export let maxSize = 20 * 1024 * 1024; // 20MB default
	export let multiple = false;
	export let files: File[] = [];

	const dispatch = createEventDispatcher();

	let dragActive = false;
	let fileInput: HTMLInputElement;

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;

		if (e.dataTransfer?.files) {
			handleFiles(Array.from(e.dataTransfer.files));
		}
	}

	function handleFiles(newFiles: File[]) {
		const validFiles = newFiles.filter((file) => {
			if (file.size > maxSize) {
				dispatch('error', {
					message: `${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`
				});
				return false;
			}
			return true;
		});

		if (multiple) {
			files = [...files, ...validFiles];
		} else {
			files = validFiles.slice(0, 1);
		}

		dispatch('change', { files });
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
		dispatch('change', { files });
	}

	function formatFileSize(bytes: number): string {
		const units = ['B', 'KB', 'MB', 'GB'];
		let size = bytes;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}
</script>

<div class="space-y-4">
	<div
		role="button"
		tabindex="0"
		class="relative rounded-lg border-2 border-dashed p-6 text-center transition-colors"
		class:border-slate-300={!dragActive}
		class:dark:border-slate-600={!dragActive}
		class:bg-slate-50={!dragActive}
		class:dark:bg-slate-800={!dragActive}
		class:border-blue-500={dragActive}
		class:bg-blue-50={dragActive}
		class:dark:bg-blue-900={dragActive}
		on:dragover|preventDefault={() => (dragActive = true)}
		on:dragleave|preventDefault={() => (dragActive = false)}
		on:drop={handleDrop}
		on:keydown={(e) => e.key === 'Enter' && fileInput.click()}
	>
		<input
			bind:this={fileInput}
			type="file"
			{accept}
			{multiple}
			class="sr-only"
			on:change={(e) => {
				const target = e.target as HTMLInputElement;
				if (target.files) {
					handleFiles(Array.from(target.files));
				}
			}}
		/>

		<svg
			class="mx-auto h-12 w-12 text-slate-400"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
			/>
		</svg>

		<p class="mt-2 text-sm text-slate-600">
			<button
				type="button"
				class="font-medium text-blue-600 hover:text-blue-500"
				on:click={() => fileInput.click()}
			>
				Click to upload
			</button>
			or drag and drop
		</p>

		<p class="mt-1 text-xs text-slate-500">
			{accept.replace(/,/g, ', ')} up to {formatFileSize(maxSize)}
		</p>
	</div>

	{#if files.length > 0}
		<div class="space-y-2">
			{#each files as file, index (file.name + index)}
				<div class="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
					<div class="flex items-center gap-3">
						{#if file.type.startsWith('image/')}
							<!-- Show image preview for image files -->
							<div class="h-12 w-12 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
								<img
									src={URL.createObjectURL(file)}
									alt={file.name}
									class="h-full w-full object-cover"
									on:load={(e) => {
										// Revoke the object URL after the image loads to free memory
										const img = e.target;
										if (img instanceof HTMLImageElement) {
											setTimeout(() => URL.revokeObjectURL(img.src), 100);
										}
									}}
								/>
							</div>
						{:else}
							<!-- Default file icon for non-image files -->
							<svg
								class="h-5 w-5 text-slate-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						{/if}
						<div>
							<p class="text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
							<p class="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
						</div>
					</div>
					<button
						type="button"
						class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
						aria-label="Remove file"
						on:click={() => removeFile(index)}
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
