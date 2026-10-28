import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-between font-sans">
      {/* Basic Nav */}
      <header className="py-6 px-8 max-w-7xl mx-auto w-full flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="CivicTree Logo" className="w-8 h-8 object-contain" />
          <span className="font-heading font-bold text-lg text-primary tracking-wider">CivicTree</span>
        </div>
        <Link
          to="/admin/login"
          className="text-xs font-semibold text-white bg-primary hover:bg-secondary px-4 py-2 rounded-xl transition-all shadow"
        >
          Admin Portal
        </Link>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto w-full text-center px-6 py-20 my-auto flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-primary leading-tight">
          Purchase Exam Checker <span className="text-secondary">Vouchers</span> Easily
        </h1>
        <p className="text-gray-500 max-w-2xl text-sm sm:text-base mt-6 leading-relaxed">
          Instantly buy WASSCE/NOVDEC, BECE and CTVET/NABTEX checker pins online. Safe transactions via Mobile Money or Cards, with immediate SMS delivery.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button className="px-8 py-3.5 bg-accent hover:bg-[#dfba60] text-primary font-sans font-bold rounded-xl shadow-md transition-all cursor-pointer">
            Buy Voucher Now
          </button>
          <Link
            to="/admin/login"
            className="px-8 py-3.5 bg-white border border-gray-200 text-primary hover:bg-gray-50 font-sans font-bold rounded-xl shadow-sm transition-all text-center flex items-center justify-center"
          >
            Access Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
        &copy; {new Date().getFullYear()} CivicTree Enterprise. All rights reserved.
      </footer>
    </div>
  )
}
