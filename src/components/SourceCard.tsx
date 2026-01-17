import { useState, useEffect } from 'react';
import {
  ExternalLink,
  Star,
  Trash2,
  Edit2,
  X,
  Check,
  Rss,
  Plus,
} from 'lucide-react';
import type { JobSource } from '../types';
import { TagBadge } from './TagBadge';
import { formatDate, isToday } from '../utils';

// Local storage key for tracking visited sources
const VISITED_SOURCES_KEY = 'visited-sources';

function getVisitedSources(): Set<string> {
  try {
    const stored = localStorage.getItem(VISITED_SOURCES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function markSourceVisited(sourceId: string): void {
  const visited = getVisitedSources();
  visited.add(sourceId);
  localStorage.setItem(VISITED_SOURCES_KEY, JSON.stringify([...visited]));
}

interface SourceCardProps {
  source: JobSource;
  onUpdate: (id: string, updates: Partial<JobSource>) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isAdmin?: boolean;
}

export function SourceCard({
  source,
  onUpdate,
  onDelete,
  onOpen,
  onToggleFavorite,
  isAdmin = false,
}: SourceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(source.notes);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isVisited, setIsVisited] = useState(false);

  useEffect(() => {
    setIsVisited(getVisitedSources().has(source.id));
  }, [source.id]);

  const handleOpen = (e?: React.MouseEvent) => {
    // Don't open if clicking on interactive elements
    if (e) {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea')
      ) {
        return;
      }
    }

    window.open(source.url, '_blank');
    onOpen(source.id);
    markSourceVisited(source.id);
    setIsVisited(true);
  };

  const handleSaveNotes = () => {
    onUpdate(source.id, { notes: editedNotes });
    setIsEditing(false);
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !source.tags.includes(tag)) {
      onUpdate(source.id, { tags: [...source.tags, tag] });
    }
    setNewTag('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tag: string) => {
    onUpdate(source.id, { tags: source.tags.filter((t) => t !== tag) });
  };

  const visitedToday = isToday(source.lastOpened);

  return (
    <div
      onClick={handleOpen}
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-all hover:shadow-md cursor-pointer ${
        isVisited
          ? 'border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${
            isVisited
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {source.favicon ? (
              <img
                src={source.favicon}
                alt=""
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className={`text-lg font-bold ${isVisited ? 'text-green-500' : 'text-gray-400'}`}>
                {source.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold truncate ${
              isVisited
                ? 'text-green-700 dark:text-green-400'
                : 'text-gray-900 dark:text-white'
            }`}>
              {source.name}
            </h3>
            {source.isRssFeed && (
              <Rss className="w-4 h-4 text-orange-500 flex-shrink-0" />
            )}
            {isVisited && (
              <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                Visited
              </span>
            )}
            {isAdmin && visitedToday && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                Today
              </span>
            )}
          </div>

          <p className={`text-sm truncate ${
            isVisited
              ? 'text-green-600/70 dark:text-green-500/70'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {source.url}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
            {source.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} onRemove={isAdmin ? () => handleRemoveTag(tag) : undefined} />
            ))}
            {isAdmin && (
              showTagInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTag();
                      if (e.key === 'Escape') setShowTagInput(false);
                    }}
                    placeholder="tag name"
                    className="w-20 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-1 focus:ring-rust"
                    autoFocus
                  />
                  <button
                    onClick={handleAddTag}
                    className="p-0.5 text-green-600 hover:text-green-700"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setShowTagInput(false)}
                    className="p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTagInput(true)}
                  className="text-xs px-2 py-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-dashed border-gray-300 dark:border-gray-600 rounded-full"
                >
                  <Plus className="w-3 h-3 inline" /> tag
                </button>
              )
            )}
          </div>

          {/* Notes */}
          <div onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full text-sm px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-rust resize-none"
                  rows={2}
                  placeholder="Add notes..."
                  autoFocus
                />
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleSaveNotes}
                    className="text-xs px-2 py-1 bg-rust text-white rounded hover:bg-rust-dark"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedNotes(source.notes);
                      setIsEditing(false);
                    }}
                    className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : source.notes ? (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {source.notes}
              </p>
            ) : null}
          </div>

          {/* Last opened - only show for admin */}
          {isAdmin && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Last opened: {formatDate(source.lastOpened)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
          {isAdmin && (
            <button
              onClick={() => onToggleFavorite(source.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                source.isFavorite
                  ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={source.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${source.isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit notes"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleOpen()}
            className="p-1.5 text-gray-400 hover:text-rust hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                if (confirm('Delete this source?')) {
                  onDelete(source.id);
                }
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Delete source"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
