import { useState, useMemo, useEffect } from 'react';
import {
  Header,
  AddSourceForm,
  SourceCard,
  RssFeedCard,
  SearchFilter,
  BulkActions,
} from './components';
import { useJobSources } from './hooks';
import type { JobSource } from './types';
import { Rss, Link2, Inbox, RefreshCw } from 'lucide-react';

function App() {
  const {
    sources,
    feeds,
    darkMode,
    addSource,
    updateSource,
    deleteSource,
    markAsOpened,
    toggleFavorite,
    setFeed,
    toggleDarkMode,
    exportData,
    importData,
    refreshAllMetadata,
  } = useJobSources();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rssRefreshTrigger, setRssRefreshTrigger] = useState(0);
  const [isRefreshingRss, setIsRefreshingRss] = useState(false);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    sources.forEach((source) => {
      source.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [sources]);

  // Filter sources
  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          source.name.toLowerCase().includes(query) ||
          source.url.toLowerCase().includes(query) ||
          source.notes.toLowerCase().includes(query) ||
          source.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some((tag) =>
          source.tags.includes(tag)
        );
        if (!hasSelectedTag) return false;
      }

      // Favorites filter
      if (showFavoritesOnly && !source.isFavorite) {
        return false;
      }

      return true;
    });
  }, [sources, searchQuery, selectedTags, showFavoritesOnly]);

  // Split into regular sources and RSS feeds
  const regularSources = filteredSources.filter((s) => !s.isRssFeed);
  const rssSources = filteredSources.filter((s) => s.isRssFeed);

  // Sort: favorites first, then by last opened (most recent first), then by name
  const sortedRegularSources = useMemo(() => {
    return [...regularSources].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }
      if (a.lastOpened && b.lastOpened) {
        return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
      }
      if (a.lastOpened) return -1;
      if (b.lastOpened) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [regularSources]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleOpenSources = (sourcesToOpen: JobSource[]) => {
    sourcesToOpen.forEach((source) => {
      window.open(source.url, '_blank');
      markAsOpened(source.id);
    });
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllMetadata();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshAllRss = () => {
    setIsRefreshingRss(true);
    setRssRefreshTrigger((prev) => prev + 1);
    // Reset the refreshing state after a delay
    setTimeout(() => setIsRefreshingRss(false), 2000);
  };

  // Auto-refresh RSS feeds every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (rssSources.length > 0) {
        setRssRefreshTrigger((prev) => prev + 1);
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [rssSources.length]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onExport={exportData}
        onImport={importData}
        onRefreshAll={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Add Source Form */}
          <AddSourceForm onAdd={addSource} />

          {/* Search and Filter */}
          {sources.length > 0 && (
            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              availableTags={allTags}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
            />
          )}

          {/* Bulk Actions */}
          {regularSources.length > 0 && (
            <BulkActions
              sources={filteredSources}
              onOpenSources={handleOpenSources}
            />
          )}

          {/* Empty State */}
          {sources.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <Inbox className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No job sources yet
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add your first Rust job source to start tracking
              </p>
              <div className="text-sm text-gray-400 dark:text-gray-500">
                <p>Try adding these popular sources:</p>
                <ul className="mt-2 space-y-1">
                  <li>jobs.rust-lang.org</li>
                  <li>rustjobs.dev</li>
                  <li>www.indeed.com/q-Rust-Developer-Remote-jobs.html</li>
                </ul>
              </div>
            </div>
          )}

          {/* No Results */}
          {sources.length > 0 && filteredSources.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                No sources match your filters
              </p>
            </div>
          )}

          {/* Regular Sources */}
          {sortedRegularSources.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Job Sources
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({sortedRegularSources.length})
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedRegularSources.map((source) => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    onUpdate={updateSource}
                    onDelete={deleteSource}
                    onOpen={markAsOpened}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}

          {/* RSS Feeds */}
          {rssSources.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Rss className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  RSS Feeds
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({rssSources.length})
                </span>
                <button
                  onClick={handleRefreshAllRss}
                  disabled={isRefreshingRss}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh all RSS feeds"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingRss ? 'animate-spin' : ''}`} />
                  Refresh All
                </button>
              </div>
              <div className="space-y-4">
                {rssSources.map((source) => (
                  <RssFeedCard
                    key={source.id}
                    source={source}
                    feed={feeds[source.id]}
                    onFeedUpdate={setFeed}
                    onDelete={deleteSource}
                    autoRefreshTrigger={rssRefreshTrigger}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Personal Rust Job Source Manager
        </p>
      </footer>
    </div>
  );
}

export default App;
