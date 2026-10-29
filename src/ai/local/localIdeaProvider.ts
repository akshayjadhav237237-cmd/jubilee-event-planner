import { ALL_IDEAS } from '../../data/ideas';
import { selectIdeas } from '../../domain/ideas';
import { ok, type Result } from '../../domain/result';
import type { IdeaItem } from '../../domain/types';
import type { AiError, IdeaInput, IdeaProvider } from '../ports';

/** Creates an offline deterministic idea provider backed by the static curated catalog. */
export function createLocalIdeaProvider(): IdeaProvider {
  return {
    mode: 'offline',
    suggest: async (input: IdeaInput): Promise<Result<readonly IdeaItem[], AiError>> => {
      const filteredCatalog = input.category
        ? ALL_IDEAS.filter((i) => i.category === input.category)
        : undefined;

      const options =
        filteredCatalog !== undefined
          ? input.limit !== undefined
            ? { catalog: filteredCatalog, limit: input.limit }
            : { catalog: filteredCatalog }
          : input.limit !== undefined
            ? { limit: input.limit }
            : undefined;

      const ideas = selectIdeas(input.plan.brief, options);
      return ok(ideas);
    },
  };
}
