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
    const result = getDateString(date);
    console.log(`getDateForOffset(${offset}) = ${result} (currentDate: ${currentDate.toISOString()})`);
    return result;
  }
  
  // Convert reactive logging to $effect
  $effect(() => {
    const left = getDateForOffset(-2);
    const right = getDateForOffset(-1);
    console.log('Page dates updated:', { left, right, currentDate: currentDate.toISOString() });
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let targetDate: string;
    if (targetDay === 'today') {
      // Move to actual today
      targetDate = getDateString(today);
      // After moving to today, update currentDate to show the correct spread
      const newCurrentDate = new Date(today);
      newCurrentDate.setDate(newCurrentDate.getDate() + 2); // Add two days to make today show up on the right page
      currentDate = newCurrentDate;
      console.log('Moving task to today:', {
        task: task.text,
        fromDate: task.date,
        targetDate,
        currentDate: currentDate.toISOString(),
        leftPage: getDateForOffset(-2),
        rightPage: getDateForOffset(-1)
      });
    } else if (targetDay === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDate = getDateString(tomorrow);
    } else if (targetDay === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      targetDate = getDateString(yesterday);
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
    const newDate = new Date(currentDate.getTime());
    newDate.setDate(newDate.getDate() + (direction === 'forward' ? 2 : -2));
    currentDate = newDate;
    console.log('Turned page:', direction, 'new date:', currentDate.toISOString());
  }

  function jumpToToday() {
    // Set to today's date plus one day, so our -2/-1 offsets show yesterday/today
    const date = new Date();
    date.setDate(date.getDate() + 1);
    currentDate = date;
    console.log('Jumped to today:', currentDate.toISOString(), {
      leftPage: getDateForOffset(-2),  // Should be yesterday
      rightPage: getDateForOffset(-1)   // Should be today
    });
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
