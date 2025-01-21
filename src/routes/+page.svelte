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
			inputs.forEach((input) => {
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
		<header class="mb-8 text-center">
			<h1 class="mb-2 font-serif text-4xl font-bold text-amber-900">Later</h1>
			<p class="mb-4 text-sm text-amber-800">A simple task manager for today and tomorrow</p>
			<div class="flex justify-center gap-4 text-sm">
				<button
					onclick={() => {
						const data = JSON.stringify(tasks, null, 2);
						const blob = new Blob([data], { type: 'application/json' });
						const url = URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url;
						a.download = `later-tasks-${DateService.getToday()}.json`;
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
						URL.revokeObjectURL(url);
					}}
					class="text-amber-800 hover:text-amber-950 underline"
				>
					Export Tasks
				</button>
				<label class="cursor-pointer text-amber-800 hover:text-amber-950 underline">
					Import Tasks
					<input
						type="file"
						accept=".json"
						class="hidden"
						onchange={(e) => {
							const target = e.target as HTMLInputElement;
							const file = target.files?.[0];
							if (!file) return;

							const reader = new FileReader();
							reader.onload = (event) => {
								try {
									const importedTasks = JSON.parse(event.target?.result as string);
									if (Array.isArray(importedTasks) && importedTasks.every(task => 
										typeof task === 'object' && 
										typeof task.id === 'string' &&
										typeof task.text === 'string' &&
										typeof task.date === 'string' &&
										typeof task.completed === 'boolean' &&
										typeof task.createdAt === 'number'
									)) {
										tasks = importedTasks;
										saveTasks(tasks);
										alert('Tasks imported successfully!');
									} else {
										alert('Invalid task format in the imported file');
									}
								} catch (err) {
									const error = err as Error;
									alert('Error importing tasks: ' + error.message);
								}
							};
							reader.readAsText(file);
						}}
					/>
				</label>
			</div>
		</header>

		<div class="mb-4 flex justify-center items-center gap-4">
			<button
				onclick={() => turnPage('backward')}
				class="md:hidden rounded bg-amber-200 px-3 py-2 transition-colors hover:bg-amber-300"
				title="Previous Spread"
			>
				←
			</button>
			<button
				onclick={jumpToToday}
				class="rounded bg-amber-300 px-4 py-2 font-medium transition-colors hover:bg-amber-400"
			>
				Today
			</button>
			<button
				onclick={() => turnPage('forward')}
				class="md:hidden rounded bg-amber-200 px-3 py-2 transition-colors hover:bg-amber-300"
				title="Next Spread"
			>
				→
			</button>
		</div>

		<div class="relative">
			<button
				onclick={() => turnPage('backward')}
				class="hidden md:block absolute -left-16 top-24 rounded bg-amber-200 px-3 py-2 transition-colors hover:bg-amber-300"
				title="Previous Spread"
			>
				←
			</button>

			<div 
				class="relative flex min-h-[32rem] w-full overflow-hidden rounded-lg bg-white shadow-lg"
				ontouchstart={(e) => {
					const container = e.currentTarget as HTMLElement;
					const content = container.querySelector('.flex.w-full.border-b') as HTMLElement;
					const touch = e.touches[0];
					let startX = touch.clientX;
					let startY = touch.clientY;
					let currentTranslateX = 0;
					let nextSpread: Spread | null = null;
					let nextContent: HTMLElement | null = null;

					// Create and position the next page container
					const createNextPage = (direction: 'forward' | 'backward') => {
						const next = direction === 'forward' 
							? SpreadService.getNextSpread(currentSpread)
							: SpreadService.getPreviousSpread(currentSpread);
						const nextTasks = SpreadService.getTasksForSpread(next, tasks);
						
						const div = document.createElement('div');
						div.className = 'absolute top-0 flex w-full border-b bg-white';
						div.style.transition = 'transform 0.2s ease-out';
						div.style.transform = `translateX(${direction === 'forward' ? '100%' : '-100%'})`;
						
						// Create preview content using the tasks we already fetched
						const taskList = nextTasks.rightTasks.map(task => `
							<li class="flex items-center gap-2 group">
								<input type="checkbox" ${task.completed ? 'checked' : ''} class="rounded border-gray-400" />
								<span class="${task.completed ? 'line-through' : ''} flex-grow">${task.text}</span>
							</li>
						`).join('');

						div.innerHTML = `
							<div class="w-full">
								<div class="flex flex-col h-full p-4 bg-amber-50">
									<div class="mb-4">
										<h2 class="text-xl font-serif capitalize">${DateService.getRelativeDayDescription(next.rightDate)}</h2>
										<p class="text-sm text-gray-600">${new Date(next.rightDate + 'T00:00:00').toLocaleDateString('en-US', {
											weekday: 'long',
											month: 'long',
											day: 'numeric'
										})}</p>
									</div>
									<ul class="space-y-2 flex-grow">
										${taskList}
									</ul>
								</div>
							</div>
						`;
						
						container.appendChild(div);
						return { spread: next, element: div };
					};

					// Add transition for smooth reset if swipe doesn't complete
					content.style.transition = 'transform 0.2s ease-out';

					const handleTouchMove = (e: TouchEvent) => {
						// Prevent scrolling while swiping
						e.preventDefault();
						
						const touch = e.touches[0];
						const deltaX = touch.clientX - startX;
						const deltaY = touch.clientY - startY;

						// Only move horizontally if the swipe is more horizontal than vertical
						if (Math.abs(deltaX) > Math.abs(deltaY)) {
							// Create next page if we haven't yet
							if (!nextContent && Math.abs(deltaX) > 20) {
								const direction = deltaX > 0 ? 'backward' : 'forward';
								const next = createNextPage(direction);
								nextSpread = next.spread;
								nextContent = next.element;
							}

							// Move both current and next pages
							if (nextContent) {
								const progress = Math.abs(deltaX) / window.innerWidth;
								content.style.transform = `translateX(${deltaX}px)`;
								nextContent.style.transform = `translateX(${deltaX > 0 ? 
									(-100 + progress * 100) + '%' : 
									(100 - progress * 100) + '%'})`;
							}
						}
					};

					const handleTouchEnd = (e: TouchEvent) => {
						const touch = e.changedTouches[0];
						const deltaX = touch.clientX - startX;
						const deltaY = touch.clientY - startY;

						// Reset transition duration for the snap back or page turn
						content.style.transition = 'transform 0.2s ease-out';
						if (nextContent) {
							nextContent.style.transition = 'transform 0.2s ease-out';
						}

						// Only trigger if horizontal swipe is more significant than vertical
						if (Math.abs(deltaX) > Math.abs(deltaY)) {
							// Require at least 50px of swipe distance
							if (Math.abs(deltaX) > 50 && nextSpread) {
								// Animate both pages
								content.style.transform = `translateX(${deltaX > 0 ? '100%' : '-100%'})`;
								if (nextContent) {
									nextContent.style.transform = 'translateX(0)';
								}
								
								// Animate both pages
								content.style.transform = `translateX(${deltaX > 0 ? '100%' : '-100%'})`;
								if (nextContent) {
									nextContent.style.transform = 'translateX(0)';
								}
								
								// Change page immediately but keep animations
								if (deltaX > 0) {
									turnPage('backward');
								} else {
									turnPage('forward');
								}
								
								// Clean up after animation completes
								setTimeout(() => {
									if (nextContent) {
										nextContent.remove();
									}
									content.style.transform = '';
									content.style.transition = '';
								}, 200);
							} else {
								// Snap back if swipe wasn't far enough
								content.style.transform = '';
								if (nextContent) {
									nextContent.style.transform = `translateX(${deltaX > 0 ? '-100%' : '100%'})`;
									// Remove next page after transition
									setTimeout(() => {
										nextContent?.remove();
									}, 200);
								}
							}
						}

						document.removeEventListener('touchmove', handleTouchMove);
						document.removeEventListener('touchend', handleTouchEnd);
					};

					document.addEventListener('touchmove', handleTouchMove, { passive: false });
					document.addEventListener('touchend', handleTouchEnd, { once: true });
				}}
			>
				<div class="flex w-full border-b">
					<div class="hidden md:block md:w-1/2 border-r">
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
					<div class="w-full md:w-1/2">
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

			<button
				onclick={() => turnPage('forward')}
				class="hidden md:block absolute -right-16 top-24 rounded bg-amber-200 px-3 py-2 transition-colors hover:bg-amber-300"
				title="Next Spread"
			>
				→
			</button>
		</div>

		<div class="mx-auto mt-8 max-w-lg text-center text-sm text-gray-600">
			<h3 class="mb-2 font-medium">Keyboard Shortcuts</h3>
			<div class="grid grid-cols-2 gap-2">
				<div>← Left Arrow</div>
				<div>Previous Spread</div>
				<div>→ Right Arrow</div>
				<div>Next Spread</div>
				<div>T</div>
				<div>Jump to Today</div>
				<div>N</div>
				<div>New Task</div>
			</div>
		</div>

		<footer class="mt-16 text-center text-sm text-amber-800">
			<p class="space-x-4">
				<a href="https://nathanarthur.com" class="hover:text-amber-950 underline">Nathan Arthur</a>
				<a href="https://ko-fi.com/narthur" class="hover:text-amber-950 underline">Support on Ko-fi</a>
				<a href="https://pinepeakdigital.com" class="hover:text-amber-950 underline">Pine Peak Digital</a>
				<a href="https://taskratchet.com" class="hover:text-amber-950 underline">TaskRatchet</a>
				<a href="https://codebuff.com/referrals/ref-6d348d54-80f1-4155-903b-2cc6c57dd12f" class="hover:text-amber-950 underline">Built with Codebuff</a>
			</p>
		</footer>
	</div>
</div>
