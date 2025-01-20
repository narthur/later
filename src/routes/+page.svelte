<script lang="ts">
	import { onMount } from 'svelte';
	import NotebookPage from '$lib/components/NotebookPage.svelte';
	import { loadTasks, saveTasks } from '$lib/storage';
	import { DateService } from '$lib/services/dates';
	import { SpreadService } from '$lib/services/spreads';
	import type { Task, TaskDay, Spread, SpreadTasks } from '$lib/types';

	let tasks = $state<Task[]>([]);
	let currentSpread = $state<Spread>(SpreadService.getTodaySpread());

	onMount(() => {
		tasks = loadTasks();
	});

	// Calculate tasks for current spread
	const spreadTasks = $derived<SpreadTasks>(SpreadService.getTasksForSpread(currentSpread, tasks));

	function handleTaskUpdate(task: Task) {
		const index = tasks.findIndex((t) => t.id === task.id);
		if (index >= 0) {
			tasks[index] = task;
			tasks = [...tasks]; // Trigger reactivity
		} else {
			tasks = [...tasks, task];
		}
		saveTasks(tasks);
	}

	function handleTaskMove(taskId: string, targetDay: TaskDay) {
		const task = tasks.find((t) => t.id === taskId);
		if (!task) return;

		let targetDate: string;
		if (targetDay === 'today') {
			targetDate = DateService.getToday();
			// After moving to today, update spread to show yesterday/today
			currentSpread = SpreadService.getTodaySpread();
		} else if (targetDay === 'tomorrow') {
			targetDate = DateService.getTomorrow();
		} else if (targetDay === 'yesterday') {
			targetDate = DateService.getYesterday();
		} else {
			return;
		}

		handleTaskUpdate({
			...task,
			date: targetDate
		});
	}

	function turnPage(direction: 'forward' | 'backward') {
		currentSpread =
			direction === 'forward'
				? SpreadService.getNextSpread(currentSpread)
				: SpreadService.getPreviousSpread(currentSpread);

		SpreadService.validateSpread(currentSpread);
	}

	function jumpToToday() {
		currentSpread = SpreadService.getTodaySpread();
	}

	// Debug logging
	$effect(() => {
		console.log('Current state:', {
			spread: currentSpread,
			actualToday: DateService.getToday(),
			allTasks: tasks.map((t) => ({ id: t.id, date: t.date, text: t.text }))
		});
	});
</script>

<svelte:window 
  onkeydown={(e) => {
    // Don't trigger when user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    
    if (e.key === 'ArrowLeft') turnPage('backward');
    else if (e.key === 'ArrowRight') turnPage('forward');
    else if (e.key === 't') jumpToToday();
    else if (e.key === 'n') {
      e.preventDefault(); // Prevent 'n' from being typed into the input
      // Find all new task inputs and focus the first visible one
      const inputs = document.querySelectorAll<HTMLInputElement>('.new-task-input');
      inputs.forEach(input => {
        // Check if the input is visible by checking if any parent has display: none
        if (input.offsetParent !== null) {
          input.focus();
        }
      });
    }
  }}
/>

<div class="min-h-screen bg-amber-100 p-8">
	<div class="mx-auto max-w-4xl">
		<div class="mb-4 flex justify-between">
			<div class="flex gap-2">
				<button
					onclick={() => turnPage('backward')}
					class="rounded bg-amber-200 px-4 py-2 transition-colors hover:bg-amber-300"
				>
					← Previous Spread
				</button>
				<button
					onclick={jumpToToday}
					class="rounded bg-amber-300 px-4 py-2 font-medium transition-colors hover:bg-amber-400"
				>
					Today
				</button>
			</div>
			<button
				onclick={() => turnPage('forward')}
				class="rounded bg-amber-200 px-4 py-2 transition-colors hover:bg-amber-300"
			>
				Next Spread →
			</button>
		</div>

		<div class="overflow-hidden rounded-lg bg-white shadow-lg">
			<div class="flex border-b">
				<div class="w-1/2 border-r">
					{#key currentSpread.leftDate}
						<NotebookPage
							tasks={spreadTasks.leftTasks}
							date={currentSpread.leftDate}
							onTaskUpdate={handleTaskUpdate}
							onTaskMove={handleTaskMove}
							canAdd={true}
						/>
					{/key}
				</div>
				<div class="w-1/2">
					{#key currentSpread.rightDate}
						<NotebookPage
							tasks={spreadTasks.rightTasks}
							date={currentSpread.rightDate}
							onTaskUpdate={handleTaskUpdate}
							onTaskMove={handleTaskMove}
							canAdd={true}
						/>
					{/key}
				</div>
			</div>
		</div>

    <div class="mt-8 mx-auto max-w-lg text-center text-sm text-gray-600">
      <h3 class="font-medium mb-2">Keyboard Shortcuts</h3>
      <div class="grid grid-cols-2 gap-2">
        <div>← Left Arrow</div><div>Previous Spread</div>
        <div>→ Right Arrow</div><div>Next Spread</div>
        <div>T</div><div>Jump to Today</div>
        <div>N</div><div>New Task</div>
      </div>
    </div>
	</div>
</div>
