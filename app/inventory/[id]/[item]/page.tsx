'use client'
import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * Ad Option Detail Page (e.g., Backlit Panels)
 * - Opens after user clicks an ad format on the Station page.
 * - BIG swipeable image gallery below the title (native scroll-snap carousel).
 * - Removed Installed Examples and Indicative Layout.
 * - Specs & Guidelines are collapsible (droppable).
 * - Sticky enquiry form + "Confused? Get Free Consultation" box.
 *
 * NOTE: Plain JS (no TS types) to avoid TSX parse errors.
 */
// --- Small utilities (also used in tests) ---
function _clampIndex(i: number, len: number) {
  return Math.max(0, Math.min(i, len - 1));
}

function _ensureArray(x: string | number[] | string[] | undefined) {
  return Array.isArray(x) ? x : x ? [x] : [];
}

// Native swipe Carousel (no external library)
// - full-width slides
// - CSS scroll-snap + smooth scrolling
// - arrows + dots
function Carousel({ images, onOpen }: { images: string[]; onOpen: (src: string) => void }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState<number>(0);

  const goTo = useCallback((i: number) => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    const clamped = _clampIndex(i, images.length);
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setIndex(clamped);
  }, [images.length]);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(i);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => {
    const onResize = () => goTo(index);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [index, goTo]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-xl"
        style={{ scrollbarWidth: "none" }}
        onScroll={onScroll}
        aria-label="Image carousel"
      >
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => onOpen(src)}
            className="shrink-0 w-full h-64 md:h-96 snap-start relative bg-gray-100 overflow-hidden"
            aria-label={`Open slide ${i + 1} in lightbox`}
          >
            <img src={src} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* arrows */}
      <button
        aria-label="Previous slide"
        onClick={() => goTo(index - 1)}
        className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow px-3 py-2 rounded-full"
      >
        ‹
      </button>
      <button
        aria-label="Next slide"
        onClick={() => goTo(index + 1)}
        className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow px-3 py-2 rounded-full"
      >
        ›
      </button>

      {/* dots */}
      <div className="flex items-center justify-center gap-2 mt-3" role="tablist" aria-label="Carousel pagination">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-red-600" : "w-3 bg-gray-300"}`}
            aria-label={`Go to slide ${i + 1}`}
            role="tab"
            aria-selected={i === index}
          />
        ))}
      </div>
    </div>
  );
}

export default function AdOptionDetail() {
  // Mock data — replace from router params or API
  const ad = {
    id: "backlit",
    type: "Backlit Panels",
    station: {
      id: 1,
      name: "Rajiv Chowk Metro Station",
      line: "Yellow Line",
      lineColorClass: "bg-yellow-400",
      tags: ["Popular", "High Footfall"],
      footfall: "~5,20,000 riders/day",
    },
    summary: {
      totalUnits: 50,
      startingDay: 1500,
      startingMonth: 45000,
    },
    // Large visual gallery (hero-size thumbnails)
    gallery: [
      "https://source.unsplash.com/1600x900/?backlit,advertising,station",
      "https://source.unsplash.com/1600x900/?backlit,panel,metro",
      "https://source.unsplash.com/1600x900/?transit,advertising,lightbox",
      "https://source.unsplash.com/1600x900/?metro,platform,ad",
    ],
    specs: {
      typicalSizes: ["6x3 ft", "8x4 ft", "10x4 ft"],
      illumination: "LED backlit",
      finish: "Vinyl print on acrylic/ACP frame",
      locations: ["Concourse", "Corridors", "Entry/Exit"],
    },
    guidelines: {
      notes: [
        "Provide print-ready artwork (PDF/AI)",
        "Creative must follow DMRC policies",
        "Installation follows DMRC safety protocols",
        "Typical execution timeline: 7 days (faster possible)"
      ],
      // artwork/install/turnaround intentionally omitted; rendering handles absence safely
      artwork: undefined,
      install: undefined,
      turnaround: undefined,
    },
    faqs: [
      { q: "Is printing and installation extra?", a: "Yes, charges apply per sq. ft. based on size and material." },
      { q: "Is design support available?", a: "Yes. You may provide ready artwork or we can create/adapt designs for you (chargeable)." },
      { q: "Can I change the creative mid-campaign?", a: "Yes. Creative replacement is allowed any time — printing and mounting charges will apply." },
      { q: "Are all advertising sites properly licensed by DMRC?", a: "Yes — we only offer authorized, empanelled media." },
    ],
  };

  // Simple lightbox state for gallery
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header (simple) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">AAL</div>
            <span className="font-semibold text-lg">Delhi Metro Advertising</span>
          </div>
          <div className="hidden md:block text-sm text-gray-600">Questions? <a href="/contact" className="text-red-600">Get Free Consultation</a></div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-6 text-sm text-gray-500">
        <Link href="/">Home</Link> › <Link href="/catalogue">Catalogue</Link> › <Link href={`/station/${ad.station.id}`}>{ad.station.name}</Link> › <span className="text-gray-800">{ad.type}</span>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
        {/* Left: content */}
        <section className="col-span-12 lg:col-span-8">
          {/* Header card */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">{ad.type} at {ad.station.name}</h1>
                  <div className="text-sm text-gray-600 flex items-center gap-3 mt-1">
                    <span className="inline-flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${ad.station.lineColorClass}`}></span>{ad.station.line}</span>
                    <span>•</span>
                    <span>{ad.station.footfall}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      {ad.station.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 border">{t}</span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Starting at</div>
                <div className="text-2xl font-bold">₹{ad.summary.startingDay}<span className="text-base font-medium">/unit/day</span></div>
                <div className="text-sm text-gray-500">or ₹{ad.summary.startingMonth}/unit/month</div>
              </div>
            </div>
          </div>

          {/* BIG Image Gallery — native swipe carousel */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Gallery</h3>
              <div className="text-sm text-gray-500">Swipe or use arrows • Tap to enlarge</div>
            </div>
            <div><Carousel images={ad.gallery} onOpen={setLightbox} /></div>
          </div>

          {/* Collapsible: Specs & Guidelines */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <details open className="bg-white rounded-2xl shadow-sm p-5">
              <summary className="cursor-pointer font-semibold">Specs</summary>
              <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5 mt-3">
                <li><strong>Typical sizes:</strong> {ad.specs.typicalSizes.join(', ')}</li>
                <li><strong>Illumination:</strong> {ad.specs.illumination}</li>
                <li><strong>Finish:</strong> {ad.specs.finish}</li>
                <li><strong>Common locations:</strong> {ad.specs.locations.join(', ')}</li>
              </ul>
            </details>

            <details className="bg-white rounded-2xl shadow-sm p-5">
              <summary className="cursor-pointer font-semibold">Guidelines</summary>
              <div className="text-sm text-gray-700 mt-3">
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {_ensureArray(ad.guidelines?.notes).map((g, i) => <li key={`n-${i}`}>{g}</li>)}
                  {_ensureArray(ad.guidelines?.artwork).map((g, i) => <li key={`a-${i}`}>{g}</li>)}
                  {_ensureArray(ad.guidelines?.install).map((g, i) => <li key={`i-${i}`}>{g}</li>)}
                  {ad.guidelines?.turnaround ? <li><strong>Turnaround:</strong> {ad.guidelines.turnaround}</li> : null}
                </ul>
              </div>
            </details>
          </div>

          {/* FAQs */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold mb-3">FAQs</h3>
            <div className="divide-y">
              {ad.faqs.map((f, i) => (
                <details key={i} className="py-3">
                  <summary className="cursor-pointer font-medium text-gray-900">{f.q}</summary>
                  <p className="mt-2 text-sm text-gray-700">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Right: sticky enquiry */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h4 className="font-semibold mb-1">Get Rates for {ad.type}</h4>
              <div className="text-xs text-gray-500 mb-4">Station: {ad.station.name}</div>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <input required placeholder="Name" className="w-full border border-gray-200 rounded-lg px-3 py-2" />
                <input required placeholder="Company" className="w-full border border-gray-200 rounded-lg px-3 py-2" />
                <input required type="email" placeholder="Email" className="w-full border border-gray-200 rounded-lg px-3 py-2" />
                <input required placeholder="Phone" className="w-full border border-gray-200 rounded-lg px-3 py-2" />
                <textarea placeholder="Campaign details (dates, quantity, target audience)" className="w-full border border-gray-200 rounded-lg px-3 py-2 h-24" />
                <button type="submit" className="w-full bg-red-600 text-white rounded-lg py-3 font-medium">Request Quote</button>
                <p className="text-xs text-gray-500 mt-4">We’ll share the detailed inventory PDF and rates on email.</p>
              </form>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-2xl shadow-sm p-5 cursor-pointer hover:bg-yellow-100 transition" onClick={() => (window.location.href = '/contact')}>
              <h4 className="font-semibold text-lg mb-1">Confused?</h4>
              <p className="text-sm text-gray-700 mb-2">Get a free consultation. Our specialists will plan the best placements for your goals and budget.</p>
              <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600">Get Free Consultation</button>
            </div>
          </div>
        </aside>
      </main>

      {/* Lightbox Modal */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="max-w-5xl w-full">
            <img src={lightbox} alt="enlarged" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

// --- Lightweight test cases (do not modify existing UI) ---
try {
  console.assert(_clampIndex(-1, 5) === 0, "_clampIndex should clamp low bound to 0");
  console.assert(_clampIndex(0, 5) === 0, "_clampIndex should allow 0");
  console.assert(_clampIndex(4, 5) === 4, "_clampIndex should allow max-1");
  console.assert(_clampIndex(10, 5) === 4, "_clampIndex should clamp high bound to len-1");
  // new tests for _ensureArray
  console.assert(Array.isArray(_ensureArray(undefined)), "_ensureArray should return array for undefined");
  console.assert(_ensureArray(undefined).length === 0, "_ensureArray(undefined) should be empty array");
  console.assert(_ensureArray("a")[0] === "a", "_ensureArray should wrap non-array value in array");
  console.assert(JSON.stringify(_ensureArray([1,2])) === JSON.stringify([1,2]), "_ensureArray should return arrays as-is");
} catch (e) {
  // Non-fatal in production; useful during dev
  console.warn("Self-tests failed:", e);
}
