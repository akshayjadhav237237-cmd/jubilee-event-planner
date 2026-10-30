import { createContext, useContext, useState, type JSX, type ReactNode } from 'react';
import type { PlanStore } from '../state/types';
import { PlanStoreContext } from '../state/hooks';
import { createPlanStore } from '../state/store';
import { createLocalStoragePort } from '../state/persistence';
import type { AssistantProvider } from '../ai/ports';
import { createAssistant } from '../ai/factory';
import { createMemoryApiKey } from '../ai/apiKey';

export const AssistantContext = createContext<AssistantProvider | null>(null);

/** Returns the active assistant provider from context. */
export function useAssistant(): AssistantProvider {
  const assistant = useContext(AssistantContext);
  if (!assistant) {
    throw new Error('useAssistant must be used within an AssistantContext.Provider');
  }
  return assistant;
}

export interface AppProvidersProps {
  readonly children: ReactNode;
  readonly store?: PlanStore;
  readonly assistant?: AssistantProvider;
}

function createDefaultStore(): PlanStore {
  return createPlanStore({
    storage: createLocalStoragePort(),
    clock: () => new Date(),
    ids: () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  });
}

function createDefaultAssistant(): AssistantProvider {
  return createAssistant({
    apiKeyPort: createMemoryApiKey(),
  });
}

/** Provides application dependencies including PlanStore and Assistant contexts. */
export function AppProviders({ children, store, assistant }: AppProvidersProps): JSX.Element {
  const [defaultStore] = useState(createDefaultStore);
  const [defaultAssistant] = useState(createDefaultAssistant);

  const activeStore = store ?? defaultStore;
  const activeAssistant = assistant ?? defaultAssistant;

  return (
    <PlanStoreContext.Provider value={activeStore}>
      <AssistantContext.Provider value={activeAssistant}>{children}</AssistantContext.Provider>
    </PlanStoreContext.Provider>
  );
}
