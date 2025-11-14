<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContextClient } from '@urql/svelte';
	import { type ICreateTaskInput } from '$lib/graphql';
	import { createTaskAPI } from '$lib/api';
	import { TASK_PRIORITY, TASK_STATUS } from '$consts';
	import { toTitleCaseFromEnum } from '$utils';
	import { resolve } from '$app/paths';
	const client = getContextClient();
	const taskAPI = createTaskAPI(client);

	let title = $state('');
	let description = $state('');
	let priority = $state(TASK_PRIORITY.MEDIUM);
	let status = $state(TASK_STATUS.TODO);
	let dueDate = $state('');
	let assignedTo = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const input: ICreateTaskInput = {
				title,
				description,
				priority,
				status,
				assignedTo
			};

			if (dueDate) {
				input.dueDate = new Date(dueDate).toISOString();
			}

			const task = await taskAPI.createTask(input);

			if (task) {
				goto(resolve('/dashboard/tasks'));
			}
		} catch (err: any) {
			error = err.message || 'An error occurred while creating the task';
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-3xl mx-auto">
	<div class="mb-4 sm:mb-6">
		<h1 class="text-xl sm:text-2xl font-bold text-gray-900">Create New Task</h1>
		<p class="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
			Fill in the details below to create a new task.
		</p>
	</div>

	<div class="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
		{#if error}
			<div
				class="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base"
			>
				{error}
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4 sm:space-y-6">
			<div>
				<label
					for="title"
					class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
				>
					Title <span class="text-red-500">*</span>
				</label>
				<input
					id="title"
					type="text"
					bind:value={title}
					required
					class="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
					placeholder="Enter task title"
				/>
			</div>

			<div>
				<label
					for="description"
					class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
				>
					Description
				</label>
				<textarea
					id="description"
					bind:value={description}
					rows="4"
					class="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
					placeholder="Enter task description"
				></textarea>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
				<div>
					<label
						for="priority"
						class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
					>
						Priority <span class="text-red-500">*</span>
					</label>
					<select
						id="priority"
						bind:value={priority}
						required
						class="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
					>
						{#each Object.values(TASK_PRIORITY) as priority (priority)}
							<option value={priority}>{toTitleCaseFromEnum(priority)}</option>
						{/each}
					</select>
				</div>

				<div>
					<label
						for="status"
						class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
					>
						Status <span class="text-red-500">*</span>
					</label>
					<select
						id="status"
						bind:value={status}
						required
						class="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
					>
						{#each Object.values(TASK_STATUS) as status (status)}
							<option value={status}>{toTitleCaseFromEnum(status)}</option>
						{/each}
					</select>
				</div>
			</div>

			<div>
				<label
					for="dueDate"
					class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
				>
					Due Date
				</label>
				<input
					id="dueDate"
					type="datetime-local"
					bind:value={dueDate}
					class="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label
					for="assignedTo"
					class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
				>
					assignedTo
				</label>
				<input
					id="assignedTo"
					type="text"
					bind:value={assignedTo}
					class="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
					placeholder="User ID to assign task to"
				/>
			</div>

			<div
				class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-4"
			>
				<button
					type="submit"
					disabled={loading}
					class="px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Creating...' : 'Create Task'}
				</button>

				<a
					href={resolve('/dashboard/tasks')}
					class="px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>
