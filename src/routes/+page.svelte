<script lang="ts">
  import { onMount } from 'svelte';
  import NotebookPage from '$lib/components/NotebookPage.svelte';
  import { loadTasks, saveTasks, getYesterdayDate, getTodayDate, getTomorrowDate } from '$lib/storage';
  import type { Task, TaskDay } from '$lib/types';
  
  let tasks: Task[] = [];
  
  onMount(() => {
    tasks = loadTasks();
  });
  
  $: yesterdayTasks = tasks.filter(t => t.date === getYesterdayDate());
  $: todayTasks = tasks.filter(t => t.date === getTodayDate());
  
  function handleTaskUpdate(task: Task) {
    const index = tasks.findIndex(t => t.id === task.id);
    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks = [...tasks, task];
    }
    saveTasks(tasks);
  }
  
  function handleTaskMove(taskId: string, targetDay: TaskDay) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const dateMap = {
      yesterday: getYesterdayDate(),
      today: getTodayDate(),
      tomorrow: getTomorrowDate()
    };
    
    const updatedTask = {
      ...task,
      date: dateMap[targetDay]
    };
    
    handleTaskUpdate(updatedTask);
  }
</script>

<div class="min-h-screen bg-amber-100 p-8">
  <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
    <div class="flex border-b">
      <div class="w-1/2 border-r">
        <NotebookPage
          tasks={yesterdayTasks}
          date={getYesterdayDate()}
          day="yesterday"
          onTaskUpdate={handleTaskUpdate}
          onTaskMove={handleTaskMove}
        />
      </div>
      <div class="w-1/2">
        <NotebookPage
          tasks={todayTasks}
          date={getTodayDate()}
          day="today"
          onTaskUpdate={handleTaskUpdate}
          onTaskMove={handleTaskMove}
          canAdd={true}
        />
      </div>
    </div>
  </div>
</div>
