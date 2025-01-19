<script lang="ts">
  import { onMount } from 'svelte';
  import NotebookPage from '$lib/components/NotebookPage.svelte';
  import { loadTasks, saveTasks } from '$lib/storage';
  import { DateService } from '$lib/services/dates';
  import type { Task, TaskDay } from '$lib/types';
  
  let tasks = $state<Task[]>([]);
  let currentDate = $state(DateService.getTomorrow()); // Initialize to show yesterday/today
  
  onMount(() => {
    tasks = loadTasks();
  });
  
  function getDateForOffset(offset: number): string {
    return DateService.getRelativeDate(currentDate, offset);
  }
  
  // Add reactive logging for dates
  $effect(() => {
    const left = getDateForOffset(-2);
    const right = getDateForOffset(-1);
    console.log('Task filtering:', {
      leftDate: left,
      rightDate: right,
      currentDate,
      actualToday: DateService.getToday(),
      allTasks: tasks.map(t => ({ id: t.id, date: t.date })),
      leftTasks: tasks.filter(t => t.date === left).map(t => ({ id: t.id, date: t.date })),
      rightTasks: tasks.filter(t => t.date === right).map(t => ({ id: t.id, date: t.date }))
    });
  });
  
  const leftPageDate = $derived(getDateForOffset(-2));  // Show yesterday
  const rightPageDate = $derived(getDateForOffset(-1)); // Show today
  const leftPageTasks = $derived(tasks.filter(t => t.date === leftPageDate && !t.deleted));
  const rightPageTasks = $derived(tasks.filter(t => t.date === rightPageDate && !t.deleted));
  
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
      // After moving to today, update currentDate to show the correct spread
      currentDate = DateService.getTomorrow();
    } else if (targetDay === 'tomorrow') {
      targetDate = DateService.getTomorrow();
    } else if (targetDay === 'yesterday') {
      targetDate = DateService.getYesterday();
    } else {
      return;
    }
    
    const updatedTask: Task = {
      ...task,
      date: targetDate
    };
    
    handleTaskUpdate(updatedTask);
  }

  function turnPage(direction: 'forward' | 'backward') {
    // Move two days at a time
    currentDate = DateService.getRelativeDate(currentDate, direction === 'forward' ? 2 : -2);
  }

  function jumpToToday() {
    // Set currentDate to tomorrow to show yesterday/today spread
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
          {#key leftPageDate}
          <NotebookPage
            tasks={leftPageTasks}
            date={leftPageDate}
            onTaskUpdate={handleTaskUpdate}
            onTaskMove={handleTaskMove}
            canAdd={true}
          />
          {/key}
        </div>
        <div class="w-1/2">
          {#key rightPageDate}
          <NotebookPage
            tasks={rightPageTasks}
            date={rightPageDate}
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
