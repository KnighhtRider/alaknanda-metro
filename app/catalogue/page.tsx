"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Accordion, AccordionItem, Spinner } from "@heroui/react";

export default function AdInventoryListing() {
  const router = useRouter();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsRes, linesRes, productsRes, audiencesRes, typesRes] =
          await Promise.all([
            fetch("/api/stations"),
            fetch("/api/lines"),
            fetch("/api/products"),
            fetch("/api/stations/audiences"),
            fetch("/api/stations/types"),
          ]);

        const [
          stationsData,
          linesData,
          productsData,
          audiencesData,
          typesData,
        ] = await Promise.all([
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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const exists = prev[category].includes(value);
      return {
        ...prev,
        [category]: exists
          ? prev[category].filter((v: string) => v !== value)
          : [...prev[category], value],
      };
    });
  };

  const filteredStations = stations.filter((s) => {
    if (filters.line.length > 0) {
      const hasLine = filters.line.some((l) =>
        s.lines.some((sl: any) => sl.name === l)
      );
      if (!hasLine) return false;
    }
    if (filters.inventory.length > 0) {
      const hasInventory = s.products.some((p: any) =>
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
      const hasType = s.types?.some((t: any) => filters.type.includes(t.name));
      if (!hasType) return false;
    }

    return true;
  });

  const navigateToStation = (id: number) => {
    router.push(`/station/${id}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        <Spinner size="lg" color="danger" variant="gradient" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">
        {/* Filters Sidebar */}
        <aside className="col-span-12 lg:col-span-3 sticky top-20 self-start">
          <div className="rounded-2xl bg-white shadow-sm p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                className="text-sm text-red-600 hover:underline cursor-pointer"
                onClick={() =>
                  setFilters({
                    line: [],
                    inventory: [],
                    audience: [],
                    type: [],
                  })
                }
              >
                Clear All Filters
              </button>
            </div>
            <Accordion variant="light" defaultExpandedKeys={["2"]}>
              <AccordionItem
                key="1"
                aria-label="Ad Options"
                title="Ad Options"
                classNames={{ trigger: "cursor-pointer" }}
              >
                <div className="space-y-2 text-sm">
                  {products.map((product) => (
                    <label key={product} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={filters.inventory.includes(product)}
                        onChange={() => toggleFilter("inventory", product)}
                      />
                      <span>{product}</span>
                    </label>
                  ))}
                </div>
              </AccordionItem>
              <AccordionItem
                key="2"
                aria-label="Metro Lines"
                title="Metro Lines"
                classNames={{ trigger: "cursor-pointer" }}
              >
                <div className="space-y-2 text-sm">
                  {lines.map((line) => (
                    <label key={line.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="line"
                        className="w-4 h-4"
                        checked={filters.line.includes(line.name)}
                        onChange={() => toggleFilter("line", line.name)}
                      />
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full inline-block`}
                          style={{ backgroundColor: line.color }}
                        ></span>
                        {line.name} Line
                      </span>
                    </label>
                  ))}
                </div>
              </AccordionItem>
              <AccordionItem
                key="3"
                aria-label="Station Audiences"
                title="Station Audiences"
                classNames={{ trigger: "cursor-pointer" }}
              >
                <div className="space-y-2 text-sm">
                  {audiences.map((audience) => (
                    <label key={audience} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={filters.audience.includes(audience)}
                        onChange={() => toggleFilter("audience", audience)}
                      />
                      <span>{audience}</span>
                    </label>
                  ))}
                </div>
              </AccordionItem>
              <AccordionItem
                key="4"
                aria-label="Station Types"
                title="Station Types"
                classNames={{ trigger: "cursor-pointer" }}
              >
                <div className="space-y-2 text-sm">
                  {types.map((type) => (
                    <label key={type} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
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

        {/* Station Cards Grid (unchanged from before) */}
        <section className="col-span-12 lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((s) => (
              <article
                key={s.id}
                className="rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer"
                onClick={() => navigateToStation(s.id)}
              >
                <div className="relative">
                  <img
                    src={s.images?.[0]?.imageUrl}
                    alt={s.name}
                    className="w-full h-44 object-cover"
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

                  {/* Station Types – bottom right */}
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

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold leading-tight">
                        {s.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.lines.map((line: any) => (
                        <span key={line.id} className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full inline-block`}
                            style={{ backgroundColor: line.color }}
                          ></span>
                          <span className="text-sm text-gray-600">
                            {line.name}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Footfall:{" "}
                    <span className="font-medium text-gray-800">
                      {s.footfall}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {s.products.map((p: any) => (
                      <span
                        key={p.id}
                        className="text-xs bg-gray-100 px-3 py-1 rounded-full border"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-gray-600">Starting at</div>
                    <div className="text-lg font-semibold mt-1">
                      ₹{s.products?.[0]?.rateMonth?.toLocaleString() || "—"}{" "}
                      <span className="text-sm font-normal">
                        / unit / month
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
