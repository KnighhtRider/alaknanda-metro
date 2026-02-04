"use client";

import { useEffect, useState } from "react";
import { Spinner, Skeleton } from "@heroui/react";

interface Station {
  id: number;
  name: string;
  line?: string;
  image?: string;
  price?: string;
}

export default function HomePage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsRes, linesRes, productsRes] = await Promise.all([
          fetch("/api/stations"),
          fetch("/api/lines"),
          fetch("/api/products"),
        ]);

        const [stationsData, linesData, productsData] = await Promise.all([
          stationsRes.json(),
          linesRes.json(),
          productsRes.json(),
        ]);

        // ✅ Build featured station cards dynamically
        const featured = stationsData.slice(0, 3).map((s: any) => {
          const lineName =
            s.line?.name ||
            linesData.find((l: any) => l.id === s.lineId)?.name ||
            "N/A";

          const price = s.products?.length
            ? `₹${Math.min(
                ...s.products.map((p: any) => p.rateMonth || 0)
              ).toLocaleString()}`
            : "₹—";

          return {
            id: s.id,
            name: s.name,
            line: lineName,
            image:
              s.images?.[0] ||
              `https://source.unsplash.com/1200x800/?${encodeURIComponent(
                s.name
              )},metro`,
            price,
          };
        });

        setStations(featured);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        <Spinner size="lg" color="danger" variant="gradient" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main>
        {/* Hero */}
        <section className="relative h-[56vh] lg:h-[64vh]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/home-background.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/35" />

          <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="text-white max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Delhi Metro Advertising — Reach Millions
              </h1>
              <p className="mt-3 text-lg md:text-xl opacity-90">
                Find available formats, view station-level pricing, and request
                a quote in minutes.
              </p>
              <div className="mt-6 flex gap-3 items-center">
                <a
                  href="/catalogue"
                  className="bg-red-600 text-white px-5 py-3 rounded-lg font-medium"
                >
                  Browse Inventory
                </a>
                <a
                  href="/contact"
                  className="border border-white text-white px-5 py-3 rounded-lg font-medium"
                >
                  Get Free Consultation
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Delhi Metro Advertising Benefits */}
        <section className="max-w-7xl mx-auto px-6 mt-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-red-600">5M+</div>
              <div className="text-gray-800 font-medium mt-1">Daily Riders</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600">200+</div>
              <div className="text-gray-800 font-medium mt-1">Stations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600">25 min</div>
              <div className="text-gray-800 font-medium mt-1">
                Average Dwell Time
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600">390+ km</div>
              <div className="text-gray-800 font-medium mt-1">
                India’s Largest Metro Network
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto mt-8 border-t border-gray-200 shadow-sm"></div>

        {/* Featured Stations */}
        <section className="max-w-7xl mx-auto px-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Explore Top Metro Stations for Advertising
            </h3>
            <a href="/catalogue" className="text-sm text-red-600">
              View all
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stations.length > 0 ? (
              stations.map((f) => (
                <a
                  key={f.id}
                  href={`/station/${f.id}`}
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
                    <div className="mt-2 text-sm text-gray-600">
                      Starting at{" "}
                      <span className="font-semibold">{f.price}</span>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-gray-600">No featured stations available.</p>
            )}
          </div>
        </section>

        {/* Why Us */}
        <section className="max-w-7xl mx-auto px-6 mt-8">
          <h3 className="text-center text-xl font-semibold mb-6">
            Why Choose Us?
          </h3>
          <div className="bg-white rounded-2xl shadow-sm p-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">🏆</div>
              <div className="font-medium text-gray-900">100% Install Rate</div>
              <p className="text-sm text-gray-600 mt-1">
                Proven track record of flawless, on-time campaign execution.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">⏳</div>
              <div className="font-medium text-gray-900">
                4 Decades of Experience
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Over 40 years of excellence in advertising.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">📜</div>
              <div className="font-medium text-gray-900">
                Government Empaneled
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Trusted by leading government departments and public sector
                clients.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">🧩</div>
              <div className="font-medium text-gray-900">
                Full Campaign Support
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Creative, fabrication, installation, and reporting handled
                in-house.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          id="get-quote"
          className="max-w-7xl mx-auto px-6 mt-8 mb-10 animate-pulse hover:animate-none transition"
        >
          <div className="bg-red-600 text-white rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xl font-semibold">
              Ready to Plan Your Next Metro Campaign?
            </div>
            <div className="flex gap-3">
              <a
                href="/contact"
                className="bg-white text-red-600 px-5 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Get Free Consultation
              </a>
              <a
                href="/catalogue"
                className="border border-white px-5 py-3 rounded-lg font-medium hover:bg-white hover:text-red-600 transition"
              >
                Browse Inventory
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
