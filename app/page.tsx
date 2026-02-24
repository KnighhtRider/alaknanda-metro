import Link from "next/link";
import { Briefcase, Settings, ShieldCheck, Users } from "lucide-react";
import StatsSection from "@/components/home/StatsSection";
import FeaturedStationsSection from "@/components/home/FeaturedStationsSection";

export default async function HomePage() {
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
                Own Attention Where Delhi Moves
              </h1>
              <p className="mt-3 text-lg md:text-xl opacity-90">
                Explore branding across stations, concourses, and transit corridors.
                Shortlist locations and receive a planning deck from our team.
              </p>
              <div className="mt-6 flex gap-3 items-center">
                <Link
                  href="/catalogue"
                  className="bg-red-600 text-white px-5 py-3 rounded-lg font-medium"
                >
                  Explore Stations
                </Link>
                <Link
                  href="/contact"
                  className="border border-white text-white px-5 py-3 rounded-lg font-medium"
                >
                  Consult our Media Partner
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Delhi Metro Advertising Benefits */}
        <StatsSection />

        <div className="max-w-7xl mx-auto mt-8 border-t border-gray-200 shadow-sm"></div>

        {/* Featured Stations */}
        <FeaturedStationsSection />


        {/* Why Us */}
        <section className="max-w-7xl mx-auto px-6 mt-12">
          <h3 className="text-center text-2xl font-semibold mb-8">
            Execution You Can Rely On
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-sm p-6 text-center h-full">
              <Briefcase className="mx-auto text-red-600 mb-3" size={28} />
              <h4 className="font-semibold text-gray-900 mb-2">
                4 Decades of Experience
              </h4>
              <p className="text-sm text-gray-600">
                Over 40 years of excellence in advertising.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-sm p-6 text-center h-full">
              <Settings className="mx-auto text-red-600 mb-3" size={28} />
              <h4 className="font-semibold text-gray-900 mb-2">
                End-to-End Execution, In-House
              </h4>
              <p className="text-sm text-gray-600">
                From design adaptation to fabrication and installation.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-sm p-6 text-center h-full">
              <ShieldCheck className="mx-auto text-red-600 mb-3" size={28} />
              <h4 className="font-semibold text-gray-900 mb-2">
                Empanelled & Process-Ready
              </h4>
              <p className="text-sm text-gray-600">
                Aligned with transit safety, approvals, and compliance workflows.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl shadow-sm p-6 text-center h-full">
              <Users className="mx-auto text-red-600 mb-3" size={28} />
              <h4 className="font-semibold text-gray-900 mb-2">
                Single-Point Campaign Management
              </h4>
              <p className="text-sm text-gray-600">
                One coordinated team from planning to on-ground delivery.
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
                Consult Our Media Planners
              </Link>
              <Link
                href="/catalogue"
                className="border border-white px-5 py-3 rounded-lg font-medium hover:bg-white hover:text-red-600 transition"
              >
                Explore Stations
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
