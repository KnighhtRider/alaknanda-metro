'use client'
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { Spinner, Skeleton } from "@heroui/react";
import { usePlan } from "@/context/PlanContext";
import { toSlug } from "@/lib/slugify";



// ─── Description Generator Helpers ────────────────────────────

const LINE_MAP: Record<string, string> = {
    'Yellow Line': 'located on the Yellow Line, one of Delhi Metro\'s busiest corridors',
    'Blue Line': 'located on the Blue Line, a key east–west corridor',
    'Magenta Line': 'situated on the Magenta Line connecting West & South Delhi',
    'Red Line': 'positioned on the Red Line serving dense residential areas',
    'Violet Line': 'linking central and south Delhi via the Violet Line',
    'Airport Express Line': 'connecting New Delhi to the airport via the Airport Express Line',
    'Pink Line': 'on the Pink Line, an orbital corridor connecting multiple zones',
};

const TYPE_MAP: Record<string, string> = {
    'Popular': 'a popular station within the network',
    'High Footfall': 'a high-footfall location with consistent commuter traffic',
};

const AUDIENCE_MAP: Record<string, string> = {
    'Business': 'office professionals',
    'Shopping': 'shoppers and retail visitors',
    'Residential': 'local residents',
    'Student': 'students',
};

function buildDescription(
    stationName: string,
    typeNames: string[],
    lineNames: string[],
    audienceNames: string[],
): string {
    // Type phrase
    const typePhrases = typeNames.map(t => TYPE_MAP[t]).filter(Boolean);
    const typePhrase = typePhrases.length > 0
        ? `is ${typePhrases.join(' and ')}`
        : 'is a well-connected station';

    // Line phrase
    const linePhrases = lineNames.map(l => {
        const key = Object.keys(LINE_MAP).find(k => l.toLowerCase().includes(k.toLowerCase().replace(' line', '').trim()));
        return key ? LINE_MAP[key] : null;
    }).filter(Boolean);
    const linePhrase = linePhrases.length > 0
        ? linePhrases.join(', and ')
        : 'situated within the Delhi Metro network';

    // Audience phrase
    const audienceLabels = audienceNames.map(a => AUDIENCE_MAP[a]).filter(Boolean);
    const audiencePhrase = audienceLabels.length > 0
        ? audienceLabels.join(', ').replace(/, ([^,]*)$/, ' and $1')
        : 'diverse commuters';

    return `${stationName} Metro Station ${typePhrase}, ${linePhrase}. The station serves ${audiencePhrase}, contributing to steady daily ridership and repeated commuter engagement.\n\nAdvertising at this station allows brands to engage commuters during transit, entry, and platform wait times, ensuring repeated visibility within the Delhi Metro network. The station environment supports high-frequency exposure for campaigns focused on building awareness across Delhi NCR.`;
}

// ─── Main Component ──────────────────────────────────────────

export default function StationClient({ initialStationId }: { initialStationId?: number } = {}) {
    const params = useParams();
    const router = useRouter();
    const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
    const stationId = initialStationId || (rawId ? parseInt(rawId, 10) : NaN);

    const { selectedPlans, addToPlan, removeFromPlan, isInPlan, setIsPlanOpen } = usePlan();
    const currentStationPlans = useMemo(() => selectedPlans.filter((p: any) => p.stationId === stationId), [selectedPlans, stationId]);

    const [station, setStation] = useState<any>(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchStation = async () => {
            try {
                const res = await fetch(`/api/stations/${stationId}`);
                const data = await res.json();
                setStation(data);
            } catch (err) {
                console.error("Failed to fetch station", err);
            } finally {
                setLoading(false);
            }
        };
        if (stationId) fetchStation();
    }, [stationId]);

    const togglePlan = useCallback((product: any) => {
        if (isInPlan(stationId, product.id)) {
            removeFromPlan(stationId, product.id);
        } else {
            addToPlan({
                stationId,
                stationName: station?.name ?? '',
                inventoryId: product.id,
                inventoryName: product.name,
                price: product.rateDay || product.defaultRateDay || null,
            });
            setIsPlanOpen(true);
        }
    }, [isInPlan, removeFromPlan, addToPlan, setIsPlanOpen, stationId, station]);



    // Auto-generated description
    const autoDescription = useMemo(() => {
        if (!station) return '';
        return buildDescription(
            station.name,
            station.typeNames ?? [],
            station.lineNames ?? [],
            station.audienceNames ?? [],
        );
    }, [station]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-900 py-6">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-12 gap-6">
                    <section className="col-span-12 lg:col-span-8 space-y-6">
                        <Skeleton className="rounded-2xl h-10 w-3/4 mb-4" />
                        <Skeleton className="rounded-xl h-32 w-full" />
                        <div className="mt-6">
                            <Skeleton className="h-8 w-48 mb-3 rounded-lg" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="rounded-xl h-64 w-full" />)}
                            </div>
                        </div>
                    </section>
                    <aside className="col-span-12 lg:col-span-4 hidden lg:block">
                        <Skeleton className="rounded-2xl h-[600px] w-full" />
                    </aside>
                </div>
            </div>
        );
    }

    if (!station)
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-600">
                Station not found
            </div>
        );

    const planCount = currentStationPlans.length;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">
                {/* Breadcrumb */}
                <div className="col-span-12 text-sm text-gray-500 mb-4">
                    <Link href="/" className="hover:underline">Home</Link> ›{" "}
                    <Link href="/catalogue" className="hover:underline">Catalogue</Link> ›{" "}
                    <span className="text-gray-800 font-medium">{station.name}</span>
                </div>

                {/* Headline */}
                <section className="col-span-12 lg:col-span-8">
                    <h1 className="text-2xl font-bold mb-4">
                        Metro Advertising in {station.name}
                    </h1>

                    {/* Compact Station Card */}
                    <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm p-3">
                        <Image
                            src={station.images?.[0] || '/images/placeholder.jpg'}
                            alt={station.name}
                            width={192}
                            height={96}
                            className="w-48 h-24 object-cover rounded-md flex-shrink-0"
                            priority
                            sizes="192px"
                        />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-lg font-semibold">{station.name}</div>
                                    <div className="text-sm text-gray-600">
                                        {station.lineNames?.join(", ")} • {station.footfall}
                                    </div>
                                </div>
                                <div className="text-right text-sm">
                                    <div className="text-gray-500">Total Units</div>
                                    <div className="font-semibold text-lg">
                                        {station.totalInventory}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Ad Options ────────────────────────────── */}
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-3">Available Ad Options</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {station.products?.map((p: any) => (
                                <div
                                    key={p.id}
                                    className="bg-white rounded-xl overflow-hidden transform transition duration-200 hover:scale-105 hover:shadow-xl"
                                >
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => router.push(`/stations/${toSlug(station.name)}/${toSlug(p.name)}`)}
                                        className="cursor-pointer focus:outline-none"
                                    >
                                        <Image
                                            src={p.thumbnail || '/images/placeholder.jpg'}
                                            alt={p.name}
                                            width={400}
                                            height={128}
                                            className="w-full h-32 object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                        <div className="p-4 pb-2">
                                            <div className="text-xl font-bold text-gray-900 mb-1">
                                                {p.name}
                                            </div>
                                            <div className="text-base text-gray-700 mb-1">
                                                <span className="font-semibold">Indicative Rate:</span>{" "}
                                                ₹{p.rateDay?.toLocaleString('en-IN')}/unit/day
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-semibold">Total Units:</span>{" "}
                                                {p.units}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="px-4 pb-4 flex gap-2">
                                        <button
                                            className="flex-1 bg-red-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-700 transition cursor-pointer"
                                            onClick={() => router.push(`/stations/${toSlug(station.name)}/${toSlug(p.name)}`)}
                                        >
                                            View Inventory
                                        </button>
                                        <button
                                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer border
                                                ${isInPlan(stationId, p.id)
                                                    ? 'bg-gray-900 border-gray-900 text-white hover:bg-black hover:border-black shadow-inner shadow-gray-700'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            onClick={() => togglePlan(p)}
                                        >
                                            {isInPlan(stationId, p.id) ? '✓ Added' : 'Add to Plan'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Map placeholder ──────────────────────── */}
                    <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
                        <h4 className="font-semibold mb-3">Location & Nearby</h4>
                        <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                            Map placeholder
                        </div>
                    </div>

                    {/* ── Why Advertise (auto-generated) ───────── */}
                    <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
                        <h4 className="text-lg font-semibold mb-3">
                            Why Advertise at {station.name} Metro Station
                        </h4>
                        {autoDescription.split('\n\n').map((para, i) => (
                            <p key={i} className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">
                                {para}
                            </p>
                        ))}
                    </div>

                    {/* ── CTA Box ──────────────────────────────── */}
                    <div className="mt-12 bg-gray-50 border rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                            Need help identifying the right mix of stations?
                        </h3>
                        <button
                            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium whitespace-nowrap cursor-pointer"
                            onClick={() => router.push("/contact")}
                        >
                            Consult Our Media Planners
                        </button>
                    </div>
                </section>

                <aside className="col-span-12 lg:col-span-4">
                    <div className="sticky top-24 space-y-4">
                        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-2xl shadow-sm p-6 cursor-pointer hover:bg-yellow-100 transition" onClick={() => router.push('/contact')}>
                            <h4 className="font-semibold text-lg mb-2">Need a Custom Plan?</h4>
                            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                                Not sure which stations or formats work best for your brand? Get a free consultation with our media specialists.
                            </p>
                            <button className="bg-yellow-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-600 shadow-sm">
                                Get Free Consultation
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h4 className="font-semibold text-gray-900 mb-2">How it works</h4>
                            <ul className="text-sm text-gray-600 space-y-3 mt-4">
                                <li className="flex gap-3">
                                    <span className="bg-red-50 text-red-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                                    <span>Add desired ad formats from this station to your plan.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="bg-red-50 text-red-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                                    <span>Review all selections in the &apos;Plan&apos; drawer and provide contact details.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="bg-red-50 text-red-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                                    <span>Our team sends you a detailed PDF media kit and final quote.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </main>

        </div>
    );
}
