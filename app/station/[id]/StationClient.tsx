'use client'
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { Spinner } from "@heroui/react";

// Native Toast Component
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    return (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg shadow-md text-white z-50 
      ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
            {message}
            <button className="ml-3 font-bold" onClick={onClose}>×</button>
        </div>
    );
}

export default function StationClient() {
    const params = useParams();
    const router = useRouter();
    const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
    const stationId = rawId ? parseInt(rawId, 10) : NaN;

    const [station, setStation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // ✅ Form States
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
    });
    const [errors, setErrors] = useState<any>({});

    // ✅ input change logic
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // ✅ Auto-hide toast
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

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

    const handleProductClick = (productId: number) => {
        router.push(`/inventory/${stationId}/${productId}`);
    };

    // ✅ Submit Logic
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || submitting) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    companyName: formData.company,
                    stationId: stationId,
                }),
            });

            if (!res.ok) throw new Error("Server error");

            setToast({ message: "Request submitted successfully ✅", type: "success" });
            setFormData({ name: "", company: "", email: "", phone: "" });
            setErrors({});
        } catch (err) {
            setToast({ message: "Failed to submit request ❌", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-lg text-gray-600">
                <Spinner size="lg" color="danger" variant="gradient" />
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
                        <Image
                            src={station.images?.[0]}
                            alt={station.name}
                            width={192}
                            height={96}
                            className="w-48 h-24 object-cover rounded-md"
                            unoptimized
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
                                    className="bg-white rounded-xl overflow-hidden transform transition duration-200 hover:scale-105 hover:shadow-xl cursor-pointer focus:outline-none"
                                >
                                    <Image
                                        src={p.thumbnail}
                                        alt={p.name}
                                        width={400}
                                        height={128}
                                        className="w-full h-32 object-cover"
                                        unoptimized
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
                                            <button className="w-full bg-red-600 text-white rounded-lg px-3 py-2 text-sm">
                                                View Inventory
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Map placeholder */}
                    <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
                        <h4 className="font-semibold mb-3">Location & Nearby</h4>
                        <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                            Map placeholder
                        </div>
                    </div>

                    {/* Why Advertise */}
                    <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
                        <h4 className="font-semibold mb-3">Why Advertise at {station.name}?</h4>
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
                            <form className="space-y-3" onSubmit={handleSubmit}>
                                <div>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Name"
                                        className={`w-full border rounded-lg px-3 py-3.5 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <input
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        placeholder="Company"
                                        className={`w-full border rounded-lg px-3 py-3.5 ${errors.company ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {errors.company && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.company}</p>}
                                </div>

                                <div>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Work Email"
                                        className={`w-full border rounded-lg px-3 py-3.5 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone"
                                        className={`w-full border rounded-lg px-3 py-3.5 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.phone}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full rounded-lg py-3 font-medium flex items-center justify-center gap-2 text-white transition
                    ${submitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {submitting ? (
                                        <>
                                            <Spinner size="sm" color="white" />
                                            Submitting...
                                        </>
                                    ) : "Request Quote"}
                                </button>
                            </form>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
