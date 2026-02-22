'use client'
import Link from "next/link";
import Image from "next/image";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from "@heroui/react";

// --- Utilities ---
function _clampIndex(i: number, len: number) {
    return Math.max(0, Math.min(i, len - 1));
}

function _ensureArray(x: string | number[] | string[] | undefined) {
    return Array.isArray(x) ? x : x ? [x] : [];
}

// Native swipe Carousel
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
                        <Image src={src} alt={`Slide ${i + 1}`} fill className="object-cover" unoptimized />
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

function InlineToast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    return (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg shadow-md text-white z-50 
      ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
            {message}
            <button className="ml-3 font-bold" onClick={onClose}>×</button>
        </div>
    );
}

export default function AdOptionDetail() {
    const params = useParams();
    const router = useRouter();

    const stationId = Number(params.id);
    const productId = Number(params.item);

    const [station, setStation] = useState<any>(null);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // ✅ Validation States
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        notes: "",
    });
    const [errors, setErrors] = useState<any>({});

    // ✅ input change with phone filter
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "phone") {
            const onlyNums = value.replace(/\D/g, "");
            if (onlyNums.length <= 10) {
                setFormData((prev) => ({ ...prev, phone: onlyNums }));
            }
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ validation logic
    const validateForm = () => {
        const newErrors: any = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.company.trim()) newErrors.company = "Company is required";
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email";
        }
        if (!formData.phone) {
            newErrors.phone = "Phone is required";
        } else if (formData.phone.length !== 10) {
            newErrors.phone = "Must be 10 digits";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ Auto-hide toast after 3 seconds
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => {
            setToast(null);
        }, 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/stations/${stationId}`);
                const stationData = await res.json();
                setStation(stationData);

                const selectedProduct = stationData.products?.find((p: any) => p.id === productId);
                setProduct(selectedProduct);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };

        if (!isNaN(stationId) && !isNaN(productId)) {
            fetchData();
        }
    }, [stationId, productId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-600">
                <Spinner size="lg" color="danger" variant="gradient" />
            </div>
        );
    }

    if (!station || !product) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-600">
                Inventory not found
            </div>
        );
    }

    const ad = {
        id: product.id,
        type: product.name,
        station: {
            id: station.id,
            name: station.name,
            line: station.lines?.[0] || "Metro Line",
            lineColorClass: "bg-yellow-400",
            tags: ["Popular", "High Footfall"],
            footfall: station.footfall || "High footfall",
        },
        summary: {
            totalUnits: product.units || 0,
            startingDay: product.rateDay || product.defaultRateDay || 0,
            startingMonth: product.rateMonth || (product.rateDay || product.defaultRateDay || 0) * 30,
        },
        gallery: station.images || [product.thumbnail],
        specs: {
            typicalSizes: product.sizes || ["6x3 ft", "8x4 ft", "10x4 ft"],
            illumination: product.illumination || "LED backlit",
            finish: product.finish || "Vinyl print on acrylic/ACP frame",
            locations: product.locations || ["Concourse", "Corridors", "Entry/Exit"],
        },
        guidelines: {
            notes: [
                "Provide print-ready artwork (PDF/AI)",
                "Creative must follow DMRC policies",
                "Installation follows DMRC safety protocols",
                "Typical execution timeline: 7 days (faster possible)"
            ],
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

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-6 pt-6 text-sm text-gray-500">
                <Link href="/">Home</Link> › <Link href="/catalogue">Catalogue</Link> › <Link href={`/station/${ad.station.id}`}>{ad.station.name}</Link> › <span className="text-gray-800">{ad.type}</span>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
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

                    {/* Image Gallery */}
                    <div className="mt-6 bg-white rounded-2xl shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Gallery</h3>
                            <div className="text-sm text-gray-500">Swipe or use arrows • Tap to enlarge</div>
                        </div>
                        <div><Carousel images={ad.gallery} onOpen={setLightbox} /></div>
                    </div>

                    {/* Specs & Guidelines */}
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
                            <form
                                className="space-y-3"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (submitting) return;

                                    // ✅ Validate before submission
                                    if (!validateForm()) return;

                                    setSubmitting(true);

                                    const payload = {
                                        ...formData,
                                        companyName: formData.company, // Aligning with your API naming
                                        stationId,
                                        productId,
                                    };

                                    try {
                                        const res = await fetch("/api/leads", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(payload),
                                        });

                                        if (!res.ok) throw new Error("Server error");

                                        setToast({
                                            message: "Lead submitted successfully ✅",
                                            type: "success"
                                        });

                                        // Reset form state
                                        setFormData({ name: "", company: "", email: "", phone: "", notes: "" });
                                        setErrors({});

                                    } catch (err) {
                                        console.error(err);
                                        setToast({
                                            message: "Something went wrong ❌",
                                            type: "error"
                                        });
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                <div>
                                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className={`w-full border rounded-lg px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-200'}`} />
                                    {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <input name="company" value={formData.company} onChange={handleChange} placeholder="Company" className={`w-full border rounded-lg px-3 py-2 ${errors.company ? 'border-red-500' : 'border-gray-200'}`} />
                                    {errors.company && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.company}</p>}
                                </div>

                                <div>
                                    <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className={`w-full border rounded-lg px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} />
                                    {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className={`w-full border rounded-lg px-3 py-2 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} />
                                    {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.phone}</p>}
                                </div>

                                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Campaign details (dates, quantity, target audience)" className="w-full border border-gray-200 rounded-lg px-3 py-2 h-24" />

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full rounded-lg py-3 font-medium flex items-center justify-center gap-2 
                    ${submitting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} 
                    text-white transition`}
                                >
                                    {submitting ? (
                                        <>
                                            <Spinner size="sm" color="white" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Request Quote"
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 mt-4">We will share the detailed inventory PDF and rates on email.</p>
                            </form>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-2xl shadow-sm p-5 cursor-pointer hover:bg-yellow-100 transition" onClick={() => router.push('/contact')}>
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
                        <Image src={lightbox} alt="enlarged" width={1200} height={800} className="w-full h-auto rounded-lg" unoptimized />
                    </div>
                </div>
            )}

        </div>
    );
}