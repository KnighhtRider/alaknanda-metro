import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "Delhi Metro Advertising | Reach Millions of Commuters",
  description:
    "Advertise on Delhi Metro stations. Browse inventory, view pricing, and get a free consultation for your next metro advertising campaign.",
};

export default async function HomePage() {
  // ✅ Direct DB query — only top 3 stations, only what we need
  const rawStations = await prisma.station.findMany({
    take: 3,
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      images: { select: { imageUrl: true }, take: 1 },
      lines: {
        select: { line: { select: { name: true } } },
        take: 1,
      },
      products: {
        select: {
          rateMonth: true,
          product: { select: { defaultRateMonth: true } },
        },
      },
    },
  });

  const stations = rawStations.map((s) => {
    const lineName = s.lines[0]?.line?.name ?? "N/A";
    const image =
      s.images[0]?.imageUrl ??
      `https://source.unsplash.com/1200x800/?${encodeURIComponent(s.name)},metro`;

    const rates = s.products
      .map((p) => p.rateMonth ?? p.product.defaultRateMonth ?? 0)
      .filter((r) => r > 0);
    const price = rates.length > 0 ? `₹${Math.min(...rates).toLocaleString()}` : "₹—";

    return { id: s.id, name: s.name, line: lineName, image, price };
  });

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
                <Link
                  href="/catalogue"
                  className="bg-red-600 text-white px-5 py-3 rounded-lg font-medium"
                >
                  Browse Inventory
                </Link>
                <Link
                  href="/contact"
                  className="border border-white text-white px-5 py-3 rounded-lg font-medium"
                >
                  Get Free Consultation
                </Link>
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
                India&apos;s Largest Metro Network
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
            <Link href="/catalogue" className="text-sm text-red-600">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stations.length > 0 ? (
              stations.map((f) => (
                <Link
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
                </Link>
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
          className="max-w-7xl mx-auto px-6 mt-8 mb-10 hover:animate-none transition"
        >
          <div className="bg-red-600 text-white rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xl font-semibold">
              Ready to Plan Your Next Metro Campaign?
            </div>
            <div className="flex gap-3">
              <Link
                href="/contact"
                className="bg-white text-red-600 px-5 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Get Free Consultation
              </Link>
              <Link
                href="/catalogue"
                className="border border-white px-5 py-3 rounded-lg font-medium hover:bg-white hover:text-red-600 transition"
              >
                Browse Inventory
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
