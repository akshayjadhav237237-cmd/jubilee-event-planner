import type { AiContext } from '../context';

function summarizeCategories(
  categories: readonly {
    id: string;
    name: string;
    weight: number;
    allocatedMinor: number;
  }[],
): string {
  return categories
    .map((c) => `${c.id} (${c.name}): alloc=${c.allocatedMinor}, wt=${c.weight}`)
    .join('; ');
}

function summarizeTasks(
  tasks: readonly {
    id: string;
    title: string;
    completed: boolean;
  }[],
): string {
  return tasks.map((t) => `${t.id}: "${t.title}" (${t.completed ? 'done' : 'pending'})`).join('; ');
}

/** Builds the prompt string containing event context, system instructions, and nonce-wrapped user input. */
export function buildGeminiPrompt(
  context: AiContext,
  sanitizedUserText: string,
  nonce: string,
): string {
  const categories = summarizeCategories(context.categories);
  const tasks = summarizeTasks(context.tasks);

  return [
    'You are Jubilee AI Event Assistant. Output STRICT JSON only.',
    'Response must be one of three shapes:',
    '1) { "kind": "commands", "commands": [...], "summary": "..." }',
    '2) { "kind": "clarify", "question": "..." }',
    '3) { "kind": "refuse", "reason": "..." }',
    `Event: ${context.eventType}/${context.subFormat}, Setting: ${context.setting}`,
    `Budget: ${context.totalBudget} ${context.currency}, Guests: ${context.guestCount}, Days until event: ${context.daysUntilEvent}`,
    `Categories: ${categories}`,
    `Tasks: ${tasks}`,
    `<user_prompt nonce="${nonce}">`,
    sanitizedUserText,
    '</user_prompt>',
  ].join('\n');
}

/** Builds the JSON request body payload for the Gemini generateContent API. */
export function buildGeminiRequestBody(compiledPrompt: string): string {
  return JSON.stringify({
    contents: [
      {
        parts: [{ text: compiledPrompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });
}
