import { useState, useMemo, useEffect } from 'react';
import {
  AddSourceForm,
  SourceCard,
  RssFeedCard,
  SearchFilter,
  BulkActions,
  AdminLogin,
} from './components';
import { useSupabase } from './hooks';
import type { JobSource, RssFeed } from './types';
import { Rss, Link2, Inbox, RefreshCw, Loader2 } from 'lucide-react';

function App() {
  const {
    sources,
    loading,
    error,
    user,
    isAdmin,
    signIn,
    signOut,
    addSource,
    updateSource,
    deleteSource,
    refreshSources,
  } = useSupabase();

  const [feeds, setFeeds] = useState<Record<string, RssFeed>>({});
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [rssRefreshTrigger, setRssRefreshTrigger] = useState(0);
  const [isRefreshingRss, setIsRefreshingRss] = useState(false);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const setFeed = (sourceId: string, feed: RssFeed) => {
    setFeeds((prev) => ({ ...prev, [sourceId]: feed }));
  };

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
    });
  };

  const handleRefreshAllRss = () => {
    setIsRefreshingRss(true);
    setRssRefreshTrigger((prev) => prev + 1);
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

  const markAsOpened = (id: string) => {
    if (isAdmin) {
      updateSource(id, { lastOpened: new Date().toISOString() });
    }
  };

  const toggleFavorite = (id: string) => {
    if (isAdmin) {
      const source = sources.find((s) => s.id === id);
      if (source) {
        updateSource(id, { isFavorite: !source.isFavorite });
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading sources...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Job Source Manager
              </h1>
              {error && (
                <span className="text-sm text-red-500">{error}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <AdminLogin
                user={user}
                isAdmin={isAdmin}
                onSignIn={signIn}
                onSignOut={signOut}
              />
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={refreshSources}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh sources from database"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Add Source Form - Only show for admin */}
          {isAdmin && <AddSourceForm onAdd={addSource} />}

          {/* Non-admin message */}
          {!isAdmin && !user && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
              You're viewing shared job sources. Login as admin to add or edit sources.
            </div>
          )}

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
                {isAdmin
                  ? 'Add your first job source to start tracking'
                  : 'No sources have been added yet. Check back later!'}
              </p>
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
                    isAdmin={isAdmin}
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
                    isAdmin={isAdmin}
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
          Job Source Manager
        </p>
      </footer>
    </div>
  );
}

export default App;
