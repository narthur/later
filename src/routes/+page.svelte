<script lang="ts">
  import { onMount } from 'svelte';
  import NotebookPage from '$lib/components/NotebookPage.svelte';
  import { loadTasks } from '$lib/storage';
  import { DateService } from '$lib/services/dates';
  import { TaskService } from '$lib/services/tasks';
  import type { Task, TaskDay, Spread, SpreadTasks } from '$lib/types';
  
  let tasks = $state<Task[]>([]);
  let currentDate = $state(DateService.getTomorrow()); // Initialize to show yesterday/today
  let taskService: TaskService;
  
  onMount(() => {
    tasks = loadTasks();
    taskService = new TaskService(tasks);
  });
  
  // Calculate current spread
  const spread: Spread = $derived({
    leftDate: DateService.getRelativeDate(currentDate, -1),
    rightDate: DateService.getRelativeDate(currentDate, 0)
  });

  // Get tasks for current spread
  const spreadTasks: SpreadTasks = $derived({
    leftTasks: tasks.filter(t => t.date === spread.leftDate),
    rightTasks: tasks.filter(t => t.date === spread.rightDate)
  });
  
  function handleTaskUpdate(task: Task) {
    taskService.updateTask(task);
    tasks = [...tasks]; // Trigger reactivity
  }
  
  function handleTaskMove(taskId: string, targetDay: TaskDay) {
    if (targetDay === 'today') {
      const todayDate = DateService.getToday();
      taskService.moveTask(taskId, todayDate);
      // Update view to show the moved task
      currentDate = DateService.getTomorrow();
      tasks = [...tasks]; // Trigger reactivity
    }
  }

  function turnPage(direction: 'forward' | 'backward') {
    const offset = direction === 'forward' ? 2 : -2;
    currentDate = DateService.getRelativeDate(currentDate, offset);
  }

  function jumpToToday() {
    currentDate = DateService.getTomorrow();
  }
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
          {#key spread.leftDate}
          <NotebookPage
            tasks={spreadTasks.leftTasks}
            date={spread.leftDate}
            onTaskUpdate={handleTaskUpdate}
            onTaskMove={handleTaskMove}
            canAdd={true}
          />
          {/key}
        </div>
        <div class="w-1/2">
          {#key spread.rightDate}
          <NotebookPage
            tasks={spreadTasks.rightTasks}
            date={spread.rightDate}
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
