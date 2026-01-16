import { useState } from 'react';
import { Plus, Rss, Link } from 'lucide-react';

interface AddSourceFormProps {
  onAdd: (url: string, isRssFeed?: boolean) => Promise<unknown>;
}

export function AddSourceForm({ onAdd }: AddSourceFormProps) {
  const [url, setUrl] = useState('');
  const [isRssFeed, setIsRssFeed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    // Basic URL validation
    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    try {
      new URL(validUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    try {
      await onAdd(validUrl, isRssFeed);
      setUrl('');
      setIsRssFeed(false);
    } catch (error) {
      console.error('Failed to add source:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL (e.g., jobs.rust-lang.org)"
            className="w-full px-4 py-2.5 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rust focus:border-transparent"
            disabled={isLoading}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {isRssFeed ? <Rss className="w-4 h-4" /> : <Link className="w-4 h-4" />}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isRssFeed}
              onChange={(e) => setIsRssFeed(e.target.checked)}
              className="w-4 h-4 text-rust bg-gray-100 border-gray-300 rounded focus:ring-rust dark:bg-gray-700 dark:border-gray-600"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">RSS Feed</span>
          </label>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-4 py-2.5 bg-rust hover:bg-rust-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isLoading ? 'Adding...' : 'Add Source'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
