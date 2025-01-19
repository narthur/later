<script lang="ts">
  import { onMount } from 'svelte';
  import NotebookPage from '$lib/components/NotebookPage.svelte';
  import { loadTasks, saveTasks, getDateString } from '$lib/storage';
  import type { Task, TaskDay } from '$lib/types';
  
  let tasks = $state<Task[]>([]);
  let currentDate = $state(new Date());
  
  onMount(() => {
    tasks = loadTasks();
  });
  
  function getDateForOffset(offset: number): string {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + offset);
    return getDateString(date);
  }
  
  // Convert reactive logging to $effect
  $effect(() => {
    const left = getDateForOffset(-2);
    const right = getDateForOffset(-1);
    console.log('Page dates updated:', { left, right, currentDate: currentDate.toISOString() });
  });
  
  const leftPageDate = $derived(getDateForOffset(-2));
  const rightPageDate = $derived(getDateForOffset(-1));
  const leftPageTasks = $derived(tasks.filter(t => t.date === leftPageDate));
  const rightPageTasks = $derived(tasks.filter(t => t.date === rightPageDate));
  
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
      targetDate = getDateForOffset(0);
    } else if (targetDay === 'tomorrow') {
      targetDate = getDateForOffset(1);
    } else if (targetDay === 'yesterday') {
      targetDate = getDateForOffset(-1);
    } else {
      // For any other day label, just keep the current date
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
    const newDate = new Date(currentDate.getTime());
    newDate.setDate(newDate.getDate() + (direction === 'forward' ? 2 : -2));
    currentDate = newDate;
    console.log('Turned page:', direction, 'new date:', currentDate.toISOString());
  }
</script>

<div class="min-h-screen bg-amber-100 p-8">
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between mb-4">
      <button
        onclick={() => turnPage('backward')}
        class="px-4 py-2 bg-amber-200 rounded hover:bg-amber-300 transition-colors"
      >
        ← Previous Spread
      </button>
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
