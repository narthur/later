<script lang="ts">
  import type { Task } from '../types';
  import type { TaskDay } from '../types';
  
  export let tasks: Task[];
  export let date: string;
  export let day: TaskDay;
  export let onTaskUpdate: (task: Task) => void;
  export let onTaskMove: (taskId: string, targetDay: TaskDay) => void;
  export let canAdd = false;
  
  let newTaskText = '';
  
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
</script>

<div class="flex flex-col h-full p-4 bg-amber-50">
  <h2 class="text-xl font-serif capitalize mb-4">{day}</h2>
  
  <ul class="space-y-2 flex-grow">
    {#each tasks as task (task.id)}
      <li class="flex items-center gap-2">
        <input
          type="checkbox"
          checked={task.completed}
          on:change={() => toggleTask(task)}
          class="rounded border-gray-400"
        />
        <span class:line-through={task.completed} class="flex-grow">
          {task.text}
        </span>
        {#if day === 'yesterday'}
          <button
            on:click={() => onTaskMove(task.id, 'today')}
            class="text-sm text-blue-600 hover:underline"
          >
            Move to Today
          </button>
        {/if}
        {#if day === 'today'}
          <button
            on:click={() => onTaskMove(task.id, 'tomorrow')}
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
        on:keydown={(e) => e.key === 'Enter' && handleNewTask()}
      />
    </div>
  {/if}
</div>
