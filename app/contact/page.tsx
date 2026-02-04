"use client";

import { useEffect, useMemo, useState } from "react";

export default function ContactUsV2() {
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

  // Company name used in both flows (required everywhere)
  const [companyName, setCompanyName] = useState("");
  const [mediaKitFile, setMediaKitFile] = useState<File | null>(null);

  // Contact
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [stationOptions, setStationOptions] = useState<string[]>([]);
  const [adFormatOptions, setAdFormatOptions] = useState<string[]>([]);
  const [stationQuery, setStationQuery] = useState("");
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  useEffect(() => {
    // fetch stations
    fetch("/api/stations")
      .then((res) => res.json())
      .then((data) => {
        // assuming { id, name }
        setStationOptions(data.map((s: any) => s.name));
      })
      .catch(console.error);

    // fetch ad formats (products)
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setAdFormatOptions(data.map((p: any) => p.name));
      })
      .catch(console.error);
  }, []);

  const BUDGET_OPTIONS = [
    { value: "u1", label: "Below ₹1 Lakhs" },
    { value: "1to5", label: "₹1-5 Lakhs" },
    { value: "5to25", label: "₹5-25 Lakhs" },
    { value: ">25", label: "₹25 Lakhs+" },
    { value: "tbd", label: "Yet to Decide" },
  ];

  const CTA_TEXT = useMemo(() => {
    if (requirement === "inventory") return "List Inventory";
    if (familiarity === "know") return "Request Quote";
    if (familiarity === "help") return "Get Free Consultation";
    return "Submit";
  }, [requirement, familiarity]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!requirement) return alert("Please select a requirement.");
    if (requirement !== "inventory" && !buyerType)
      return alert("Please select Brand or Agency.");

    // ---------------- INVENTORY FLOW ----------------
    if (requirement === "inventory") {
      if (!companyName) return alert("Please enter your Company Name.");
      if (!name || !phone || !email)
        return alert("Please fill your contact details (Name, Phone, Email).");

      const payload = {
        requirement,
        companyName,
        buyerType,
        familiarity: null,
        stations: null,
        adFormat: null,
        budget: null,
        goal: null,
        audience: null,
        timeline: null,
        name,
        phone,
        email,
        notes: null,
        mediaKit: mediaKitFile
          ? {
              name: mediaKitFile.name,
              size: mediaKitFile.size,
              type: mediaKitFile.type,
            }
          : null,
      };

      const res = await fetch("/api/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Something went wrong. Please try again.");
        return;
      }

      alert("Thanks! We've received your inventory submission.");
      return;
    }

    // ---------------- ADVERTISING FLOW ----------------
    if (!familiarity) return alert("Please select your media familiarity.");

    if (familiarity === "know") {
      if (!adFormat || !budget)
        return alert("Please select Ad Format and Campaign Budget.");
      if (stations.length === 0)
        return alert("Please add at least one station.");
    }

    if (familiarity === "help") {
      if (!goal || !audience || !timeline)
        return alert("Please fill Goal, Audience and Timeline.");
    }

    if (!companyName) return alert("Please enter your Company Name.");
    if (!name || !phone || !email)
      return alert("Please fill your contact details (Name, Phone, Email).");

    const payload = {
      requirement,
      buyerType,
      companyName,
      familiarity,
      stations: familiarity === "know" ? stations : null,
      adFormat: familiarity === "know" ? adFormat : null,
      budget: familiarity === "know" ? budget : null,
      goal: familiarity === "help" ? goal : null,
      audience: familiarity === "help" ? audience : null,
      timeline: familiarity === "help" ? timeline : null,
      name,
      phone,
      email,
      notes,
    };

    const res = await fetch("/api/contact-us", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Something went wrong. Please try again.");
      return;
    }

    alert("Thanks! We've received your request.");
  }

  // Placeholder contact info — replace with real details
  const AD_PHONE = "+91 98765 43210";
  const AD_EMAIL = "advertising@aal.com";
  const ADDRESS_LINE = "AAL Office, 123 Media Street, Delhi";
  const MAP_QUERY =
    "https://www.google.com/maps/search/?api=1&query=AAL+Office+Delhi";
  const AD_PHONE_CLEAN = AD_PHONE.split(" ").join("");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Form (2 cols on lg) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-2">Write To Us</h2>
              <p className="text-sm text-gray-500 mb-4">
                Fill this form and we&apos;ll reach out within 24 hours. No
                obligations.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <select
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Requirement
                  </option>
                  <option value="advertise">
                    I want to advertise in Delhi Metro
                  </option>
                  <option value="inventory">
                    I want to list my media inventory
                  </option>
                </select>

                {requirement !== "inventory" && (
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="buyer"
                        checked={buyerType === "brand"}
                        onChange={() => setBuyerType("brand")}
                        required
                      />
                      <span>Brand / Advertiser</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="buyer"
                        checked={buyerType === "agency"}
                        onChange={() => setBuyerType("agency")}
                      />
                      <span>Agency</span>
                    </label>
                  </div>
                )}

                {/* inventory flow */}
                {requirement === "inventory" ? (
                  <>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />

                    <input
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                      placeholder="Your Name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <input
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                      placeholder="Your Phone *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <input
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                      type="email"
                      placeholder="Your Email *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    <div className="border border-dashed border-gray-300 rounded-lg p-3">
                      <label className="block text-sm text-gray-700">
                        Upload Media Kit (PDF / PPT / CSV / XLS)
                      </label>
                      <input
                        type="file"
                        className="mt-2 w-full"
                        accept=".pdf,.ppt,.pptx,.csv,.xls,.xlsx"
                        onChange={(e) =>
                          setMediaKitFile(
                            e.target.files && e.target.files[0]
                              ? e.target.files[0]
                              : null
                          )
                        }
                      />
                      {mediaKitFile && (
                        <p className="mt-2 text-xs text-gray-500">
                          Selected: {mediaKitFile.name} (
                          {Math.ceil(mediaKitFile.size / 1024)} KB)
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      We respond within 24 hours. No obligations.
                    </p>

                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg">
                      {CTA_TEXT}
                    </button>
                  </>
                ) : (
                  // Advertise / Advisory flow
                  <>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="fam"
                          checked={familiarity === "know"}
                          onChange={() => setFamiliarity("know")}
                          required
                        />
                        <span>I’m aware of the Media</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="fam"
                          checked={familiarity === "help"}
                          onChange={() => setFamiliarity("help")}
                        />
                        <span>I’m not aware of the Media</span>
                      </label>
                    </div>

                    {familiarity === "know" && (
                      <>
                        <div className="relative">
                          <input
                            value={stationQuery}
                            onChange={(e) => {
                              setStationQuery(e.target.value);
                              setShowStationDropdown(true);
                            }}
                            onFocus={() => setShowStationDropdown(true)}
                            placeholder="Type station name"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                          />

                          {showStationDropdown && stationQuery && (
                            <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow max-h-48 overflow-auto">
                              {stationOptions
                                .filter(
                                  (s) =>
                                    s
                                      .toLowerCase()
                                      .includes(stationQuery.toLowerCase()) &&
                                    !stations.includes(s)
                                )
                                .map((s) => (
                                  <div
                                    key={s}
                                    onClick={() => {
                                      setStations([...stations, s]);
                                      setStationQuery("");
                                      setShowStationDropdown(false);
                                    }}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                                  >
                                    {s}
                                  </div>
                                ))}

                              {stationOptions.filter((s) =>
                                s
                                  .toLowerCase()
                                  .includes(stationQuery.toLowerCase())
                              ).length === 0 && (
                                <div className="px-4 py-2 text-sm text-gray-400">
                                  No matching stations
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Ad Format
                          </label>
                          <select
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                            value={adFormat}
                            onChange={(e) => setAdFormat(e.target.value)}
                            required
                          >
                            <option value="" disabled>
                              Select Ad Format *
                            </option>
                            {adFormatOptions.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Campaign Budget
                          </label>
                          <select
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            required
                          >
                            <option value="" disabled>
                              Campaign Budget *
                            </option>
                            {BUDGET_OPTIONS.map((b) => (
                              <option key={b.value} value={b.value}>
                                {b.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {familiarity === "help" && (
                      <>
                        <input
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                          placeholder="Campaign Goal (e.g., Launch, Awareness, Performance)"
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          required
                        />
                        <input
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                          placeholder="Target Audience (e.g., Commuters, SEC A, Students)"
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          required
                        />
                        <select
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                          value={timeline}
                          onChange={(e) => setTimeline(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Campaign Timeline
                          </option>
                          <option value="asap">ASAP</option>
                          <option value="2w">Within 2 weeks</option>
                          <option value="tm">This month</option>
                          <option value="n1-2m">Next 1–2 months</option>
                        </select>
                      </>
                    )}

                    {/* Company name required just before contact */}
                    <input
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                      placeholder="Company Name *"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />

                    {/* Contact fields */}
                    <input
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                      placeholder="Your Name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <input
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                      placeholder="Your Phone *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <input
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5"
                      type="email"
                      placeholder="Your Email *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <textarea
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 h-28"
                      placeholder="Additional Campaign Info (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />

                    <p className="text-xs text-gray-500">
                      We respond within 24 hours. No obligations.
                    </p>

                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg">
                      {CTA_TEXT}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="lg:col-span-1">
            <div className="space-y-4 sticky top-24">
              {/* Advertising phone — prominent */}
              <div
                className={`rounded-lg p-5 shadow text-white ${
                  requirement === "advertise" ? "bg-green-600" : "bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs">Advertising Hotline</div>
                    <a
                      href={`tel:${AD_PHONE_CLEAN}`}
                      className="text-2xl font-bold block mt-1"
                    >
                      {AD_PHONE}
                    </a>
                    <div className="text-xs mt-1">Mon–Sat 10am–6pm</div>
                  </div>
                  <div className="text-2xl">📞</div>
                </div>
              </div>

              {/* Email card */}
              <div className="rounded-lg p-4 shadow bg-white">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  📧 <span>Email</span>
                </div>
                <a
                  href={`mailto:${AD_EMAIL}`}
                  className="block font-medium mt-1"
                >
                  {AD_EMAIL}
                </a>
              </div>

              {/* Address card */}
              <div className="rounded-lg p-4 shadow bg-white">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  📍 <span>Address</span>
                </div>
                <div className="text-sm font-medium mt-1">{ADDRESS_LINE}</div>
                <a
                  href={MAP_QUERY}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 mt-2 inline-block"
                >
                  View on map
                </a>
              </div>

              {/* Microcopy / trust */}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* Self-tests */
try {
  console.assert(true, "module loaded");
} catch (e) {
  console.warn(e);
}
