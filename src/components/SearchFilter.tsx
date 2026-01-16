import { Search, X, Star } from 'lucide-react';
import { TagBadge } from './TagBadge';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagToggle,
  availableTags,
  showFavoritesOnly,
  onToggleFavorites,
}: SearchFilterProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search sources..."
            className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rust focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Favorites toggle */}
        <button
          onClick={onToggleFavorites}
          className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
            showFavoritesOnly
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-yellow-300 dark:hover:border-yellow-700'
          }`}
        >
          <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">Favorites</span>
        </button>
      </div>

      {/* Tags filter */}
      {availableTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
            Filter by tag:
          </span>
          {availableTags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              onClick={() => onTagToggle(tag)}
              size={selectedTags.includes(tag) ? 'md' : 'sm'}
            />
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => selectedTags.forEach(onTagToggle)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
