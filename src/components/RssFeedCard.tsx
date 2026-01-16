import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, AlertCircle, Rss, Trash2 } from 'lucide-react';
import type { JobSource, RssFeed } from '../types';
import { formatDate, highlightRustKeyword, containsRustKeyword } from '../utils';
import { useRssFeed } from '../hooks/useRssFeed';

interface RssFeedCardProps {
  source: JobSource;
  feed?: RssFeed;
  onFeedUpdate: (sourceId: string, feed: RssFeed) => void;
  onDelete: (id: string) => void;
  autoRefreshTrigger?: number;
}

export function RssFeedCard({ source, feed, onFeedUpdate, onDelete, autoRefreshTrigger }: RssFeedCardProps) {
  const { parseRssFeed, loading } = useRssFeed();
  const [isExpanded, setIsExpanded] = useState(true);

  const isLoading = loading[source.id];

  const handleRefresh = async () => {
    const newFeed = await parseRssFeed(source.id, source.url);
    onFeedUpdate(source.id, newFeed);
  };

  useEffect(() => {
    // Auto-fetch if no feed data or data is older than 1 hour
    if (!feed || !feed.lastFetched) {
      handleRefresh();
    } else {
      const lastFetched = new Date(feed.lastFetched).getTime();
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      if (lastFetched < oneHourAgo) {
        handleRefresh();
      }
    }
  }, [source.id]);

  // Refresh when autoRefreshTrigger changes
  useEffect(() => {
    if (autoRefreshTrigger && autoRefreshTrigger > 0) {
      handleRefresh();
    }
  }, [autoRefreshTrigger]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            {source.favicon ? (
              <img
                src={source.favicon}
                alt=""
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Rss className="w-5 h-5 text-orange-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {feed?.title || source.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {feed?.lastFetched
                ? `Updated ${formatDate(feed.lastFetched)}`
                : 'Not yet fetched'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-gray-400 hover:text-rust hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Open feed URL"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this RSS feed?')) {
                onDelete(source.id);
              }
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Delete feed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feed Items */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {feed?.error ? (
            <div className="p-4 flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{feed.error}</span>
            </div>
          ) : !feed?.items.length ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {isLoading ? 'Loading feed...' : 'No items found'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {feed.items.map((item, index) => {
                const hasRust = containsRustKeyword(
                  item.title + ' ' + (item.contentSnippet || '')
                );

                return (
                  <li
                    key={index}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                      hasRust ? 'bg-rust/5 dark:bg-rust/10' : ''
                    }`}
                  >
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <h4
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-rust transition-colors"
                        dangerouslySetInnerHTML={{
                          __html: highlightRustKeyword(item.title),
                        }}
                      />
                      {item.contentSnippet && (
                        <p
                          className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: highlightRustKeyword(item.contentSnippet),
                          }}
                        />
                      )}
                      {item.pubDate && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(item.pubDate)}
                        </p>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
