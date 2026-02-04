export default function Footer() {
    return (
        <footer className="mt-10 text-sm text-gray-600 max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>© AAL — All rights reserved</div>
                <div className="flex items-center gap-3">
                    <a href="#" className="hover:underline">Privacy</a>
                    <a href="#" className="hover:underline">Terms</a>
                </div>
            </div>
        </footer>
    )
}