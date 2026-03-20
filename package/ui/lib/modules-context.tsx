'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, ModuleStatus } from './api-client';

interface ModulesContextValue {
  modules: ModuleStatus[];
  isLoading: boolean;
  isModuleAvailable: (id: string) => boolean;
}

const ModulesContext = createContext<ModulesContextValue>({
  modules: [],
  isLoading: true,
  isModuleAvailable: () => false,
});

export function ModulesProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getModules()
      .then(setModules)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const isModuleAvailable = (id: string) =>
    modules.some((m) => m.id === id && m.available);

  return (
    <ModulesContext.Provider value={{ modules, isLoading, isModuleAvailable }}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  return useContext(ModulesContext);
}
