import { v4 as uuidv4 } from 'uuid';
import type { JobSource } from '../types';

export function generateId(): string {
  return uuidv4();
}

export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    return '';
  }
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isToday(dateString: string | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function createNewSource(url: string, isRssFeed: boolean = false): JobSource {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    url,
    name: extractDomain(url),
    favicon: getFaviconUrl(url),
    tags: [],
    notes: '',
    isRssFeed,
    isFavorite: false,
    lastOpened: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function highlightRustKeyword(text: string): string {
  const regex = /\b(rust|rustlang|rustacean)\b/gi;
  return text.replace(regex, '<span class="rust-highlight">$1</span>');
}

export function containsRustKeyword(text: string): boolean {
  const regex = /\b(rust|rustlang|rustacean)\b/gi;
  return regex.test(text);
}

export async function fetchSiteMetadata(url: string): Promise<{ title: string; favicon: string }> {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');

    const title = doc.querySelector('title')?.textContent || extractDomain(url);
    const favicon = getFaviconUrl(url);

    return { title, favicon };
  } catch {
    return { title: extractDomain(url), favicon: getFaviconUrl(url) };
  }
}
