import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="hidden md:block bg-dark-green text-white relative overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-cta to-transparent" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 right-20 w-64 h-64 bg-cta/5 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="CivicTree" className="h-6 w-auto" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-cta">CivicTree</h3>
            </div>
            <p className="font-sans text-sm text-white/80">
              Ghana's trusted exam voucher platform
            </p>
          </div>
          <div>
            <h4 className="font-heading font-bold text-lg text-cta mb-6">Products</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/pricing" className="font-sans text-white/80 hover:text-cta transition-colors text-sm">
                  BECE Voucher
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="font-sans text-white/80 hover:text-cta transition-colors text-sm">
                  WASSCE Voucher
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="font-sans text-white/80 hover:text-cta transition-colors text-sm">
                  NOVDEC Voucher
                </Link>
              </li>
              <li>
                <Link to="/timetable" className="font-sans text-white/80 hover:text-cta transition-colors text-sm">
                  Timetable
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-bold text-lg text-cta mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="font-sans text-white/80 hover:text-cta transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="font-sans text-white/80 hover:text-cta transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="font-sans text-white/80 hover:text-cta transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="font-sans text-white/80 hover:text-cta transition-colors text-sm">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-bold text-lg text-cta mb-6">Check Results</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://ghana.waecdirect.org/" target="_blank" rel="noopener noreferrer" className="font-sans text-white/80 hover:text-cta transition-colors text-sm">
                  WASSCE / NOVDEC Portal
                </a>
              </li>
              <li>
                <a href="https://eresults.waecgh.org/" target="_blank" rel="noopener noreferrer" className="font-sans text-white/80 hover:text-cta transition-colors text-sm">
                  BECE Portal
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-bold text-lg text-cta mb-6">Connect</h4>
            <div className="space-y-3">
              <a
                href="https://www.tiktok.com/@civicminded_commentary?_r=1&_t=ZP-96oSityYSSM"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/80 hover:text-cta transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.15z" />
                </svg>
                TikTok
              </a>
              <p className="font-sans text-white/60 text-sm">Email: gyasireindorf42@gmail.com</p>
              <p className="font-sans text-white/60 text-sm">Phone: 0556069880</p>
            </div>
          </div>
        </div>
        <div className="border-t border-cta/20 pt-8 text-center">
          <p className="font-sans text-sm text-white/60">
            &copy; 2026 CivicTree | All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};
