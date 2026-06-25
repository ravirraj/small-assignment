const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports",
  "Books",
  "Toys",
  "Health",
  "Automotive",
  "Food",
  "Office",
];

interface CategoryFilterProps {
  value: string | null;
  onChange: (category: string | null) => void;
}

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <select
      value={value ?? "All"}
      onChange={(e) => onChange(e.target.value === "All" ? null : e.target.value)}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {CATEGORIES.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );
}
