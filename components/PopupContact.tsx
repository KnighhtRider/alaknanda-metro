"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Spinner } from "@heroui/react";

function ErrorMsg({ msg }: { msg: string }) {
    return <p className="text-red-500 text-[11px] mt-1 font-medium animate-pulse">{msg}</p>;
}

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

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        if (!query) return options.filter((o) => !selected.includes(o)).slice(0, 50);
        const lowerQuery = query.toLowerCase();
        return options.filter((o) => !selected.includes(o) && o.toLowerCase().includes(lowerQuery)).slice(0, 50);
    }, [options, selected, query]);

    const handleSelect = (option: string) => {
        onChange([...selected, option]);
        setQuery("");
        setIsOpen(false);
    };

    const handleRemove = (option: string) => {
        onChange(selected.filter((x) => x !== option));
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
                className={`w-full border rounded-lg px-4 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-green-500/30 text-sm ${error ? "border-red-500" : "border-gray-200"
                    }`}
            />
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl max-h-56 overflow-auto py-1 animate-in fade-in slide-in-from-top-1">
                    {filteredOptions.map((opt) => (
                        <div
                            key={opt}
                            onClick={() => handleSelect(opt)}
                            className="px-4 py-2.5 cursor-pointer hover:bg-green-50/80 text-sm text-gray-700 transition-colors flex items-center justify-between group"
                        >
                            <span>{opt}</span>
                            <span className="text-green-600 opacity-0 group-hover:opacity-100 text-xs font-medium transition-opacity">
                                + Add
                            </span>
                        </div>
                    ))}
                </div>
            )}
            {isOpen && query && filteredOptions.length === 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl py-4 text-center text-sm text-gray-500">
                    No results found
                </div>
            )}

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selected.map((s) => (
                        <span
                            key={s}
                            className="bg-green-100/80 border border-green-200 text-green-800 px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 font-medium shadow-sm transition-all hover:bg-green-100"
                        >
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

export default function PopupContact() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [familiarity, setFamiliarity] = useState("know"); // "know" | "help"

    // Aware fields
    const [stations, setStations] = useState<string[]>([]);
    const [adFormats, setAdFormats] = useState<string[]>([]);

    // Not aware fields
    const [goal, setGoal] = useState("");
    const [audience, setAudience] = useState("");

    const [notes, setNotes] = useState("");

    // Options
    const [stationOptions, setStationOptions] = useState<string[]>([]);
    const [adFormatOptions, setAdFormatOptions] = useState<string[]>([]);

    // UI UI
    const [submitting, setSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setHasMounted(true);
        const hasSeenPopup = sessionStorage.getItem("hasSeenContactPopup");

        if (!hasSeenPopup) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem("hasSeenContactPopup", "true");
            }, 5000); // 5 seconds delay

            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (stationOptions.length === 0) {
                fetch("/api/stations")
                    .then((res) => res.json())
                    .then((data) => setStationOptions(Array.from(new Set<string>(data.map((s: any) => s.name)))))
                    .catch(console.error);
            }

            if (adFormatOptions.length === 0) {
                fetch("/api/products")
                    .then((res) => res.json())
                    .then((data) => setAdFormatOptions(Array.from(new Set<string>(data.map((p: any) => p.name)))))
                    .catch(console.error);
            }
        }
    }, [isOpen, stationOptions.length, adFormatOptions.length]);

    const handlePhoneChange = (val: string) => {
        const onlyNums = val.replace(/\D/g, "");
        if (onlyNums.length <= 10) {
            setPhone(onlyNums);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
        }
    };

    const validateForm = useCallback(() => {
        const err: Record<string, string> = {};

        if (!name.trim()) err.name = "Name is required.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) err.email = "Email is required.";
        else if (!emailRegex.test(email)) err.email = "Invalid email address.";

        if (!phone) err.phone = "Mobile number is required.";
        else if (phone.length !== 10) err.phone = "Mobile must be 10 digits.";

        if (familiarity === "know") {
            if (adFormats.length === 0) err.adFormats = "Please select at least one media.";
            if (stations.length === 0) err.stations = "Please select at least one location.";
        } else {
            if (!goal.trim()) err.goal = "Campaign goal is required.";
            if (!audience.trim()) err.audience = "Target audience is required.";
        }

        if (!notes.trim()) err.notes = "Advertising requirement is required.";

        setErrors(err);
        return Object.keys(err).length === 0;
    }, [name, email, phone, familiarity, adFormats, stations, goal, audience, notes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || submitting) return;

        setSubmitting(true);

        const payload = {
            requirement: "advertise",
            name,
            phone,
            email,
            buyerType: "brand", // Defaulting for popup
            familiarity,
            notes,
            stations: familiarity === "know" ? stations : null,
            adFormat: familiarity === "know" ? adFormats.join(", ") : null,
            goal: familiarity === "help" ? goal : null,
            audience: familiarity === "help" ? audience : null,
            companyName: "Not Provided via Popup", // Required in API, so sending a dummy/placeholder
        };

        try {
            const res = await fetch("/api/contact-us", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error();

            setIsSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
            }, 3000); // Close after 3 seconds of success
        } catch {
            setErrors({ form: "Error submitting form. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    if (!hasMounted || !isOpen) return null;

    const inputClass = (err?: string) =>
        `w-full border rounded-lg px-4 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-green-500/30 text-sm ${err ? "border-red-500 bg-red-50/30" : "border-gray-200"
        }`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 p-4">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Left Side: Banner */}
                <div className="hidden md:flex md:w-[40%] bg-gradient-to-br from-[#4F46E5] to-[#4338CA] relative p-8 flex-col justify-center overflow-hidden">
                    {/* Decorative rings / patterns */}
                    <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] rounded-full border-2 border-white/5" />
                    <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] rounded-full border-2 border-white/5" />
                    <div className="absolute top-[0%] left-[0%] w-[100%] h-[100%] rounded-full border-[1px] border-white/10" />
                    <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] rounded-full border-[1px] border-white/10" />

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white leading-tight mb-8">
                            Looking to Advertise<br />Your Brand/Product?
                        </h2>

                        {/* Illustration placeholder (using an icon as fallback) */}
                        <div className="flex justify-center items-center mt-12 opacity-90 drop-shadow-2xl">
                            <svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="25" y="10" width="50" height="80" rx="6" fill="#1E1B4B" />
                                <rect x="28" y="13" width="44" height="65" rx="3" fill="#E0E7FF" />
                                <circle cx="50" cy="84" r="3" fill="#6366F1" />
                                <path d="M40 45 L60 35 L60 55 Z" fill="#FBBF24" />
                                <rect x="35" y="42" width="10" height="6" fill="#F59E0B" />
                                {/* decorative likes/hearts */}
                                <path d="M75 25 A 3 3 0 0 1 80 25 A 3 3 0 0 1 77.5 30 Z" fill="#EC4899" className="animate-pulse" />
                                <path d="M20 65 A 3 3 0 0 1 25 65 A 3 3 0 0 1 22.5 70 Z" fill="#EC4899" className="animate-pulse delay-100" />
                                <circle cx="80" cy="60" r="4" fill="#60A5FA" />
                                <circle cx="20" cy="30" r="3" fill="#34D399" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 p-8 md:p-10 overflow-y-auto w-full custom-scrollbar">
                    {isSuccess ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-in fade-in zoom-in-95">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                            <p className="text-gray-500">Your plan request has been submitted successfully. We&apos;ll be in touch shortly.</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-center text-[#1E1B4B] mb-8">Get a Customized Plan</h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <input
                                        placeholder="Your Name *"
                                        className={inputClass(errors.name)}
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                                        }}
                                    />
                                    {errors.name && <ErrorMsg msg={errors.name} />}
                                </div>

                                <div>
                                    <input
                                        type="email"
                                        placeholder="Your Email Id *"
                                        className={inputClass(errors.email)}
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                                        }}
                                    />
                                    {errors.email && <ErrorMsg msg={errors.email} />}
                                </div>

                                <div>
                                    <input
                                        placeholder="Your Mobile Number *"
                                        className={inputClass(errors.phone)}
                                        value={phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                    />
                                    {errors.phone && <ErrorMsg msg={errors.phone} />}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${familiarity === 'know' ? 'border-[#4F46E5]' : 'border-gray-300'}`}>
                                            {familiarity === 'know' && <div className="w-2 h-2 rounded-full bg-[#4F46E5]" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={familiarity === "know"} onChange={() => setFamiliarity("know")} />
                                        <span className="text-sm font-medium text-gray-700">I&apos;m aware of the Media</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${familiarity === 'help' ? 'border-[#4F46E5]' : 'border-gray-300'}`}>
                                            {familiarity === 'help' && <div className="w-2 h-2 rounded-full bg-[#4F46E5]" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={familiarity === "help"} onChange={() => setFamiliarity("help")} />
                                        <span className="text-sm font-medium text-gray-700">I&apos;m not aware of the Media</span>
                                    </label>
                                </div>

                                {familiarity === "know" ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <SearchableMultiSelect
                                            options={adFormatOptions}
                                            selected={adFormats}
                                            onChange={(s) => {
                                                setAdFormats(s);
                                                if (errors.adFormats) setErrors((p) => ({ ...p, adFormats: "" }));
                                            }}
                                            placeholder="Search medias (eg. Train Wrapping, Panels) *"
                                            error={errors.adFormats}
                                        />

                                        <SearchableMultiSelect
                                            options={stationOptions}
                                            selected={stations}
                                            onChange={(s) => {
                                                setStations(s);
                                                if (errors.stations) setErrors((p) => ({ ...p, stations: "" }));
                                            }}
                                            placeholder="Campaign locations (eg. Rajiv Chowk) *"
                                            error={errors.stations}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <input
                                                placeholder="Campaign Goal (e.g. Brand Awareness) *"
                                                className={inputClass(errors.goal)}
                                                value={goal}
                                                onChange={(e) => {
                                                    setGoal(e.target.value);
                                                    if (errors.goal) setErrors((p) => ({ ...p, goal: "" }));
                                                }}
                                            />
                                            {errors.goal && <ErrorMsg msg={errors.goal} />}
                                        </div>
                                        <div>
                                            <input
                                                placeholder="Target Audience *"
                                                className={inputClass(errors.audience)}
                                                value={audience}
                                                onChange={(e) => {
                                                    setAudience(e.target.value);
                                                    if (errors.audience) setErrors((p) => ({ ...p, audience: "" }));
                                                }}
                                            />
                                            {errors.audience && <ErrorMsg msg={errors.audience} />}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <textarea
                                        placeholder="Advertising Requirement *"
                                        className={`${inputClass(errors.notes)} min-h-[100px] resize-none pt-3`}
                                        value={notes}
                                        onChange={(e) => {
                                            setNotes(e.target.value);
                                            if (errors.notes) setErrors((p) => ({ ...p, notes: "" }));
                                        }}
                                    />
                                    {errors.notes && <ErrorMsg msg={errors.notes} />}
                                    <div className="text-right text-[10px] text-gray-400 mt-1">
                                        {notes.length}/500
                                    </div>
                                </div>

                                {errors.form && <ErrorMsg msg={errors.form} />}

                                <div className="pt-2">
                                    <p className="text-xs text-gray-500 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
                                        By submitting this form, I agree to the <a href="/privacy" className="underline hover:text-gray-800">privacy policy</a> & <a href="/terms" className="underline hover:text-gray-800">terms of service</a>.
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3.5 rounded-lg transition-colors flex justify-center items-center shadow-md active:scale-[0.99] disabled:opacity-75 disabled:cursor-wait"
                                    >
                                        {submitting ? <Spinner size="sm" color="white" /> : "Send Message"}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Custom Scrollbar Styles for the Modal */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}} />
        </div>
    );
}
