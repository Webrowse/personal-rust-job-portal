# Rust Job Sources

A personal dashboard for tracking Rust remote job sources. Built with React, TypeScript, and Vite.

## Features

- **Job Source Management**: Add, edit, and delete job sources
- **Favicon Auto-fetch**: Automatically fetches site favicons for visual identification
- **Tag System**: Organize sources with color-coded tags (job-board, company-direct, startup, enterprise, remote, freelance, aggregator)
- **RSS Feed Support**: Parse and display RSS feeds with Rust keyword highlighting
- **Bulk Actions**: Open all sources, unvisited today, favorites, or by tag
- **Search & Filter**: Quickly find sources by name, URL, notes, or tags
- **Favorites**: Star important sources for quick access
- **Notes**: Add personal notes to each source
- **Visit Tracking**: Track when you last opened each source
- **Dark Mode**: Toggle between light and dark themes
- **Data Persistence**: All data stored in localStorage
- **Import/Export**: Backup and restore your data as JSON

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Adding Sources

1. Enter a URL in the input field (e.g., `jobs.rust-lang.org`)
2. Check "RSS Feed" if the URL is an RSS/Atom feed
3. Click "Add Source"

### Managing Tags

Click the "+ tag" button on any source card to add tags. Pre-defined tags include:
- `job-board` (blue)
- `company-direct` (green)
- `startup` (purple)
- `enterprise` (amber)
- `remote` (teal)
- `freelance` (pink)
- `aggregator` (indigo)

### Bulk Actions

- **Open All**: Opens all regular sources in new tabs
- **Open Unvisited Today**: Opens only sources not yet visited today
- **Open Favorites**: Opens only starred sources
- **Open by Tag**: Opens sources filtered by specific tags

### RSS Feeds

RSS feeds automatically refresh on load and can be manually refreshed. Items containing "Rust", "rustlang", or "rustacean" are highlighted.

### Data Backup

- Click the download icon to export your data as JSON
- Click the upload icon to import previously exported data

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

Or drag and drop the `dist` folder to Netlify's deploy page.

### Manual Deployment

```bash
npm run build
# Upload contents of 'dist' folder to any static host
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **localStorage** - Data persistence

## Suggested Job Sources

- jobs.rust-lang.org
- rustjobs.dev
- www.rustjobs.fyi
- this-week-in-rust.org (RSS)

## License

MIT
