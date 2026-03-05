"use client";

import { useState, useEffect } from "react";
import { usePlan } from "@/context/PlanContext";
import { X, Trash2, MapPin, Tag, Check } from "lucide-react";
import { Spinner } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";

export default function PlanDrawer() {
    const { isPlanOpen, setIsPlanOpen, selectedPlans, removeFromPlan, clearPlan, userDetails, setUserDetails } = usePlan();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [errors, setErrors] = useState<any>({});
    const [notes, setNotes] = useState("");

    // Reset submitted state when drawer closes/opens
    useEffect(() => {
        if (!isPlanOpen) {
            const timer = setTimeout(() => setSubmitted(false), 500); // Wait for exit animation
            return () => clearTimeout(timer);
        }
    }, [isPlanOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "notes") {
            setNotes(value);
            return;
        }
        if (name === "phone") {
            const onlyNums = value.replace(/\D/g, "");
            if (onlyNums.length <= 10) {
                setUserDetails({ ...userDetails, phone: onlyNums });
            }
            return;
        }
        setUserDetails({ ...userDetails, [name]: value });
    };

    const validateForm = () => {
        const newErrors: any = {};
        if (!userDetails.name.trim()) newErrors.name = "Name is required";
        if (!userDetails.company.trim()) newErrors.company = "Company is required";
        if (!userDetails.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email)) {
            newErrors.email = "Invalid email";
        }
        if (!userDetails.phone) {
            newErrors.phone = "Phone is required";
        } else if (userDetails.phone.length !== 10) {
            newErrors.phone = "Must be 10 digits";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        if (!validateForm()) return;
        if (selectedPlans.length === 0) return;

        setSubmitting(true);

        // Build summary for notes
        const planSummary = selectedPlans.map(p => `- ${p.stationName} (${p.inventoryName})`).join("\n");
        const fullNotes = `CART ITEMS:\n${planSummary}\n\nUSER NOTES:\n${notes}`;

        const payload = {
            name: userDetails.name,
            email: userDetails.email,
            phone: userDetails.phone,
            companyName: userDetails.company,
            notes: fullNotes,
            requirement: "advertise",
            adFormat: selectedPlans.map(p => p.inventoryName).join(", "),
            stations: selectedPlans.map(p => p.stationName)
        };

        try {
            const res = await fetch("/api/plan-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Server error");

            setSubmitted(true);
            clearPlan();
            setNotes("");

            // Auto close after 5 seconds if user doesn't close
            setTimeout(() => {
                setIsPlanOpen(false);
            }, 5000);
        } catch (err) {
            console.error(err);
            setToast({
                message: "Something went wrong ❌",
                type: "error"
            });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isPlanOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsPlanOpen(false)}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 z-50 h-[100dvh] w-full max-w-md bg-white shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 inline-flex items-center gap-2">
                                    Your Plan
                                    <span className="bg-red-100 text-red-700 text-xs py-0.5 px-2 rounded-full font-semibold">
                                        {selectedPlans.length} items
                                    </span>
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsPlanOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Middle body section */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                            {toast && (
                                <div className={`p-3 rounded-lg text-sm text-white flex justify-between items-center ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                                    {toast.message}
                                    <button onClick={() => setToast(null)}>×</button>
                                </div>
                            )}

                            {submitted ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                        <Check className="w-10 h-10 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Plan Requested!</h3>
                                        <p className="text-sm text-gray-600 mt-2 px-4">
                                            Thank you, {userDetails.name}. Our media planners will review your selection and contact you at <strong>{userDetails.email}</strong> with a detailed PDF quote.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsPlanOpen(false)}
                                        className="bg-gray-900 text-white px-8 py-2 rounded-lg text-sm font-medium hover:bg-black transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : selectedPlans.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Tag className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="font-medium text-gray-600">Your plan is empty.</p>
                                    <p className="text-sm">Browse inventory and add items to your plan.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items */}
                                    <div className="space-y-3">
                                        {selectedPlans.map((item) => (
                                            <div key={`${item.stationId}-${item.inventoryId}`} className="border border-gray-100 rounded-xl p-3 flex gap-3 shadow-sm bg-white relative group">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900 text-sm">{item.inventoryName}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <MapPin className="w-3 h-3" /> {item.stationName}
                                                    </div>
                                                    {item.price && (
                                                        <div className="text-xs font-medium text-gray-700 mt-2 bg-gray-50 px-2 py-1 inline-block rounded">
                                                            ₹{item.price.toLocaleString('en-IN')}/day
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeFromPlan(item.stationId, item.inventoryId)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors h-fit"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Lead Form */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Contact Details</h3>
                                        <form className="space-y-3" onSubmit={handleSubmit}>
                                            <div>
                                                <input name="name" value={userDetails.name} onChange={handleChange} placeholder="Name" className={`w-full border bg-white rounded-lg px-3 py-2 text-sm ${errors.name ? 'border-red-500' : 'border-gray-200'}`} />
                                                {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <input name="company" value={userDetails.company} onChange={handleChange} placeholder="Company" className={`w-full border bg-white rounded-lg px-3 py-2 text-sm ${errors.company ? 'border-red-500' : 'border-gray-200'}`} />
                                                {errors.company && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.company}</p>}
                                            </div>
                                            <div>
                                                <input name="email" value={userDetails.email} onChange={handleChange} placeholder="Email" className={`w-full border bg-white rounded-lg px-3 py-2 text-sm ${errors.email ? 'border-red-500' : 'border-gray-200'}`} />
                                                {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email}</p>}
                                            </div>
                                            <div>
                                                <input name="phone" value={userDetails.phone} onChange={handleChange} placeholder="Phone" className={`w-full border bg-white rounded-lg px-3 py-2 text-sm ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} />
                                                {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.phone}</p>}
                                            </div>
                                            <div>
                                                <textarea name="notes" value={notes} onChange={handleChange} placeholder="Any specific requirements?" className="w-full border bg-white border-gray-200 rounded-lg px-3 py-2 h-20 text-sm" />
                                            </div>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer (Submit) */}
                        {selectedPlans.length > 0 && !submitted && (
                            <div className="p-4 border-t border-gray-100 bg-white">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-white transition shadow-sm
                                        ${submitting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} 
                                    `}
                                >
                                    {submitting ? (
                                        <>
                                            <Spinner size="sm" color="white" />
                                            Requesting Plan...
                                        </>
                                    ) : (
                                        "Submit Plan Request"
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-500 mt-3">We will share detailed pricing over email.</p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
