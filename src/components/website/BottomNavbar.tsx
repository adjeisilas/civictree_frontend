import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Tag, ShoppingCart, Calendar, MoreHorizontal } from 'lucide-react';
import { MobileMoreMenu } from './MobileMoreMenu';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Pricing', href: '/pricing', icon: Tag },
  { label: 'Buy', href: '/buy-voucher', icon: ShoppingCart, isCta: true },
  { label: 'Time Table', href: '/timetable', icon: Calendar },
  { label: 'More', icon: MoreHorizontal, isMore: true },
];

export const BottomNavbar = () => {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMorePageActive =
    location.pathname === '/contact' || location.pathname === '/disclaimer';

  if (location.pathname === '/buy-voucher') return null;

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
        <div className="flex items-center justify-around h-20 px-2">
          {navItems.map((item) => {
            const isActive = item.href && location.pathname === item.href;

            if (item.isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(true)}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 min-w-0 flex-1 ${
                    isMorePageActive ? 'text-primary' : 'text-text-secondary'
                  }`}
                >
                  <MoreHorizontal size={24} />
                  <span className="text-[10px] font-sans font-medium">More</span>
                </button>
              );
            }

            if (item.isCta) {
              return (
                <Link
                  key={item.href}
                  to={item.href!}
                  className="flex flex-col items-center justify-center gap-0.5 py-1 px-2 min-w-0 flex-1"
                >
                  <div className="w-14 h-14 -mt-7 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
                    <ShoppingCart size={26} className="text-white" />
                  </div>
                  <span className="text-[10px] font-sans font-semibold text-primary mt-0.5">
                    Buy
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href!}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 min-w-0 flex-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                <item.icon size={24} />
                <span className="text-[10px] font-sans font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <MobileMoreMenu isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
};
