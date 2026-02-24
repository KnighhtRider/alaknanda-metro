"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
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

// --- Searchable Multi-Select Component ---
interface SearchableMultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
    error?: string;
}

function SearchableMultiSelect({ options, selected, onChange, placeholder, error }: SearchableMultiSelectProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Memoize and slice options for performance
    const filteredOptions = useMemo(() => {
        if (!query) return options.filter(o => !selected.includes(o)).slice(0, 50);
        const lowerQuery = query.toLowerCase();
        return options
            .filter(o => !selected.includes(o) && o.toLowerCase().includes(lowerQuery))
            .slice(0, 50);
    }, [options, selected, query]);

    const handleSelect = (option: string) => {
        onChange([...selected, option]);
        setQuery("");
        setIsOpen(false);
    };

    const handleRemove = (option: string) => {
        onChange(selected.filter(x => x !== option));
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className={`w-full border rounded-lg px-4 py-3 outline-none transition-shadow focus:ring-2 focus:ring-green-500/30 ${error ? 'border-red-500' : 'border-gray-200'}`}
            />
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl max-h-56 overflow-auto py-1 animate-in fade-in slide-in-from-top-1">
                    {filteredOptions.map(opt => (
                        <div
                            key={opt}
                            onClick={() => handleSelect(opt)}
                            className="px-4 py-2.5 cursor-pointer hover:bg-green-50/80 text-sm text-gray-700 transition-colors flex items-center justify-between group"
                        >
                            <span>{opt}</span>
                            <span className="text-green-600 opacity-0 group-hover:opacity-100 text-xs font-medium transition-opacity">+ Add</span>
                        </div>
                    ))}
                </div>
            )}
            {isOpen && query && filteredOptions.length === 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl py-4 text-center text-sm text-gray-500">
                    No results found
                </div>
            )}

            {/* Selected Chips */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {selected.map(s => (
                        <span key={s} className="bg-green-100/80 border border-green-200 text-green-800 px-3 py-1.5 rounded-full text-xs flex items-center gap-2 font-medium shadow-sm transition-all hover:bg-green-100">
                            {s}
                            <button
                                type="button"
                                onClick={() => handleRemove(s)}
                                className="hover:text-red-500 bg-green-200/50 hover:bg-red-100 w-4 h-4 rounded-full flex items-center justify-center transition-colors pb-0.5"
                                aria-label="Remove"
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
            )}
            {error && <ErrorMsg msg={error} />}
        </div>
    );
}

export default function ContactClient() {
    // Core state
    const [requirement, setRequirement] = useState(""); // advertise | inventory
    const [buyerType, setBuyerType] = useState(""); // brand | agency
    const [familiarity, setFamiliarity] = useState(""); // know | help

    // Aware fields
    const [stations, setStations] = useState<string[]>([]);
    const [adFormats, setAdFormats] = useState<string[]>([]); // <--- MULTI-SELECT
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

    // UI / Logic States
    const [submitting, setSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- Lazy Load Data Only When Needed ---
    useEffect(() => {
        if (requirement === "advertise" && familiarity === "know") {
            if (stationOptions.length === 0) {
                fetch("/api/stations")
                    .then((res) => res.json())
                    .then((data) => setStationOptions(data.map((s: any) => s.name)))
                    .catch(console.error);
            }

            if (adFormatOptions.length === 0) {
                fetch("/api/products")
                    .then((res) => res.json())
                    .then((data) => setAdFormatOptions(data.map((p: any) => p.name)))
                    .catch(console.error);
            }
        }
    }, [requirement, familiarity, stationOptions.length, adFormatOptions.length]);

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
    const validateForm = useCallback(() => {
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
                if (adFormats.length === 0) err.adFormats = "Please select at least one ad format.";
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
    }, [requirement, companyName, name, email, phone, buyerType, familiarity, adFormats, budget, stations, goal, audience, timeline]);

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
            adFormat: familiarity === "know" ? adFormats.join(", ") : null, // <--- JOIN ARRAY FOR BACKEND
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

            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setToast({ message: "Failed to submit inquiry. Please try again later.", type: "error" });
        } finally {
            setSubmitting(false);
        }
    }

    const AD_PHONE = "+91 98765 43210";
    const AD_EMAIL = "advertising@aal.com";
    const ADDRESS_LINE = "AAL Office, 123 Media Street, Delhi";
    const MAP_QUERY = "https://maps.google.com";

    // --- Input Classes for consistent design ---
    const inputBaseClass = "w-full border rounded-lg px-4 py-3 outline-none transition-shadow focus:ring-2 focus:ring-green-500/30";
    const getInputClass = (err?: string) => `${inputBaseClass} ${err ? 'border-red-500 bg-red-50/30 focus:ring-red-500/30' : 'border-gray-200 focus:border-green-500'}`;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

                            {isSuccess ? (
                                <div className="py-16 px-4 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Request Submitted!</h2>
                                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                        Thank you for reaching out. Our team has received your request and will get back to you within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setIsSuccess(false);
                                            setRequirement(""); setCompanyName(""); setName(""); setPhone(""); setEmail(""); setNotes(""); setStations([]); setAdFormats([]); setErrors({});
                                        }}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-xl transition-colors"
                                    >
                                        Submit Another Request
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-semibold mb-2">Write To Us</h2>
                                    <p className="text-sm text-gray-500 mb-8">Reach out and we will get back to you within 24 hours.</p>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Requirement Select */}
                                        <div>
                                            <select
                                                className={getInputClass(errors.requirement)}
                                                value={requirement}
                                                onChange={(e) => { setRequirement(e.target.value); setErrors(prev => ({ ...prev, requirement: "" })); }}
                                            >
                                                <option value="" disabled>Select Requirement *</option>
                                                <option value="advertise">I want to advertise in Delhi Metro</option>
                                                <option value="inventory">I want to list my media inventory</option>
                                            </select>
                                            {errors.requirement && <ErrorMsg msg={errors.requirement} />}
                                        </div>

                                        {requirement === "advertise" && (
                                            <div className="animate-in fade-in slide-in-from-top-2">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">I am a:</p>
                                                <div className="flex items-center gap-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                                    <label className="flex items-center gap-3 text-sm cursor-pointer group">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${buyerType === 'brand' ? 'border-green-600' : 'border-gray-300 group-hover:border-green-400'}`}>
                                                            {buyerType === 'brand' && <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-in zoom-in-50" />}
                                                        </div>
                                                        <input type="radio" className="hidden" name="buyer" checked={buyerType === "brand"} onChange={() => setBuyerType("brand")} />
                                                        <span className="font-medium text-gray-700 group-hover:text-gray-900">Brand / Advertiser</span>
                                                    </label>
                                                    <label className="flex items-center gap-3 text-sm cursor-pointer group">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${buyerType === 'agency' ? 'border-green-600' : 'border-gray-300 group-hover:border-green-400'}`}>
                                                            {buyerType === 'agency' && <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-in zoom-in-50" />}
                                                        </div>
                                                        <input type="radio" className="hidden" name="buyer" checked={buyerType === "agency"} onChange={() => setBuyerType("agency")} />
                                                        <span className="font-medium text-gray-700 group-hover:text-gray-900">Agency</span>
                                                    </label>
                                                </div>
                                                {errors.buyerType && <ErrorMsg msg={errors.buyerType} />}
                                            </div>
                                        )}

                                        {/* INVENTORY FLOW */}
                                        {requirement === "inventory" && (
                                            <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div>
                                                    <input className={getInputClass(errors.companyName)} placeholder="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                                                    {errors.companyName && <ErrorMsg msg={errors.companyName} />}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div>
                                                        <input className={getInputClass(errors.name)} placeholder="Your Name *" value={name} onChange={(e) => setName(e.target.value)} />
                                                        {errors.name && <ErrorMsg msg={errors.name} />}
                                                    </div>
                                                    <div>
                                                        <input className={getInputClass(errors.phone)} placeholder="Your Phone (10-digit) *" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} />
                                                        {errors.phone && <ErrorMsg msg={errors.phone} />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <input className={getInputClass(errors.email)} type="email" placeholder="Your Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
                                                    {errors.email && <ErrorMsg msg={errors.email} />}
                                                </div>
                                                <div className="border border-dashed border-gray-300 rounded-xl p-5 bg-gray-50 hover:bg-gray-100 transition-colors group">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-green-700 transition-colors">Upload Media Kit</label>
                                                    <p className="text-xs text-gray-400 mb-3">PDF, PPT, or CSV formats (Max 10MB)</p>
                                                    <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all cursor-pointer" accept=".pdf,.ppt,.pptx,.csv" onChange={(e) => setMediaKitFile(e.target.files?.[0] || null)} />
                                                </div>
                                            </div>
                                        )}

                                        {/* ADVERTISING FLOW */}
                                        {requirement === "advertise" && (
                                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div>
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${familiarity === 'know' ? 'bg-green-50/50 border-green-500 shadow-sm' : 'bg-gray-50/30 border-gray-200 hover:border-green-300'}`}>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${familiarity === 'know' ? 'border-green-600' : 'border-gray-300'}`}>
                                                                {familiarity === 'know' && <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-in zoom-in-50" />}
                                                            </div>
                                                            <input type="radio" className="hidden" name="fam" checked={familiarity === "know"} onChange={() => setFamiliarity("know")} />
                                                            <div>
                                                                <p className="font-medium text-gray-900 text-sm">I&apos;m aware of the Media</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">I know which stations and formats I want</p>
                                                            </div>
                                                        </label>
                                                        <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${familiarity === 'help' ? 'bg-green-50/50 border-green-500 shadow-sm' : 'bg-gray-50/30 border-gray-200 hover:border-green-300'}`}>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${familiarity === 'help' ? 'border-green-600' : 'border-gray-300'}`}>
                                                                {familiarity === 'help' && <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-in zoom-in-50" />}
                                                            </div>
                                                            <input type="radio" className="hidden" name="fam" checked={familiarity === "help"} onChange={() => setFamiliarity("help")} />
                                                            <div>
                                                                <p className="font-medium text-gray-900 text-sm">I need help planning</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">I need recommendations for my campaign</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                    {errors.familiarity && <ErrorMsg msg={errors.familiarity} />}
                                                </div>

                                                {familiarity === "know" && (
                                                    <div className="space-y-5 bg-blue-50/30 p-5 rounded-xl border border-blue-100/50 animate-in fade-in-50 slide-in-from-top-2">
                                                        <h3 className="text-sm font-semibold text-blue-900/80 uppercase tracking-wide">Targeting Details</h3>

                                                        <SearchableMultiSelect
                                                            options={stationOptions}
                                                            selected={stations}
                                                            onChange={(newStations) => { setStations(newStations); setErrors(prev => ({ ...prev, stations: "" })); }}
                                                            placeholder="Search & Add Stations *"
                                                            error={errors.stations}
                                                        />

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div className="md:col-span-2 lg:col-span-1">
                                                                <SearchableMultiSelect
                                                                    options={adFormatOptions}
                                                                    selected={adFormats}
                                                                    onChange={(newFormats) => { setAdFormats(newFormats); setErrors(prev => ({ ...prev, adFormats: "" })); }}
                                                                    placeholder="Search & Add Ad Formats *"
                                                                    error={errors.adFormats}
                                                                />
                                                            </div>
                                                            <div>
                                                                <select className={getInputClass(errors.budget)} value={budget} onChange={(e) => { setBudget(e.target.value); setErrors(prev => ({ ...prev, budget: "" })); }}>
                                                                    <option value="" disabled>Select Budget Range *</option>
                                                                    {BUDGET_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                                                                </select>
                                                                {errors.budget && <ErrorMsg msg={errors.budget} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {familiarity === "help" && (
                                                    <div className="space-y-5 bg-purple-50/30 p-5 rounded-xl border border-purple-100/50 animate-in fade-in-50 slide-in-from-top-2">
                                                        <h3 className="text-sm font-semibold text-purple-900/80 uppercase tracking-wide">Campaign Advisory</h3>
                                                        <div>
                                                            <input className={getInputClass(errors.goal)} placeholder="Campaign Goal (e.g., Brand Awareness, Lead Gen) *" value={goal} onChange={(e) => setGoal(e.target.value)} />
                                                            {errors.goal && <ErrorMsg msg={errors.goal} />}
                                                        </div>
                                                        <div>
                                                            <input className={getInputClass(errors.audience)} placeholder="Target Audience (e.g., Daily Commuters, Students) *" value={audience} onChange={(e) => setAudience(e.target.value)} />
                                                            {errors.audience && <ErrorMsg msg={errors.audience} />}
                                                        </div>
                                                        <div>
                                                            <select className={getInputClass(errors.timeline)} value={timeline} onChange={(e) => setTimeline(e.target.value)}>
                                                                <option value="" disabled>Expected Timeline *</option>
                                                                <option value="asap">ASAP (Urgent)</option>
                                                                <option value="2w">Within 2 weeks</option>
                                                                <option value="tm">This month</option>
                                                                <option value="pl">Just planning for future</option>
                                                            </select>
                                                            {errors.timeline && <ErrorMsg msg={errors.timeline} />}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-6 mt-6 space-y-5 border-t border-gray-100">
                                                    <div>
                                                        <input className={getInputClass(errors.companyName)} placeholder="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                                                        {errors.companyName && <ErrorMsg msg={errors.companyName} />}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <div>
                                                            <input className={getInputClass(errors.name)} placeholder="Your Name *" value={name} onChange={(e) => setName(e.target.value)} />
                                                            {errors.name && <ErrorMsg msg={errors.name} />}
                                                        </div>
                                                        <div>
                                                            <input className={getInputClass(errors.phone)} placeholder="Phone (10 digits) *" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} />
                                                            {errors.phone && <ErrorMsg msg={errors.phone} />}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <input className={getInputClass(errors.email)} type="email" placeholder="Your Work Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
                                                        {errors.email && <ErrorMsg msg={errors.email} />}
                                                    </div>
                                                    <textarea className={`${inputBaseClass} h-28 resize-none`} placeholder="Additional Notes or Specific Requirements (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
                                                </div>
                                            </div>
                                        )}

                                        {requirement && (
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-lg shadow-green-200/50 mt-8 min-h-[56px]
                                ${submitting ? 'bg-green-500/80 cursor-wait' : 'bg-green-600 hover:bg-green-700 hover:shadow-green-300/50 hover:-translate-y-0.5'}`}
                                            >
                                                {submitting && <Spinner size="sm" color="white" />}
                                                {CTA_TEXT}
                                            </button>
                                        )}
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                    <aside className="lg:col-span-1 space-y-5">
                        <div className={`rounded-2xl p-6 md:p-8 text-white shadow-xl transition-all duration-700 transform ${requirement === "advertise" ? "bg-gradient-to-br from-green-600 to-green-700 rotate-1 hover:rotate-0" : "bg-gradient-to-br from-gray-800 to-gray-900"}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <p className="text-[11px] uppercase font-bold tracking-widest opacity-80">Support Line</p>
                            </div>
                            <a href={`tel:${AD_PHONE.replace(/\s/g, "")}`} className="text-3xl font-black block mt-3 tracking-tight hover:opacity-90 transition-opacity">{AD_PHONE}</a>
                            <p className="text-xs mt-4 opacity-70 font-medium">Mon–Sat: 10:00 AM – 6:00 PM</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <p className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">Email Us</p>
                            </div>
                            <a href={`mailto:${AD_EMAIL}`} className="font-bold text-gray-800 hover:text-green-600 transition-colors block text-lg">{AD_EMAIL}</a>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <p className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">Our Office</p>
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-gray-700">{ADDRESS_LINE}</p>
                            <a href={MAP_QUERY} target="_blank" rel="noreferrer" className="text-sm text-green-600 hover:text-green-700 mt-4 inline-flex items-center gap-1.5 font-bold transition-colors group-hover:gap-2">
                                View Direction
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                        </div>
                    </aside>
                </div>
            </main>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
