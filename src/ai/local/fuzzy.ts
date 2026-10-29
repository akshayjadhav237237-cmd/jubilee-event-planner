import type { Task } from '../../domain/types';
import { CATEGORY_ALIASES } from './aliases';

export { CATEGORY_ALIASES };

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ph/g, 'f')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

interface DamerauContext {
  readonly width: number;
  readonly a: string;
  readonly b: string;
}

function checkTransposition(a: string, b: string, i: number, j: number): boolean {
  if (i <= 1 || j <= 1) return false;
  return a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1);
}

function computeCell(dp: Int32Array, i: number, j: number, ctx: DamerauContext): number {
  const cost = ctx.a.charCodeAt(i - 1) === ctx.b.charCodeAt(j - 1) ? 0 : 1;
  const del = (dp[(i - 1) * ctx.width + j] ?? 0) + 1;
  const ins = (dp[i * ctx.width + (j - 1)] ?? 0) + 1;
  const sub = (dp[(i - 1) * ctx.width + (j - 1)] ?? 0) + cost;
  let min = Math.min(del, ins, sub);

  if (checkTransposition(ctx.a, ctx.b, i, j)) {
    const trans = (dp[(i - 2) * ctx.width + (j - 2)] ?? 0) + 1;
    if (trans < min) min = trans;
  }
  return min;
}

function damerauDist(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const width = bl + 1;
  const dp = new Int32Array((al + 1) * width);
  for (let i = 0; i <= al; i += 1) dp[i * width] = i;
  for (let j = 0; j <= bl; j += 1) dp[j] = j;

  const ctx: DamerauContext = { width, a, b };
  for (let i = 1; i <= al; i += 1) {
    for (let j = 1; j <= bl; j += 1) {
      dp[i * width + j] = computeCell(dp, i, j, ctx);
    }
  }
  return dp[al * width + bl] ?? Math.max(al, bl);
}

function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxL = Math.max(a.length, b.length);
  if (maxL === 0) return 1;
  const dist = damerauDist(a, b);
  return Math.max(0, 1 - dist / maxL);
}

function scoreCategoryCandidate(query: string, targetId: string, targetName: string): number {
  const normQ = normalizeText(query);
  const normId = normalizeText(targetId);
  const normName = normalizeText(targetName);

  if (normQ === normId || normQ === normName) return 1.0;
  const aliasTarget = CATEGORY_ALIASES[normQ];
  if (aliasTarget === targetId) return 0.98;

  const nameWords = normName.split(' ');
  for (const w of nameWords) {
    if (w === normQ) return 0.92;
    if (normQ.length >= 4 && w.length >= 4) {
      const sim = wordSimilarity(normQ, w);
      if (sim >= 0.75) return 0.7 + sim * 0.2;
    }
  }

  const idSim = wordSimilarity(normQ, normId);
  const nameSim = wordSimilarity(normQ, normName);
  const maxSim = Math.max(idSim, nameSim);
  return maxSim >= 0.7 ? maxSim * 0.8 : 0;
}

export interface CategoryMatch {
  readonly id: string;
  readonly name: string;
  readonly score: number;
}

export interface TaskMatch {
  readonly task: Task;
  readonly score: number;
}

/** Matches a natural language query against plan categories using aliases and typo tolerance. */
export function fuzzyMatchCategory(
  query: string,
  categories: readonly { id: string; name: string }[],
): CategoryMatch | null {
  const candidates = findCategoryCandidates(query, categories);
  const best = candidates[0];
  if (best && best.score >= 0.65) {
    const second = candidates[1];
    if (second && second.score >= 0.65 && Math.abs(best.score - second.score) < 0.05) {
      return null;
    }
    return best;
  }
  return null;
}

/** Finds all category candidates ranked by relevance score for clarification disambiguation. */
export function findCategoryCandidates(
  query: string,
  categories: readonly { id: string; name: string }[],
): readonly CategoryMatch[] {
  return categories
    .map((c) => ({ id: c.id, name: c.name, score: scoreCategoryCandidate(query, c.id, c.name) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);
}

function matchTokens(q: string, t: string): boolean {
  if (q === t) return true;
  if (q.length >= 4 && t.length >= 4) {
    return wordSimilarity(q, t) >= 0.75;
  }
  return false;
}

function countMatchingTokens(qTokens: readonly string[], tTokens: readonly string[]): number {
  let matches = 0;
  for (const q of qTokens) {
    for (const t of tTokens) {
      if (matchTokens(q, t)) {
        matches += 1;
        break;
      }
    }
  }
  return matches;
}

function scoreTaskCandidate(query: string, task: Task): number {
  const normQ = normalizeText(query);
  const normT = normalizeText(task.title);
  if (normQ === normT) return 1.0;
  if (normT.includes(normQ) || normQ.includes(normT)) return 0.85;

  const qTokens = normQ.split(' ').filter((t) => t.length > 2);
  const tTokens = normT.split(' ').filter((t) => t.length > 2);
  if (qTokens.length === 0 || tTokens.length === 0) return 0;

  const matches = countMatchingTokens(qTokens, tTokens);
  return matches / Math.max(qTokens.length, 1);
}

/** Matches a natural language query against plan tasks using token overlap and fuzzy similarity. */
export function fuzzyMatchTask(query: string, tasks: readonly Task[]): TaskMatch | null {
  const candidates = findTaskCandidates(query, tasks);
  const best = candidates[0];
  if (best && best.score >= 0.5) {
    const second = candidates[1];
    if (second && second.score >= 0.5 && Math.abs(best.score - second.score) < 0.05) {
      return null;
    }
    return best;
  }
  return null;
}

/** Finds all task candidates ranked by relevance score for ambiguity clarification. */
export function findTaskCandidates(query: string, tasks: readonly Task[]): readonly TaskMatch[] {
  return tasks
    .map((t) => ({ task: t, score: scoreTaskCandidate(query, t) }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);
}
