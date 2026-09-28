import React, { useState } from "react";
import { Search, X, Sparkles } from "lucide-react";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = "",
  onSearch,
  placeholder = "Search scholarships, government schemes, fellowships, or states...",
  className = "",
  suggestions = [
    "AICTE Pragati",
    "PM-KISAN",
    "Post-Matric SC",
    "Karnataka",
    "Doctoral PMRF",
    "Women Entrepreneurs",
  ],
}) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  const handleSuggestionClick = (s: string) => {
    setQuery(s);
    onSearch(s);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center shadow-md rounded-2xl bg-white border border-slate-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100 transition-all"
        role="search"
        aria-label="Opportunities search form"
      >
        <div className="pl-4 sm:pl-5 text-slate-400">
          <Search className="w-5 h-5 text-slate-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full py-3.5 sm:py-4 pl-3 pr-24 sm:pr-32 text-slate-900 placeholder-slate-400 text-xs sm:text-base font-normal bg-transparent focus:outline-hidden"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-24 sm:right-28 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear search"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 px-4 sm:px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          aria-label="Perform search"
        >
          <Search className="w-4 h-4 hidden sm:inline" />
          <span>Search</span>
        </button>
      </form>

      {/* Suggested Quick Searches */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 text-xs text-slate-500 px-1">
          <span className="flex items-center gap-1 font-semibold text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Trending:
          </span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200/80 transition-colors cursor-pointer font-medium"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
