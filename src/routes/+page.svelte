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
  const spreadTasks = $derived<SpreadTasks>(
    SpreadService.getTasksForSpread(currentSpread, tasks)
  );
  
  function handleTaskUpdate(task: Task) {
    const index = tasks.findIndex(t => t.id === task.id);
    if (index >= 0) {
      tasks[index] = task;
      tasks = [...tasks]; // Trigger reactivity
    } else {
      tasks = [...tasks, task];
    }
    saveTasks(tasks);
  }
  
  function handleTaskMove(taskId: string, targetDay: TaskDay) {
    const task = tasks.find(t => t.id === taskId);
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
    currentSpread = direction === 'forward' 
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
      allTasks: tasks.map(t => ({ id: t.id, date: t.date, text: t.text }))
    });
  });
</script>

<div class="min-h-screen bg-amber-100 p-8">
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between mb-4">
      <div class="flex gap-2">
        <button
          onclick={() => turnPage('backward')}
          class="px-4 py-2 bg-amber-200 rounded hover:bg-amber-300 transition-colors"
        >
          ← Previous Spread
        </button>
        <button
          onclick={jumpToToday}
          class="px-4 py-2 bg-amber-300 rounded hover:bg-amber-400 transition-colors font-medium"
        >
          Today
        </button>
      </div>
      <button
        onclick={() => turnPage('forward')}
        class="px-4 py-2 bg-amber-200 rounded hover:bg-amber-300 transition-colors"
      >
        Next Spread →
      </button>
    </div>
    
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
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
  </div>
</div>
