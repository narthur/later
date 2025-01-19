<script lang="ts">
  import type { Task } from '../types';
  import type { TaskDay } from '../types';
  
  let { tasks, date, onTaskUpdate, onTaskMove, canAdd = false } = $props();
  
  let newTaskText = $state('');
  
  function handleNewTask() {
    if (!newTaskText.trim()) return;
    
    const task: Task = {
      id: crypto.randomUUID(),
      text: newTaskText,
      completed: false,
      date,
      createdAt: Date.now()
    };
    
    onTaskUpdate(task);
    newTaskText = '';
  }
  
  function toggleTask(task: Task) {
    onTaskUpdate({
      ...task,
      completed: !task.completed
    });
  }

  function calculateRelativeDay(dateStr: string): TaskDay {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pageDate = new Date(dateStr);
    pageDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((pageDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    console.log('NotebookPage: Calculating relative day for date:', dateStr, 'diff:', diffDays);
    
    if (diffDays === 0) return 'today';
    if (diffDays === -1) return 'yesterday';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays < 0) return `${-diffDays} days ago`;
    return `in ${diffDays} days`;
  }

  // Format date to be more readable
  const formattedDate = $derived(new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }));

  // Make the relative day calculation explicitly dependent on the date prop
  const relativeDay = $derived(calculateRelativeDay(date));

  // Use $effect for side effects
  $effect(() => {
    console.log('NotebookPage updated:', { date, relativeDay, formattedDate });
  });
</script>

<div class="flex flex-col h-full p-4 bg-amber-50">
  <div class="mb-4">
    <h2 class="text-xl font-serif capitalize">{relativeDay}</h2>
    <p class="text-sm text-gray-600">{formattedDate}</p>
  </div>
  
  <ul class="space-y-2 flex-grow">
    {#each tasks as task (task.id)}
      <li class="flex items-center gap-2">
        <input
          type="checkbox"
          checked={task.completed}
          onchange={() => toggleTask(task)}
          class="rounded border-gray-400"
        />
        <span class:line-through={task.completed} class="flex-grow">
          {task.text}
        </span>
        {#if relativeDay === 'yesterday' || relativeDay.endsWith('days ago')}
          <button
            onclick={() => onTaskMove(task.id, 'today')}
            class="text-sm text-blue-600 hover:underline"
          >
            Move to Today
          </button>
        {/if}
        {#if relativeDay === 'today'}
          <button
            onclick={() => onTaskMove(task.id, 'tomorrow')}
            class="text-sm text-blue-600 hover:underline"
          >
            Delay
          </button>
        {/if}
      </li>
    {/each}
  </ul>
  
  {#if canAdd}
    <div class="mt-4">
      <input
        type="text"
        bind:value={newTaskText}
        placeholder="Add new task..."
        class="w-full p-2 border rounded"
        onkeydown={(e) => e.key === 'Enter' && handleNewTask()}
      />
    </div>
  {/if}
</div>
