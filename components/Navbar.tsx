'use client'

export default function App() {
  const navigateToHome = () => {
    window.location.href = '/';
  }
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer" onClick={navigateToHome}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">AAL</div>
            <span className="font-semibold text-lg">Delhi Metro Advertising</span>
          </div>
        </div>

        <div className="flex-1 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                aria-label="Type a station, metro line, or ad format to explore options instantly."
                placeholder="Type a station, metro line, or ad format to explore options instantly."
                className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 pl-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="/contact" className="inline-block bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-sm">Contact Us</a>
        </div>
      </div>
    </header>
  );
}
