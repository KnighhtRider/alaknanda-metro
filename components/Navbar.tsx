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
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      router.push(`/stations/${slug}`);
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3">

        {/* LOGO */}
        <div
          className="flex items-center gap-2 md:gap-4 cursor-pointer shrink-0"
          onClick={navigateToHome}
        >
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm md:text-base">
              AAL
            </div>
            <span className="font-semibold text-sm sm:text-base md:text-lg tracking-tight">
              Delhi Metro Advertising
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center order-2 md:order-3 shrink-0">
          <a
            href="/contact"
            className="inline-block bg-red-600 text-white font-medium px-3 md:px-4 py-2 text-sm md:text-base rounded-lg shadow-sm"
          >
            Contact Us
          </a>
        </div>

        {/* SEARCH */}
        <div className="w-full md:w-auto md:flex-1 order-3 md:order-2 md:px-6 mt-2 md:mt-0">
          <div className="max-w-2xl mx-auto relative group">

            {/* INPUT */}
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                // Delay hiding dropdown so clicks register
                setTimeout(() => setShowDropdown(false), 200);
              }}
              placeholder="Search stations, metro lines, or ad formats..."
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2.5 md:py-3 pl-10 md:pl-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />

            {/* SEARCH ICON */}
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 pointer-events-none"
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
              <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-[60vh] overflow-y-auto">
                {results.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelect(item);
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-800">{item.name}</span>
                    <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
