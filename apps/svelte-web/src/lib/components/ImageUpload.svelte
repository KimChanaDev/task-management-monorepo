<script lang="ts">
	import { formatFileSize } from '$utils';
	import type { ITaskAttachment } from '$interfaces';

	interface ImageUploadProps {
		existingFiles?: ITaskAttachment[];
		onRemoveExistingFile?: (fileId: string) => void;
		pendingFiles: File[];
		uploadErrors: string[];
		maxFiles?: number;
	}

	// DELETE THIS INTERFACE IF NOT USED
	export interface UploadedFile {
		id: string;
		filename: string;
		url: string;
		thumbnailUrl?: string;
		size: number;
		mimeType: string;
		isNew?: boolean;
	}

	let {
		existingFiles = [],
		pendingFiles = $bindable([]),
		onRemoveExistingFile,
		uploadErrors = $bindable([]),
		maxFiles = 5
	}: ImageUploadProps = $props();

	let uploading = $state(false);
	let dragActive = $state(false);
	const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
	const maxFileSize = 10 * 1024 * 1024; // 10MB

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = false;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = false;

		const files = e.dataTransfer?.files;
		if (files) {
			handleFiles(Array.from(files));
		}
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (files) {
			handleFiles(Array.from(files));
		}
		// Reset input
		target.value = '';
	}

	function handleFiles(files: File[]) {
		const validFiles: File[] = [];
		const errors: string[] = [];

		for (const file of files) {
			// Check max files
			if (pendingFiles.length + (existingFiles?.length ?? 0) + validFiles.length >= maxFiles) {
				errors.push(`Maximum ${maxFiles} files allowed`);
				break;
			}
			// Check file type
			if (!acceptedTypes.includes(file.type)) {
				errors.push(`File "${file.name}" is not a supported image type`);
				continue;
			}
			// Check file size
			if (file.size > maxFileSize) {
				errors.push(`File "${file.name}" exceeds the maximum size of 10MB`);
				continue;
			}

			validFiles.push(file);
		}
		pendingFiles = pendingFiles.concat(validFiles);
		uploadErrors = errors;
	}

	function removePendingFile(index: number) {
		pendingFiles.splice(index, 1);
	}

	function getPendingFilePreview(file: File): string {
		return URL.createObjectURL(file);
	}
</script>

<div class="space-y-4">
	<!-- Drop Zone -->
	<div
		class="relative border-2 border-dashed rounded-lg p-6 transition-colors {dragActive
			? 'border-indigo-500 bg-indigo-50'
			: 'border-gray-300 hover:border-gray-400'}"
		role="button"
		tabindex="0"
		ondragenter={handleDragEnter}
		ondragleave={handleDragLeave}
		ondragover={handleDragOver}
		ondrop={handleDrop}
	>
		<input
			type="file"
			accept={acceptedTypes.join(',')}
			multiple
			class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
			onchange={handleFileSelect}
			disabled={uploading || pendingFiles.length + (existingFiles?.length ?? 0) >= maxFiles}
		/>

		<div class="text-center">
			<svg
				class="mx-auto h-12 w-12 text-gray-400"
				stroke="currentColor"
				fill="none"
				viewBox="0 0 48 48"
			>
				<path
					d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<div class="mt-4 flex text-sm text-gray-600 justify-center">
				<span
					class="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
				>
					Upload images
				</span>
				<p class="pl-1">or drag and drop</p>
			</div>
			<p class="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP up to 10MB</p>
			<p class="text-xs text-gray-400 mt-1">
				{pendingFiles.length + (existingFiles?.length ?? 0)} / {maxFiles} files
			</p>
		</div>
	</div>

	<!-- Files Preview -->
	{#if pendingFiles.length + (existingFiles?.length ?? 0) > 0}
		<div class="space-y-2">
			<h4 class="text-sm font-medium text-gray-700">
				Pending Upload ({pendingFiles.length + (existingFiles?.length ?? 0)})
			</h4>
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
				{#each existingFiles as file, index (file.filename + index)}
					<div class="relative group">
						<div
							class="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
						>
							<img
								src={file.thumbnailUrl ?? file.url}
								alt={file.filename}
								class="w-full h-full object-cover"
							/>
						</div>
						<button
							type="button"
							aria-label="Remove {file.originalName ?? file.filename}"
							onclick={() => onRemoveExistingFile?.(file.id)}
							class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
						<p class="mt-1 text-xs text-gray-500 truncate">{file.originalName}</p>
						<p class="text-xs text-gray-400">{formatFileSize(file.size)}</p>
					</div>
				{/each}
				{#each pendingFiles as file, index (file.name + index)}
					<div class="relative group">
						<div
							class="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
						>
							<img
								src={getPendingFilePreview(file)}
								alt={file.name}
								class="w-full h-full object-cover"
							/>
						</div>
						<button
							type="button"
							aria-label="Remove {file.name}"
							onclick={() => removePendingFile(index)}
							class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
						<p class="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
						<p class="text-xs text-gray-400">{formatFileSize(file.size)}</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
