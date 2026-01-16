export interface JobSource {
  id: string;
  url: string;
  name: string;
  favicon: string;
  tags: string[];
  notes: string;
  isRssFeed: boolean;
  isFavorite: boolean;
  lastOpened: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RssFeedItem {
  title: string;
  link: string;
  pubDate: string;
  content?: string;
  contentSnippet?: string;
}

export interface RssFeed {
  sourceId: string;
  title: string;
  items: RssFeedItem[];
  lastFetched: string;
  error?: string;
}

export interface AppState {
  sources: JobSource[];
  feeds: Record<string, RssFeed>;
  darkMode: boolean;
}

export type TagColor = {
  bg: string;
  text: string;
  darkBg: string;
  darkText: string;
};

export const TAG_COLORS: Record<string, TagColor> = {
  'job-board': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    darkBg: 'dark:bg-blue-900',
    darkText: 'dark:text-blue-200',
  },
  'company-direct': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    darkBg: 'dark:bg-green-900',
    darkText: 'dark:text-green-200',
  },
  startup: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    darkBg: 'dark:bg-purple-900',
    darkText: 'dark:text-purple-200',
  },
  enterprise: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    darkBg: 'dark:bg-amber-900',
    darkText: 'dark:text-amber-200',
  },
  remote: {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    darkBg: 'dark:bg-teal-900',
    darkText: 'dark:text-teal-200',
  },
  freelance: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    darkBg: 'dark:bg-pink-900',
    darkText: 'dark:text-pink-200',
  },
  aggregator: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    darkBg: 'dark:bg-indigo-900',
    darkText: 'dark:text-indigo-200',
  },
  default: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    darkBg: 'dark:bg-gray-700',
    darkText: 'dark:text-gray-200',
  },
};

export function getTagColor(tag: string): TagColor {
  return TAG_COLORS[tag.toLowerCase()] || TAG_COLORS.default;
}
