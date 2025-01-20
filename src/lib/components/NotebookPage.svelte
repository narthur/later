<script lang="ts">
  import type { Task } from '../types';
  import type { TaskDay } from '../types';
  import Icon from '@iconify/svelte';
  import * as chrono from 'chrono-node';
  
  let { tasks, date, onTaskUpdate, onTaskMove, canAdd = false } = $props();
  
  let newTaskText = $state('');
  let editingTaskId = $state<string | null>(null);
  let editingText = $state('');
  let movingTaskId = $state<string | null>(null);
  let moveToText = $state('');
  
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

  function startEditing(task: Task) {
    editingTaskId = task.id;
    editingText = task.text;
  }

  function saveEdit(task: Task) {
    if (editingText.trim() === '') return;
    
    onTaskUpdate({
      ...task,
      text: editingText.trim()
    });
    editingTaskId = null;
    editingText = '';
  }

  function cancelEdit() {
    editingTaskId = null;
    editingText = '';
  }

  function deleteTask(task: Task) {
    if (confirm('Are you sure you want to delete this task?')) {
      onTaskUpdate({
        ...task,
        deleted: true
      });
    }
  }

  function calculateRelativeDay(dateStr: string): TaskDay {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pageDate = new Date(dateStr + 'T00:00:00');
    
    const diffDays = Math.round((pageDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    console.log('NotebookPage: Calculating relative day for date:', dateStr, 'diff:', diffDays, {
      todayDate: today.toISOString(),
      pageDate: pageDate.toISOString()
    });
    
    if (diffDays === 0) return 'today';
    if (diffDays === -1) return 'yesterday';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays < 0) return `${-diffDays} days ago`;
    return `in ${diffDays} days`;
  }

  const formattedDate = $derived(new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }));

  const relativeDay = $derived(calculateRelativeDay(date));

  function startMoving(task: Task) {
    movingTaskId = task.id;
    moveToText = '';
  }

  function cancelMove() {
    movingTaskId = null;
    moveToText = '';
  }

  function handleMove(task: Task) {
    if (!moveToText.trim()) return;
    
    const parsedDate = chrono.parseDate(moveToText);
    if (!parsedDate) {
      alert('Could not understand that date. Please try again.');
      return;
    }
    
    onTaskUpdate({
      ...task,
      date: getDateString(parsedDate)
    });
    
    movingTaskId = null;
    moveToText = '';
  }

  function getDateString(date: Date): string {
    // Use local timezone for date string
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
  }

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
      <li class="flex items-center gap-2 group">
        <input
          type="checkbox"
          checked={task.completed}
          onchange={() => toggleTask(task)}
          class="rounded border-gray-400"
        />
        {#if editingTaskId === task.id}
          <div class="flex-grow flex gap-2">
            <input
              type="text"
              bind:value={editingText}
              class="flex-grow p-1 border rounded"
              onkeydown={(e) => {
                if (e.key === 'Enter') saveEdit(task);
                if (e.key === 'Escape') cancelEdit();
              }}
            />
            <button
              onclick={() => saveEdit(task)}
              class="text-sm text-green-600 hover:text-green-800"
              title="Save"
            >
              <Icon icon="mdi:check" width="20" />
            </button>
            <button
              onclick={cancelEdit}
              class="text-sm text-red-600 hover:text-red-800"
              title="Cancel"
            >
              <Icon icon="mdi:close" width="20" />
            </button>
          </div>
        {:else if movingTaskId === task.id}
          <div class="flex-grow flex gap-2">
            <input
              type="text"
              bind:value={moveToText}
              placeholder="Enter date (e.g., next friday, in 2 weeks)"
              class="flex-grow p-1 border rounded"
              onkeydown={(e) => {
                if (e.key === 'Enter') handleMove(task);
                if (e.key === 'Escape') cancelMove();
              }}
            />
            <button
              onclick={() => handleMove(task)}
              class="text-sm text-green-600 hover:text-green-800"
              title="Move"
            >
              <Icon icon="mdi:check" width="20" />
            </button>
            <button
              onclick={cancelMove}
              class="text-sm text-red-600 hover:text-red-800"
              title="Cancel"
            >
              <Icon icon="mdi:close" width="20" />
            </button>
          </div>
        {:else}
          <span class:line-through={task.completed} class="flex-grow">
            {task.text}
          </span>
          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onclick={() => startEditing(task)}
              class="text-gray-600 hover:text-gray-800"
              title="Edit"
            >
              <Icon icon="mdi:pencil" width="20" />
            </button>
            <button
              onclick={() => startMoving(task)}
              class="text-blue-600 hover:text-blue-800"
              title="Move to date..."
            >
              <Icon icon="mdi:calendar-clock" width="20" />
            </button>
            <button
              onclick={() => deleteTask(task)}
              class="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <Icon icon="mdi:delete" width="20" />
            </button>
            {#if relativeDay === 'yesterday' || relativeDay.endsWith('days ago')}
              <button
                onclick={() => onTaskMove(task.id, 'today')}
                class="text-blue-600 hover:text-blue-800"
                title="Move to Today"
              >
                <Icon icon="mdi:arrow-right" width="20" />
              </button>
            {/if}
            {#if relativeDay === 'today'}
              <button
                onclick={() => onTaskMove(task.id, 'tomorrow')}
                class="text-blue-600 hover:text-blue-800"
                title="Delay"
              >
                <Icon icon="mdi:clock" width="20" />
              </button>
            {/if}
          </div>
        {/if}
      </li>
    {/each}
  </ul>
  
  {#if canAdd}
    <div class="mt-4 flex gap-2">
      <input
        type="text"
        bind:value={newTaskText}
        placeholder="Add new task..."
        class="flex-grow p-2 border rounded"
        onkeydown={(e) => e.key === 'Enter' && handleNewTask()}
      />
      <button
        onclick={handleNewTask}
        class="px-2 text-green-600 hover:text-green-800"
        title="Add Task"
      >
        <Icon icon="mdi:plus" width="24" />
      </button>
    </div>
  {/if}
</div>
