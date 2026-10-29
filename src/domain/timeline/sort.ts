import { err, ok, type Result } from '../result';
import type { Task } from '../types';

interface GraphContext {
  taskMap: Map<string, Task>;
  inDegree: Map<string, number>;
  dependents: Map<string, string[]>;
  readyQueue: Task[];
}

/** Compares two tasks stably by due date, falling back to ID. */
function compareTasksByDueDate(a: Task, b: Task): number {
  if (a.dueDate < b.dueDate) {
    return -1;
  }
  if (a.dueDate > b.dueDate) {
    return 1;
  }
  return a.id.localeCompare(b.id);
}

/** Inserts a task into a sorted queue maintaining due date ordering. */
function insertSorted(queue: Task[], task: Task): void {
  let idx = 0;
  while (idx < queue.length) {
    const current = queue[idx];
    if (current !== undefined && compareTasksByDueDate(task, current) < 0) {
      break;
    }
    idx += 1;
  }
  queue.splice(idx, 0, task);
}

function buildTaskGraph(tasks: readonly Task[]): {
  taskMap: Map<string, Task>;
  inDegree: Map<string, number>;
  dependents: Map<string, string[]>;
} {
  const taskMap = new Map<string, Task>();
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const task of tasks) {
    taskMap.set(task.id, task);
    dependents.set(task.id, []);
  }

  for (const task of tasks) {
    let directPrereqCount = 0;
    for (const depId of task.dependencies) {
      if (taskMap.has(depId)) {
        directPrereqCount += 1;
        dependents.get(depId)?.push(task.id);
      }
    }
    inDegree.set(task.id, directPrereqCount);
  }

  return { taskMap, inDegree, dependents };
}

function releaseDependents(currentId: string, ctx: GraphContext): void {
  const childIds = ctx.dependents.get(currentId);
  if (childIds === undefined) {
    return;
  }
  for (const childId of childIds) {
    const nextIn = (ctx.inDegree.get(childId) ?? 1) - 1;
    ctx.inDegree.set(childId, nextIn);
    if (nextIn === 0) {
      const task = ctx.taskMap.get(childId);
      if (task !== undefined) {
        insertSorted(ctx.readyQueue, task);
      }
    }
  }
}

/** Topologically sorts tasks by dependencies and due date using Kahn's algorithm. */
export function topologicalSort(tasks: readonly Task[]): Result<readonly Task[], string> {
  const { taskMap, inDegree, dependents } = buildTaskGraph(tasks);
  const readyQueue: Task[] = [];
  for (const task of tasks) {
    if ((inDegree.get(task.id) ?? 0) === 0) {
      insertSorted(readyQueue, task);
    }
  }

  const ctx: GraphContext = { taskMap, inDegree, dependents, readyQueue };
  const sorted: Task[] = [];
  while (readyQueue.length > 0) {
    const current = readyQueue.shift();
    if (current === undefined) {
      break;
    }
    sorted.push(current);
    releaseDependents(current.id, ctx);
  }

  if (sorted.length < tasks.length) {
    return err('Cycle detected in task dependencies');
  }

  return ok(sorted);
}

/** Checks whether a cycle exists within task dependencies. */
export function hasDependencyCycle(tasks: readonly Task[]): boolean {
  return !topologicalSort(tasks).ok;
}

/** Sorts tasks topologically or falls back to stable due date order if a cycle is present. */
export function sortTasksWithFallback(tasks: readonly Task[]): readonly Task[] {
  const result = topologicalSort(tasks);
  if (result.ok) {
    return result.value;
  }
  return [...tasks].sort(compareTasksByDueDate);
}
