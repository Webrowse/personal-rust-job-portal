import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { JobSource, RssFeed, AppState } from '../types';
import { createNewSource, fetchSiteMetadata } from '../utils';

const INITIAL_STATE: AppState = {
  sources: [],
  feeds: {},
  darkMode: false,
};

export function useJobSources() {
  const [state, setState] = useLocalStorage<AppState>('rust-job-sources', INITIAL_STATE);

  const addSource = useCallback(
    async (url: string, isRssFeed: boolean = false) => {
      const newSource = createNewSource(url, isRssFeed);

      // Try to fetch metadata
      const metadata = await fetchSiteMetadata(url);
      newSource.name = metadata.title;
      newSource.favicon = metadata.favicon;

      setState((prev) => ({
        ...prev,
        sources: [...prev.sources, newSource],
      }));

      return newSource;
    },
    [setState]
  );

  const updateSource = useCallback(
    (id: string, updates: Partial<JobSource>) => {
      setState((prev) => ({
        ...prev,
        sources: prev.sources.map((source) =>
          source.id === id
            ? { ...source, ...updates, updatedAt: new Date().toISOString() }
            : source
        ),
      }));
    },
    [setState]
  );

  const deleteSource = useCallback(
    (id: string) => {
      setState((prev) => {
        const newFeeds = { ...prev.feeds };
        delete newFeeds[id];
        return {
          ...prev,
          sources: prev.sources.filter((source) => source.id !== id),
          feeds: newFeeds,
        };
      });
    },
    [setState]
  );

  const markAsOpened = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setState((prev) => ({
        ...prev,
        sources: prev.sources.map((source) =>
          source.id === id ? { ...source, lastOpened: now } : source
        ),
      }));
    },
    [setState]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        sources: prev.sources.map((source) =>
          source.id === id ? { ...source, isFavorite: !source.isFavorite } : source
        ),
      }));
    },
    [setState]
  );

  const setFeed = useCallback(
    (sourceId: string, feed: RssFeed) => {
      setState((prev) => ({
        ...prev,
        feeds: { ...prev.feeds, [sourceId]: feed },
      }));
    },
    [setState]
  );

  const toggleDarkMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      darkMode: !prev.darkMode,
    }));
  }, [setState]);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rust-job-sources-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importData = useCallback(
    (data: AppState) => {
      setState(data);
    },
    [setState]
  );

  const refreshMetadata = useCallback(
    async (id: string) => {
      const source = state.sources.find((s) => s.id === id);
      if (!source) return;

      const metadata = await fetchSiteMetadata(source.url);
      updateSource(id, {
        name: metadata.title,
        favicon: metadata.favicon,
      });
    },
    [state.sources, updateSource]
  );

  const refreshAllMetadata = useCallback(async () => {
    for (const source of state.sources) {
      await refreshMetadata(source.id);
    }
  }, [state.sources, refreshMetadata]);

  return {
    sources: state.sources,
    feeds: state.feeds,
    darkMode: state.darkMode,
    addSource,
    updateSource,
    deleteSource,
    markAsOpened,
    toggleFavorite,
    setFeed,
    toggleDarkMode,
    exportData,
    importData,
    refreshMetadata,
    refreshAllMetadata,
  };
}
