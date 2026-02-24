"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toSlug } from "@/lib/slugify";
import { Skeleton } from "@heroui/react";

interface Station {
    id: number;
    name: string;
    line: string;
    image: string;
}

export default function FeaturedStationsSection() {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStations() {
            try {
                const res = await fetch("/api/stations?limit=3");
                const data = await res.json();

                // Transform data to match existing UI
                const transformed = data.slice(0, 3).map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    line: s.lines[0]?.name ?? "N/A",
                    image: s.images[0]?.imageUrl ?? `https://placehold.co/600x400?text=${encodeURIComponent(s.name)}`
                }));

                setStations(transformed);
            } catch (error) {
                console.error("Failed to fetch featured stations:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStations();
    }, []);

    return (
        <section className="max-w-7xl mx-auto px-6 mt-8 transition-opacity duration-500">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                    Explore High-Impact Stations
                </h3>
                <Link href="/catalogue" className="text-sm text-red-600">
                    View all
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading ? (
                    <>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                                <Skeleton className="h-40 w-full" />
                                <div className="p-3">
                                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                                    <Skeleton className="h-4 w-1/4 mt-2 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </>
                ) : stations.length > 0 ? (
                    stations.map((f) => (
                        <Link
                            key={f.id}
                            href={`/stations/${toSlug(f.name)}`}
                            className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                        >
                            <div
                                className="h-40 bg-cover bg-center"
                                style={{ backgroundImage: `url('${f.image}')` }}
                            />
                            <div className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">{f.name}</div>
                                    <div className="text-sm text-gray-600">{f.line}</div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-gray-600">No featured stations available.</p>
                )}
            </div>
        </section>
    );
}
