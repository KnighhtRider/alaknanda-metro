'use client'
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";

export default function StationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const stationId = rawId ? parseInt(rawId, 10) : NaN;

  const [station, setStation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const res = await fetch(`/api/stations/${stationId}`);
        const data = await res.json();
        console.log("station", data);
        setStation(data);
      } catch (err) {
        console.error("Failed to fetch station", err);
      } finally {
        setLoading(false);
      }
    };
    if (stationId) fetchStation();
  }, [stationId]);

  const handleProductClick = (productId: number) => {
    router.push(`/inventory/${stationId}/${productId}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading station details...
      </div>
    );

  if (!station)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Station not found
      </div>
    );

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
            <img
              src={station.images?.[0]?.imageUrl}
              alt={station.name}
              className="w-48 h-24 object-cover rounded-md"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{station.name}</div>
                  <div className="text-sm text-gray-600">
                    {station.lines?.join(", ")} • {station.footfall}
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

          {/* Ad Options */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Available Ad Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {station.products?.map((p: any) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleProductClick(p.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleProductClick(p.id) }}
                  className="bg-white rounded-xl overflow-hidden transform transition duration-200 hover:scale-105 hover:shadow-xl cursor-pointer focus:outline-none"
                >
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {p.name}
                    </div>
                    <div className="text-base text-gray-700 mb-1">
                      <span className="font-semibold">Starting Price:</span> ₹
                      {p.rateDay || p.defaultRateDay}/unit/day
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Total Units:</span>{" "}
                      {p.units}
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(p.id);
                        }}
                        className="w-full bg-red-600 text-white rounded-lg px-3 py-2 text-sm"
                      >
                        View Inventory
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
            <h4 className="font-semibold mb-3">Location & Nearby</h4>
            <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
              Map placeholder
            </div>
          </div>

          {/* Why Advertise */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
            <h4 className="font-semibold mb-3">
              Why Advertise at {station.name}?
            </h4>
            <ul className="list-disc pl-5 text-sm space-y-2 text-gray-700">
              <li>Central Business District visibility and repeat impressions.</li>
              <li>High traffic and commuter engagement.</li>
              <li>Strong weekend retail footfall nearby.</li>
            </ul>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
              <h4 className="font-semibold mb-2">
                Interested in advertising at {station.name}?
              </h4>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <input required placeholder="Name" className="w-full border border-gray-200 rounded-lg px-3 py-3.5" />
                <input required placeholder="Company" className="w-full border border-gray-200 rounded-lg px-3 py-3.5" />
                <input required type="email" placeholder="Work Email" className="w-full border border-gray-200 rounded-lg px-3 py-3.5" />
                <input required placeholder="Phone" className="w-full border border-gray-200 rounded-lg px-3 py-3.5" />
                <button type="submit" className="w-full bg-red-600 text-white rounded-lg py-3 font-medium">Request Quote</button>
              </form>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}