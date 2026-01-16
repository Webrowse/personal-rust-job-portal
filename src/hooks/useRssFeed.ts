import { useCallback, useState } from 'react';
import type { RssFeed, RssFeedItem } from '../types';

const CORS_PROXIES = [
  { url: 'https://api.allorigins.win/get?url=', type: 'json' },
  { url: 'https://api.codetabs.com/v1/proxy?quest=', type: 'raw' },
  { url: 'https://thingproxy.freeboard.io/fetch/', type: 'raw' },
];

async function fetchWithProxy(url: string): Promise<string> {
  let lastError: Error | null = null;

  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxy.url}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (proxy.type === 'json') {
        const data = await response.json();
        if (!data.contents) {
          throw new Error('No contents in response');
        }
        return data.contents;
      } else {
        return await response.text();
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      continue;
    }
  }

  throw lastError || new Error('All proxies failed');
}

export function useRssFeed() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const parseRssFeed = useCallback(async (sourceId: string, url: string): Promise<RssFeed> => {
    setLoading((prev) => ({ ...prev, [sourceId]: true }));

    try {
      const contents = await fetchWithProxy(url);

      const parser = new DOMParser();
      const xml = parser.parseFromString(contents, 'text/xml');

      const parseError = xml.querySelector('parsererror');
      if (parseError) {
        throw new Error('Invalid RSS feed');
      }

      // Try RSS format first
      let items: RssFeedItem[] = [];
      let feedTitle = '';

      const rssItems = xml.querySelectorAll('item');
      if (rssItems.length > 0) {
        feedTitle =
          xml.querySelector('channel > title')?.textContent || 'Unknown Feed';
        items = Array.from(rssItems).map((item) => ({
          title: item.querySelector('title')?.textContent || 'Untitled',
          link: item.querySelector('link')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          content: item.querySelector('content\\:encoded')?.textContent || '',
          contentSnippet:
            item.querySelector('description')?.textContent?.slice(0, 200) || '',
        }));
      } else {
        // Try Atom format
        const atomEntries = xml.querySelectorAll('entry');
        if (atomEntries.length > 0) {
          feedTitle = xml.querySelector('feed > title')?.textContent || 'Unknown Feed';
          items = Array.from(atomEntries).map((entry) => ({
            title: entry.querySelector('title')?.textContent || 'Untitled',
            link:
              entry.querySelector('link')?.getAttribute('href') ||
              entry.querySelector('link')?.textContent ||
              '',
            pubDate:
              entry.querySelector('published')?.textContent ||
              entry.querySelector('updated')?.textContent ||
              '',
            content: entry.querySelector('content')?.textContent || '',
            contentSnippet:
              entry.querySelector('summary')?.textContent?.slice(0, 200) || '',
          }));
        }
      }

      // Sort by date (newest first)
      items.sort((a, b) => {
        const dateA = new Date(a.pubDate || 0).getTime();
        const dateB = new Date(b.pubDate || 0).getTime();
        return dateB - dateA;
      });

      // Limit to latest 10 items
      items = items.slice(0, 10);

      setLoading((prev) => ({ ...prev, [sourceId]: false }));

      return {
        sourceId,
        title: feedTitle,
        items,
        lastFetched: new Date().toISOString(),
      };
    } catch (error) {
      setLoading((prev) => ({ ...prev, [sourceId]: false }));
      return {
        sourceId,
        title: 'Error',
        items: [],
        lastFetched: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to fetch feed',
      };
    }
  }, []);

  return { parseRssFeed, loading };
}
