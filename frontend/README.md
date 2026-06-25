# Product Browser Frontend

A minimal React frontend for demonstrating the Product Browser backend API.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Axios

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (proxies /api to localhost:3000)
npm run dev
```

The backend must be running on port 3000 before starting the frontend.

## Features

- Browse 200,000 products in a responsive grid
- Filter by category via dropdown
- Cursor-based "Load More" pagination
- Products load automatically on page visit
- Loading spinner and error states with retry
- Snapshot-aware for consistent browsing

## Project Structure

```
src/
  components/
    ProductCard.tsx       - Single product card
    ProductGrid.tsx       - Grid layout for products
    CategoryFilter.tsx    - Category dropdown selector
    LoadMoreButton.tsx    - Load more pagination button
    ErrorDisplay.tsx      - Error message with retry
    LoadingSpinner.tsx    - Loading indicator
  services/
    api.ts               - Axios client and API functions
  types/
    product.ts           - TypeScript interfaces
  App.tsx                - Main app with state management
  main.tsx               - Entry point
```

## API Integration

Communicates with `GET /api/products` via Vite's dev server proxy.

Query parameters: `limit`, `cursor`, `category`, `snapshot`.

The cursor and snapshot are maintained internally and reset when the category changes.

## Build

```bash
npm run build   # Output in dist/
npm run preview # Preview production build
```
