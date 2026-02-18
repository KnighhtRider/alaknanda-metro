'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchItem {
  id: number;
  name: string;
  type: "station" | "line" | "product";
}

export default function Navbar() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [allData, setAllData] = useState<SearchItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all searchable data once
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [stationsRes, linesRes, productsRes] = await Promise.all([
          fetch("/api/stations"),
          fetch("/api/lines"),
          fetch("/api/products"),
        ]);

        const [stations, lines, products] = await Promise.all([
          stationsRes.json(),
          linesRes.json(),
          productsRes.json(),
        ]);

        const stationItems = stations.map((s: any) => ({
          id: s.id,
          name: s.name,
          type: "station",
        }));

        const lineItems = lines.map((l: any) => ({
          id: l.id,
          name: l.name + " Line",
          type: "line",
        }));

        const productItems = products.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: "product",
        }));

        setAllData([...stationItems, ...lineItems, ...productItems]);
      } catch (err) {
        console.error("Search preload error:", err);
      }
    };

    fetchAll();
  }, []);

  // Filter on typing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();

    const filtered = allData.filter((item) =>
      item.name.toLowerCase().includes(q)
    );

    setResults(filtered.slice(0, 8));
  }, [query, allData]);

  // Navigation based on type
  const handleSelect = (item: SearchItem) => {
    setShowDropdown(false);
    setQuery("");

    if (item.type === "station") {
      router.push(`/station/${item.id}`);
    } else if (item.type === "line") {
      router.push(`/catalogue?line=${encodeURIComponent(item.name)}`);
    } else if (item.type === "product") {
      router.push(`/catalogue?inventory=${encodeURIComponent(item.name)}`);
    }
  };

  const navigateToHome = () => {
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LOGO */}
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={navigateToHome}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
              AAL
            </div>
            <span className="font-semibold text-lg">
              Delhi Metro Advertising
            </span>
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex-1 px-6">
          <div className="max-w-2xl mx-auto relative">

            {/* INPUT */}
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search stations, metro lines, or ad formats..."
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 pl-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />

            {/* SEARCH ICON */}
            <svg
              className="w-5 h-5 text-gray-400 absolute left-4 top-3.5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle
                cx="11"
                cy="11"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>

            {/* DROPDOWN RESULTS */}
            {showDropdown && results.length > 0 && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {results.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  >
                    <span className="text-sm">{item.name}</span>
                    <span className="text-xs text-gray-400 capitalize">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <a
            href="/contact"
            className="inline-block bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-sm"
          >
            Contact Us
          </a>
        </div>
      </div>
    </header>
  );
}
