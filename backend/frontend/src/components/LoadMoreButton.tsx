interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
}

export default function LoadMoreButton({
  onClick,
  loading,
  hasMore,
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        No more products to load.
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8">
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Loading..." : "Load More"}
      </button>
    </div>
  );
}
