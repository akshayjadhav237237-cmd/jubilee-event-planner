import { ALL_IDEAS } from '../../data/ideas';
import { ok, type Result } from '../../domain/result';
import type { IdeaItem } from '../../domain/types';
import type { AiError, AssistantInput, AssistantProvider, AssistantResult } from '../ports';
import { parseBudgetIntent } from './budgetParser';
import { parseTimelineIntent } from './timelineParser';

function parseSaveIdea(prompt: string): AssistantResult | null {
  const match = prompt.match(/\b(?:save|add|keep)\s+idea\s*[-:]?\s*(.+)/i);
  if (!match) return null;

  const rawTitle = match[1]?.trim().replace(/^["':\s]+|["'\s]+$/g, '') ?? '';
  if (rawTitle.length === 0) {
    return {
      kind: 'clarify',
      question: 'Please specify the title of the idea you would like to save.',
    };
  }

  const queryNorm = rawTitle.toLowerCase();
  const matched =
    ALL_IDEAS.find((item) => item.title.toLowerCase() === queryNorm) ??
    ALL_IDEAS.find(
      (item) =>
        item.title.toLowerCase().includes(queryNorm) ||
        queryNorm.includes(item.title.toLowerCase()),
    );

  const idea: IdeaItem = matched
    ? {
        id: matched.id,
        title: matched.title,
        category: matched.category,
        description: matched.description,
        votes: 0,
      }
    : {
        id: `idea_custom_${Date.now()}`,
        title: rawTitle,
        category: 'theme',
        description: `Custom saved idea: ${rawTitle}`,
        votes: 0,
      };

  return {
    kind: 'commands',
    commands: [{ type: 'SAVE_IDEA', idea }],
    summary: `Saved idea "${idea.title}".`,
  };
}

function resolveClarification(prompt: string): AssistantResult {
  const norm = prompt.toLowerCase();
  if (norm.includes('transfer') || norm.includes('budget') || norm.includes('contingency')) {
    return {
      kind: 'clarify',
      question: 'Please specify the amount and categories for the budget operation.',
    };
  }
  if (norm.includes('task') || norm.includes('reschedule') || norm.includes('postpone')) {
    return {
      kind: 'clarify',
      question: 'Please specify the task title and the intended change.',
    };
  }
  return {
    kind: 'clarify',
    question:
      'I could not determine your request. You can transfer budget, adjust weights, toggle tasks, or save ideas.',
  };
}

/** Creates a local deterministic assistant provider that interprets offline natural language commands. */
export function createLocalAssistant(): AssistantProvider {
  return {
    mode: 'offline',
    interpret: async (input: AssistantInput): Promise<Result<AssistantResult, AiError>> => {
      const budgetResult = parseBudgetIntent(input.prompt, input.plan);
      if (budgetResult) {
        return ok(budgetResult);
      }

      const timelineResult = parseTimelineIntent(input.prompt, input.plan, input.today);
      if (timelineResult) {
        return ok(timelineResult);
      }

      const ideaResult = parseSaveIdea(input.prompt);
      if (ideaResult) {
        return ok(ideaResult);
      }

      return ok(resolveClarification(input.prompt));
    },
  };
}
