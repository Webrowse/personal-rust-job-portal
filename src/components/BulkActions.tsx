import { ExternalLink, Clock, Tag, Star } from 'lucide-react';
import type { JobSource } from '../types';
import { isToday } from '../utils';

interface BulkActionsProps {
  sources: JobSource[];
  onOpenSources: (sources: JobSource[]) => void;
}

export function BulkActions({ sources, onOpenSources }: BulkActionsProps) {
  const regularSources = sources.filter((s) => !s.isRssFeed);
  const unvisitedToday = regularSources.filter((s) => !isToday(s.lastOpened));
  const favorites = regularSources.filter((s) => s.isFavorite);

  // Get unique tags from all sources
  const allTags = [...new Set(regularSources.flatMap((s) => s.tags))];

  const handleOpenAll = () => {
    onOpenSources(regularSources);
  };

  const handleOpenUnvisited = () => {
    onOpenSources(unvisitedToday);
  };

  const handleOpenFavorites = () => {
    onOpenSources(favorites);
  };

  const handleOpenByTag = (tag: string) => {
    const tagSources = regularSources.filter((s) => s.tags.includes(tag));
    onOpenSources(tagSources);
  };

  if (regularSources.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Quick Actions
      </h3>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleOpenAll}
          className="px-3 py-1.5 bg-rust hover:bg-rust-dark text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open All ({regularSources.length})
        </button>

        {unvisitedToday.length > 0 && (
          <button
            onClick={handleOpenUnvisited}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            Open Unvisited Today ({unvisitedToday.length})
          </button>
        )}

        {favorites.length > 0 && (
          <button
            onClick={handleOpenFavorites}
            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5" />
            Open Favorites ({favorites.length})
          </button>
        )}

        {allTags.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 self-center mx-1" />
            {allTags.map((tag) => {
              const count = regularSources.filter((s) => s.tags.includes(tag)).length;
              return (
                <button
                  key={tag}
                  onClick={() => handleOpenByTag(tag)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {tag} ({count})
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
