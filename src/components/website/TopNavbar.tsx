import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductsDropdown } from './ProductsDropdown';
import { AffiliatesDropdown } from './AffiliatesDropdown';
import { Button } from './ui';

export const TopNavbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => location.pathname === href;

  return (
    <motion.nav
      className={`hidden md:flex fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-navbar border-b border-border' : 'bg-transparent'
      }`}
      initial={{ y: 0 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading font-bold text-2xl text-primary hover:text-primary-hover transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-gray-150">
              <img src="/logo.png" alt="CivicTree" className="h-6 w-auto object-contain" />
            </div>
            <span>CivicTree</span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              to="/"
              className={`font-sans font-medium transition-colors ${
                isActive('/') ? 'text-primary' : 'text-text-secondary hover:text-primary'
              }`}
            >
              Home
            </Link>
            <ProductsDropdown />
            <AffiliatesDropdown />
            <Link
              to="/contact"
              className={`font-sans font-medium transition-colors ${
                isActive('/contact') ? 'text-primary' : 'text-text-secondary hover:text-primary'
              }`}
            >
              Contact
            </Link>
            <Link
              to="/disclaimer"
              className={`font-sans font-medium transition-colors ${
                isActive('/disclaimer') ? 'text-primary' : 'text-text-secondary hover:text-primary'
              }`}
            >
              Disclaimer
            </Link>
          </div>

          <Link to="/buy-voucher">
            <Button variant="cta" size="sm">
              Buy Voucher
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};
