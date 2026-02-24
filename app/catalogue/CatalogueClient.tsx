"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense, useMemo, useCallback, memo } from "react";
import { Accordion, AccordionItem, Spinner } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

/* ============================================================
   StationCard — memoized to avoid unnecessary re-renders
   ============================================================ */
interface StationCardProps {
    station: any;
    onClick: (station: any) => void;
    priority?: boolean;
}

const StationCard = memo(function StationCard({
    station: s,
    onClick,
    priority = false,
}: StationCardProps) {
    return (
        <article
            className="rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer flex flex-col"
            onClick={() => onClick(s)}
        >
            {/* Image + overlay badges */}
            <div className="relative h-44 w-full">
                <Image
                    src={s.images?.[0]?.imageUrl ?? "/placeholder.jpg"}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    priority={priority}
                    loading={priority ? undefined : "lazy"}
                />

                {/* Audiences – bottom left */}
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[70%]">
                    {s.audiences?.map((a: any) => (
                        <span
                            key={a.id}
                            className="bg-red-700/90 text-white text-xs px-2 py-0.5 rounded-md"
                        >
                            {a.name}
                        </span>
                    ))}
                </div>

                {/* Station Types – top right */}
                <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end max-w-[70%]">
                    {s.types?.map((t: any) => (
                        <span
                            key={t.id}
                            className="bg-black/80 text-white text-xs px-2 py-0.5 rounded-md"
                        >
                            {t.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Card body */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-tight">
                        {s.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {s.lines?.map((line: any) => (
                            <span key={line.id} className="flex items-center gap-1">
                                <span
                                    className="w-3 h-3 rounded-full inline-block"
                                    style={{ backgroundColor: line.color }}
                                />
                                <span className="text-sm text-gray-600">{line.name}</span>
                            </span>
                        ))}
                    </div>
                </div>

                <p className="text-sm text-gray-600 mt-2">
                    Footfall:{" "}
                    <span className="font-medium text-gray-800">
                        {s.footfall?.toLocaleString() ?? "—"}
                    </span>
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                    {s.products?.map((p: any) => (
                        <span
                            key={p.id}
                            className="text-xs bg-gray-100 px-3 py-1 rounded-full border"
                        >
                            {p.name}
                        </span>
                    ))}
                </div>

                {/* Pricing — clean single line */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-500">Typical Investment Range: </div>
                    <div className="text-lg font-semibold mt-0.5">
                        ₹{s.products?.[0]?.rateMonth?.toLocaleString() ?? "—"}{" "}
                        <span className="text-sm font-normal text-gray-500"></span>
                    </div>
                </div>
            </div>
        </article>
    );
});

/* ============================================================
   Inner component — uses useSearchParams (must be inside Suspense)
   ============================================================ */
import { toSlug } from "@/lib/slugify";

function AdInventoryListingInner() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFilters] = useState<{
        line: string[];
        inventory: string[];
        audience: string[];
        type: string[];
    }>({
        line: [],
        inventory: [],
        audience: [],
        type: [],
    });

    const [stations, setStations] = useState<any[]>([]);
    const [lines, setLines] = useState<
        { id: number; name: string; color: string }[]
    >([]);
    const [products, setProducts] = useState<string[]>([]);
    const [audiences, setAudiences] = useState<string[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Apply URL search params to filters on mount
    useEffect(() => {
        const line = searchParams.get("line");
        const inventory = searchParams.get("inventory");

        if (line) {
            const cleanLine = line.replace(" Line", "").trim();
            setFilters((prev) => ({
                ...prev,
                line: [cleanLine],
            }));
        }

        if (inventory) {
            setFilters((prev) => ({
                ...prev,
                inventory: [inventory],
            }));
        }
    }, [searchParams]);

    // Fetch all data with caching
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stationsRes, linesRes, productsRes, audiencesRes, typesRes] =
                    await Promise.all([
                        fetch("/api/stations", { cache: "force-cache" }),
                        fetch("/api/lines", { cache: "force-cache" }),
                        fetch("/api/products", { cache: "force-cache" }),
                        fetch("/api/stations/audiences", { cache: "force-cache" }),
                        fetch("/api/stations/types", { cache: "force-cache" }),
                    ]);

                const [stationsData, linesData, productsData, audiencesData, typesData] =
                    await Promise.all([
                        stationsRes.json(),
                        linesRes.json(),
                        productsRes.json(),
                        audiencesRes.json(),
                        typesRes.json(),
                    ]);

                setStations(stationsData);
                setLines(linesData);
                setProducts(productsData.map((p: any) => p.name));
                setAudiences(audiencesData.map((a: any) => a.name));
                setTypes(typesData.map((t: any) => t.name));
            } catch {
                // silently handle fetch errors in production
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Memoized filter toggle handler
    const toggleFilter = useCallback(
        (category: keyof typeof filters, value: string) => {
            setFilters((prev) => {
                const exists = prev[category].includes(value);
                return {
                    ...prev,
                    [category]: exists
                        ? prev[category].filter((v: string) => v !== value)
                        : [...prev[category], value],
                };
            });
        },
        []
    );

    // Memoized clear filters handler
    const clearFilters = useCallback(() => {
        setFilters({ line: [], inventory: [], audience: [], type: [] });
    }, []);

    // Memoized filtered stations
    const filteredStations = useMemo(() => {
        return stations.filter((s) => {
            if (filters.line.length > 0) {
                const hasLine = filters.line.some((l) =>
                    s.lines?.some(
                        (sl: any) => sl.name?.toLowerCase() === l.toLowerCase()
                    )
                );
                if (!hasLine) return false;
            }

            if (filters.inventory.length > 0) {
                const hasInventory = s.products?.some((p: any) =>
                    filters.inventory.includes(p.name)
                );
                if (!hasInventory) return false;
            }

            if (filters.audience.length > 0) {
                const hasAudience = s.audiences?.some((a: any) =>
                    filters.audience.includes(a.name)
                );
                if (!hasAudience) return false;
            }

            if (filters.type.length > 0) {
                const hasType = s.types?.some((t: any) =>
                    filters.type.includes(t.name)
                );
                if (!hasType) return false;
            }

            return true;
        });
    }, [stations, filters]);

    // Memoized navigate handler
    const navigateToStation = useCallback(
        (stationObj: any) => {
            router.push(`/stations/${toSlug(stationObj.name)}`);
        },
        [router]
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg text-gray-600">
                <Spinner size="lg" color="danger" variant="gradient" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* ========== Page Header ========== */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Delhi Metro Advertising by Station
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Select stations relevant to your campaign and drill down into formats to build your shortlist
                    </p>
                </div>

                <div className="grid grid-cols-12 gap-6">

                    {/* ========== Filters Sidebar ========== */}
                    <aside className="col-span-12 lg:col-span-3 lg:sticky lg:top-20 self-start">
                        <div className="rounded-2xl bg-white shadow-sm p-5 sm:p-6 overflow-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-md font-semibold text-gray-900">
                                    Refine Your Selection
                                </h3>
                                <button
                                    className="text-sm text-red-600 hover:underline cursor-pointer whitespace-nowrap"
                                    onClick={clearFilters}
                                >
                                    Clear All Filters
                                </button>
                            </div>

                            <Accordion variant="light" defaultExpandedKeys={["2"]}>
                                {/* Ad Options */}
                                <AccordionItem
                                    key="1"
                                    aria-label="Ad Options"
                                    title="Ad Options"
                                    classNames={{ trigger: "cursor-pointer py-3", title: "text-sm font-medium text-gray-700" }}
                                >
                                    <div className="space-y-2.5 text-sm pb-2">
                                        {products.map((product) => (
                                            <label key={product} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-red-600"
                                                    checked={filters.inventory.includes(product)}
                                                    onChange={() => toggleFilter("inventory", product)}
                                                />
                                                <span>{product}</span>
                                            </label>
                                        ))}
                                    </div>
                                </AccordionItem>

                                {/* Metro Lines */}
                                <AccordionItem
                                    key="2"
                                    aria-label="Metro Lines"
                                    title="Metro Lines"
                                    classNames={{ trigger: "cursor-pointer py-3", title: "text-sm font-medium text-gray-700" }}
                                >
                                    <div className="space-y-2.5 text-sm pb-2">
                                        {lines.map((line) => (
                                            <label key={line.id} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="line"
                                                    className="w-4 h-4 accent-red-600"
                                                    checked={filters.line.includes(line.name)}
                                                    onChange={() => toggleFilter("line", line.name)}
                                                />
                                                <span className="flex items-center gap-2">
                                                    <span
                                                        className="w-3 h-3 rounded-full inline-block"
                                                        style={{ backgroundColor: line.color }}
                                                    />
                                                    {line.name} Line
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </AccordionItem>

                                {/* Station Audiences */}
                                <AccordionItem
                                    key="3"
                                    aria-label="Station Audiences"
                                    title="Station Audiences"
                                    classNames={{ trigger: "cursor-pointer py-3", title: "text-sm font-medium text-gray-700" }}
                                >
                                    <div className="space-y-2.5 text-sm pb-2">
                                        {audiences.map((audience) => (
                                            <label key={audience} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-red-600"
                                                    checked={filters.audience.includes(audience)}
                                                    onChange={() => toggleFilter("audience", audience)}
                                                />
                                                <span>{audience}</span>
                                            </label>
                                        ))}
                                    </div>
                                </AccordionItem>

                                {/* Station Types */}
                                <AccordionItem
                                    key="4"
                                    aria-label="Station Types"
                                    title="Station Types"
                                    classNames={{ trigger: "cursor-pointer py-3", title: "text-sm font-medium text-gray-700" }}
                                >
                                    <div className="space-y-2.5 text-sm pb-2">
                                        {types.map((type) => (
                                            <label key={type} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-red-600"
                                                    checked={filters.type.includes(type)}
                                                    onChange={() => toggleFilter("type", type)}
                                                />
                                                <span>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </aside>

                    {/* ========== Station Cards Grid ========== */}
                    <section className="col-span-12 lg:col-span-9">
                        {filteredStations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <p className="text-lg font-medium">No stations match your filters.</p>
                                <button
                                    className="mt-3 text-sm text-red-600 hover:underline"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredStations.map((s, index) => (
                                    <StationCard
                                        key={s.id}
                                        station={s}
                                        onClick={navigateToStation}
                                        priority={index < 3}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* ========== CTA Box ========== */}
                <div className="mt-12 bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 text-center md:text-left">
                        Need help identifying the right mix of stations?
                    </h3>
                    <button
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition whitespace-nowrap cursor-pointer"
                        onClick={() => router.push("/contact")}
                    >
                        Consult Our Media Planners
                    </button>
                </div>
            </main>
        </div>
    );
}

/* ============================================================
   Page export — wraps inner component in Suspense
   This is REQUIRED by Next.js 15 when using useSearchParams()
   ============================================================ */
export default function CatalogueClient() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center h-screen">
                    <Spinner size="lg" color="danger" variant="gradient" />
                </div>
            }
        >
            <AdInventoryListingInner />
        </Suspense>
    );
}
