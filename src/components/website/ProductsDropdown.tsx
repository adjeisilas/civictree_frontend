import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const products = [
  { label: 'BECE Voucher', href: '/pricing' },
  { label: 'WASSCE Voucher', href: '/pricing' },
  { label: 'NOVDEC Voucher', href: '/pricing' },
  { label: 'BECE/WASSCE Timetable', href: '/timetable' },
];

export const ProductsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 font-sans font-medium text-text-secondary hover:text-primary transition-colors"
      >
        Products
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-border overflow-hidden z-50"
          >
            {products.map((p) => (
              <Link
                key={p.href + p.label}
                to={p.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 font-sans text-sm text-text-primary hover:bg-bg-secondary hover:text-primary transition-colors"
              >
                {p.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
