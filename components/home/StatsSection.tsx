"use client";
import Counter from "@/components/Counter";

export default function StatsSection() {
    return (
        <section className="max-w-7xl mx-auto px-6 mt-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                    <Counter value={5} suffix="M+" className="text-4xl font-bold text-red-600" />
                    <div className="text-gray-800 font-medium mt-1">Daily Riders</div>
                </div>
                <div>
                    <Counter value={200} suffix="+" className="text-4xl font-bold text-red-600" />
                    <div className="text-gray-800 font-medium mt-1">Stations</div>
                </div>
                <div>
                    <Counter value={25} suffix=" min" className="text-4xl font-bold text-red-600" />
                    <div className="text-gray-800 font-medium mt-1">
                        Average Dwell Time
                    </div>
                </div>
                <div>
                    <Counter value={390} suffix="+ km" className="text-4xl font-bold text-red-600" />
                    <div className="text-gray-800 font-medium mt-1">
                        India&apos;s Largest Metro Network
                    </div>
                </div>
            </div>
        </section>
    );
}
