"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length < 2) {
        setResults(null);
        return;
      }

      setLoading(true);

      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();

      setResults(data);
      setLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleNavigateStation = (id: number) => {
    router.push(`/station/${id}`);
    setQuery("");
    setResults(null);
  };

  const handleNavigateCatalogue = (type: string, value: string) => {
    router.push(`/catalogue?${type}=${encodeURIComponent(value)}`);
    setQuery("");
    setResults(null);
  };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search station, line or ad format..."
        className="w-full rounded-full border border-gray-200 px-4 py-3 pl-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
      />

      {/* dropdown */}
      {results && (
        <div className="absolute top-14 left-0 w-full bg-white border rounded-xl shadow-lg z-50 max-h-96 overflow-auto">

          {loading && (
            <div className="p-4 text-sm text-gray-500">Searching...</div>
          )}

          {/* Stations */}
          {results.stations?.length > 0 && (
            <div className="p-3 border-b">
              <div className="text-xs text-gray-400 mb-2">Stations</div>
              {results.stations.map((s: any) => (
                <div
                  key={s.id}
                  onClick={() => handleNavigateStation(s.id)}
                  className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                >
                  🚉 {s.name}
                </div>
              ))}
            </div>
          )}

          {/* Lines */}
          {results.lines?.length > 0 && (
            <div className="p-3 border-b">
              <div className="text-xs text-gray-400 mb-2">Metro Lines</div>
              {results.lines.map((l: any) => (
                <div
                  key={l.id}
                  onClick={() => handleNavigateCatalogue("line", l.name)}
                  className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                >
                  🚇 {l.name} Line
                </div>
              ))}
            </div>
          )}

          {/* Products */}
          {results.products?.length > 0 && (
            <div className="p-3">
              <div className="text-xs text-gray-400 mb-2">Ad Formats</div>
              {results.products.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => handleNavigateCatalogue("inventory", p.name)}
                  className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                >
                  📢 {p.name}
                </div>
              ))}
            </div>
          )}

          {/* no results */}
          {!loading &&
            results.stations.length === 0 &&
            results.lines.length === 0 &&
            results.products.length === 0 && (
              <div className="p-4 text-sm text-gray-500">
                No results found
              </div>
            )}
        </div>
      )}
    </div>
  );
}
