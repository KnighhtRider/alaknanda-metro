"use client";

import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@heroui/react";

// --- Native Toast Component ---
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl text-white z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300
      ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
            <span className="font-medium">{message}</span>
            <button className="hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition-colors" onClick={onClose}>×</button>
        </div>
    );
}

// --- Error Component for Fields ---
function ErrorMsg({ msg }: { msg: string }) {
    return <p className="text-red-500 text-[11px] mt-1 font-medium animate-pulse">{msg}</p>;
}

export default function ContactClient() {
    // Core state
    const [requirement, setRequirement] = useState(""); // advertise | inventory
    const [buyerType, setBuyerType] = useState(""); // brand | agency
    const [familiarity, setFamiliarity] = useState(""); // know | help

    // Aware fields
    const [stations, setStations] = useState<string[]>([]);
    const [adFormat, setAdFormat] = useState("");
    const [budget, setBudget] = useState("");

    // Not aware fields
    const [goal, setGoal] = useState("");
    const [audience, setAudience] = useState("");
    const [timeline, setTimeline] = useState("");

    // Shared fields
    const [companyName, setCompanyName] = useState("");
    const [mediaKitFile, setMediaKitFile] = useState<File | null>(null);

    // Contact
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [notes, setNotes] = useState("");

    // Options & Dropdowns
    const [stationOptions, setStationOptions] = useState<string[]>([]);
    const [adFormatOptions, setAdFormatOptions] = useState<string[]>([]);
    const [stationQuery, setStationQuery] = useState("");
    const [showStationDropdown, setShowStationDropdown] = useState(false);

    // UI / Logic States
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch("/api/stations")
            .then((res) => res.json())
            .then((data) => setStationOptions(data.map((s: any) => s.name)))
            .catch(console.error);

        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => setAdFormatOptions(data.map((p: any) => p.name)))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(timer);
    }, [toast]);

    const BUDGET_OPTIONS = [
        { value: "u1", label: "Below ₹1 Lakhs" },
        { value: "1to5", label: "₹1-5 Lakhs" },
        { value: "5to25", label: "₹5-25 Lakhs" },
        { value: ">25", label: "₹25 Lakhs+" },
        { value: "tbd", label: "Yet to Decide" },
    ];

    const CTA_TEXT = useMemo(() => {
        if (submitting) return "Submitting...";
        if (requirement === "inventory") return "List Inventory";
        if (familiarity === "know") return "Request Quote";
        if (familiarity === "help") return "Get Free Consultation";
        return "Submit";
    }, [requirement, familiarity, submitting]);

    // Validation Logic
    const validateForm = () => {
        const err: Record<string, string> = {};

        if (!requirement) err.requirement = "Please select your requirement type.";
        if (!companyName.trim()) err.companyName = "Company name is required.";
        if (!name.trim()) err.name = "Please provide your full name.";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) err.email = "Email is required.";
        else if (!emailRegex.test(email)) err.email = "Please enter a valid email address.";

        if (!phone) err.phone = "Phone number is required.";
        else if (phone.length !== 10) err.phone = "Phone number must be exactly 10 digits.";

        if (requirement === "advertise") {
            if (!buyerType) err.buyerType = "Please select Brand or Agency.";
            if (!familiarity) err.familiarity = "Please select your media familiarity.";

            if (familiarity === "know") {
                if (!adFormat) err.adFormat = "Please select an ad format.";
                if (!budget) err.budget = "Please select your budget range.";
                if (stations.length === 0) err.stations = "Please select at least one station.";
            }
            if (familiarity === "help") {
                if (!goal.trim()) err.goal = "Tell us your campaign goal.";
                if (!audience.trim()) err.audience = "Target audience is required.";
                if (!timeline) err.timeline = "Please select a timeline.";
            }
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handlePhoneChange = (val: string) => {
        const onlyNums = val.replace(/\D/g, "");
        if (onlyNums.length <= 10) {
            setPhone(onlyNums);
            if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
        }
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!validateForm() || submitting) return;

        setSubmitting(true);

        const payload = {
            requirement,
            companyName,
            name,
            phone,
            email,
            buyerType: requirement === "inventory" ? null : buyerType,
            familiarity: requirement === "inventory" ? null : familiarity,
            notes,
            stations: familiarity === "know" ? stations : null,
            adFormat: familiarity === "know" ? adFormat : null,
            budget: familiarity === "know" ? budget : null,
            goal: familiarity === "help" ? goal : null,
            audience: familiarity === "help" ? audience : null,
            timeline: familiarity === "help" ? timeline : null,
            mediaKit: mediaKitFile ? { name: mediaKitFile.name, size: mediaKitFile.size } : null,
        };

        try {
            const res = await fetch("/api/contact-us", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error();

            setToast({ message: "Request submitted successfully! ✅", type: "success" });
            // Reset form
            setRequirement(""); setCompanyName(""); setName(""); setPhone(""); setEmail(""); setNotes(""); setStations([]); setErrors({});
        } catch (err) {
            setToast({ message: "Error submitting form. Please try again. ❌", type: "error" });
        } finally {
            setSubmitting(false);
        }
    }

    const AD_PHONE = "+91 98765 43210";
    const AD_EMAIL = "advertising@aal.com";
    const ADDRESS_LINE = "AAL Office, 123 Media Street, Delhi";
    const MAP_QUERY = "https://maps.google.com";

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold mb-2">Write To Us</h2>
                            <p className="text-sm text-gray-500 mb-6">Reach out and we will get back to you within 24 hours.</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Requirement Select */}
                                <div>
                                    <select
                                        className={`w-full border rounded-lg px-4 py-3 outline-none transition ${errors.requirement ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-green-500'}`}
                                        value={requirement}
                                        onChange={(e) => { setRequirement(e.target.value); setErrors({}); }}
                                    >
                                        <option value="" disabled>Select Requirement *</option>
                                        <option value="advertise">I want to advertise in Delhi Metro</option>
                                        <option value="inventory">I want to list my media inventory</option>
                                    </select>
                                    {errors.requirement && <ErrorMsg msg={errors.requirement} />}
                                </div>

                                {requirement === "advertise" && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-tight">I am a:</p>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                                <input type="radio" className="accent-green-600" name="buyer" checked={buyerType === "brand"} onChange={() => setBuyerType("brand")} />
                                                <span className="group-hover:text-green-600">Brand / Advertiser</span>
                                            </label>
                                            <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                                <input type="radio" className="accent-green-600" name="buyer" checked={buyerType === "agency"} onChange={() => setBuyerType("agency")} />
                                                <span className="group-hover:text-green-600">Agency</span>
                                            </label>
                                        </div>
                                        {errors.buyerType && <ErrorMsg msg={errors.buyerType} />}
                                    </div>
                                )}

                                {/* INVENTORY FLOW */}
                                {requirement === "inventory" && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <input className={`w-full border rounded-lg px-4 py-3 ${errors.companyName ? 'border-red-500' : 'border-gray-200'}`} placeholder="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                                            {errors.companyName && <ErrorMsg msg={errors.companyName} />}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <input className={`w-full border rounded-lg px-4 py-3 ${errors.name ? 'border-red-500' : 'border-gray-200'}`} placeholder="Your Name *" value={name} onChange={(e) => setName(e.target.value)} />
                                                {errors.name && <ErrorMsg msg={errors.name} />}
                                            </div>
                                            <div>
                                                <input className={`w-full border rounded-lg px-4 py-3 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} placeholder="Your Phone (10-digit) *" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} />
                                                {errors.phone && <ErrorMsg msg={errors.phone} />}
                                            </div>
                                        </div>
                                        <div>
                                            <input className={`w-full border rounded-lg px-4 py-3 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} type="email" placeholder="Your Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
                                            {errors.email && <ErrorMsg msg={errors.email} />}
                                        </div>
                                        <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                                            <label className="block text-sm font-medium text-gray-700">Upload Media Kit</label>
                                            <input type="file" className="mt-2 w-full text-xs" accept=".pdf,.ppt,.pptx,.csv" onChange={(e) => setMediaKitFile(e.target.files?.[0] || null)} />
                                        </div>
                                    </div>
                                )}

                                {/* ADVERTISING FLOW */}
                                {requirement === "advertise" && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <div className="flex items-center gap-6">
                                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="radio" className="accent-green-600" name="fam" checked={familiarity === "know"} onChange={() => setFamiliarity("know")} />
                                                    <span>I’m aware of the Media</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="radio" className="accent-green-600" name="fam" checked={familiarity === "help"} onChange={() => setFamiliarity("help")} />
                                                    <span>I’m not aware of the Media</span>
                                                </label>
                                            </div>
                                            {errors.familiarity && <ErrorMsg msg={errors.familiarity} />}
                                        </div>

                                        {familiarity === "know" && (
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <input
                                                        value={stationQuery}
                                                        onChange={(e) => { setStationQuery(e.target.value); setShowStationDropdown(true); }}
                                                        placeholder="Search & Add Stations *"
                                                        className={`w-full border rounded-lg px-4 py-3 ${errors.stations ? 'border-red-500' : 'border-gray-200'}`}
                                                    />
                                                    {showStationDropdown && stationQuery && (
                                                        <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-xl max-h-48 overflow-auto">
                                                            {stationOptions.filter(s => s.toLowerCase().includes(stationQuery.toLowerCase()) && !stations.includes(s)).map(s => (
                                                                <div key={s} onClick={() => { setStations([...stations, s]); setStationQuery(""); setShowStationDropdown(false); }} className="px-4 py-2 cursor-pointer hover:bg-green-50 text-sm">{s}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {stations.map(s => (
                                                            <span key={s} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs flex items-center gap-1 font-medium">
                                                                {s} <button type="button" onClick={() => setStations(stations.filter(x => x !== s))} className="hover:text-red-500 text-lg">&times;</button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {errors.stations && <ErrorMsg msg={errors.stations} />}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <select className={`w-full border rounded-lg px-4 py-3 ${errors.adFormat ? 'border-red-500' : 'border-gray-200'}`} value={adFormat} onChange={(e) => setAdFormat(e.target.value)}>
                                                            <option value="" disabled>Ad Format *</option>
                                                            {adFormatOptions.map(f => <option key={f} value={f}>{f}</option>)}
                                                        </select>
                                                        {errors.adFormat && <ErrorMsg msg={errors.adFormat} />}
                                                    </div>
                                                    <div>
                                                        <select className={`w-full border rounded-lg px-4 py-3 ${errors.budget ? 'border-red-500' : 'border-gray-200'}`} value={budget} onChange={(e) => setBudget(e.target.value)}>
                                                            <option value="" disabled>Budget Range *</option>
                                                            {BUDGET_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                                                        </select>
                                                        {errors.budget && <ErrorMsg msg={errors.budget} />}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {familiarity === "help" && (
                                            <div className="space-y-4">
                                                <div>
                                                    <input className={`w-full border rounded-lg px-4 py-3 ${errors.goal ? 'border-red-500' : 'border-gray-200'}`} placeholder="Campaign Goal *" value={goal} onChange={(e) => setGoal(e.target.value)} />
                                                    {errors.goal && <ErrorMsg msg={errors.goal} />}
                                                </div>
                                                <div>
                                                    <input className={`w-full border rounded-lg px-4 py-3 ${errors.audience ? 'border-red-500' : 'border-gray-200'}`} placeholder="Target Audience *" value={audience} onChange={(e) => setAudience(e.target.value)} />
                                                    {errors.audience && <ErrorMsg msg={errors.audience} />}
                                                </div>
                                                <div>
                                                    <select className={`w-full border rounded-lg px-4 py-3 ${errors.timeline ? 'border-red-500' : 'border-gray-200'}`} value={timeline} onChange={(e) => setTimeline(e.target.value)}>
                                                        <option value="" disabled>Timeline *</option>
                                                        <option value="asap">ASAP</option>
                                                        <option value="2w">Within 2 weeks</option>
                                                        <option value="tm">This month</option>
                                                    </select>
                                                    {errors.timeline && <ErrorMsg msg={errors.timeline} />}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 space-y-4 border-t border-gray-100">
                                            <div>
                                                <input className={`w-full border rounded-lg px-4 py-3 ${errors.companyName ? 'border-red-500' : 'border-gray-200'}`} placeholder="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                                                {errors.companyName && <ErrorMsg msg={errors.companyName} />}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <input className={`w-full border rounded-lg px-4 py-3 ${errors.name ? 'border-red-500' : 'border-gray-200'}`} placeholder="Your Name *" value={name} onChange={(e) => setName(e.target.value)} />
                                                    {errors.name && <ErrorMsg msg={errors.name} />}
                                                </div>
                                                <div>
                                                    <input className={`w-full border rounded-lg px-4 py-3 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} placeholder="Phone (10 digits) *" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} />
                                                    {errors.phone && <ErrorMsg msg={errors.phone} />}
                                                </div>
                                            </div>
                                            <div>
                                                <input className={`w-full border rounded-lg px-4 py-3 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} type="email" placeholder="Your Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
                                                {errors.email && <ErrorMsg msg={errors.email} />}
                                            </div>
                                            <textarea className="w-full border border-gray-200 rounded-lg px-4 py-3 h-24 outline-none focus:border-green-500" placeholder="Additional Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {requirement && (
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-green-200
                      ${submitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                                    >
                                        {submitting && <Spinner size="sm" color="white" />}
                                        {CTA_TEXT}
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    <aside className="lg:col-span-1 space-y-4">
                        <div className={`rounded-2xl p-6 text-white shadow-xl transition-all duration-700 ${requirement === "advertise" ? "bg-green-600 rotate-1" : "bg-gray-900"}`}>
                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Support Line</p>
                            <a href={`tel:${AD_PHONE.replace(/\s/g, "")}`} className="text-2xl font-black block mt-1">{AD_PHONE}</a>
                            <p className="text-xs mt-3 opacity-60">Mon–Sat: 10am – 6pm</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Email Us</p>
                            <a href={`mailto:${AD_EMAIL}`} className="font-bold text-gray-800 hover:text-green-600 transition-colors">{AD_EMAIL}</a>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Our Office</p>
                            <p className="text-sm font-medium leading-relaxed">{ADDRESS_LINE}</p>
                            <a href={MAP_QUERY} target="_blank" rel="noreferrer" className="text-xs text-blue-600 mt-4 inline-block font-bold">View Direction →</a>
                        </div>
                    </aside>
                </div>
            </main>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
