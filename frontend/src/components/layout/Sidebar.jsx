import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  TrendingUp,
  RefreshCw,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
  X,
  Landmark,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Authentic shadcn/ui Sidebar Navigation
 * Height perfectly synchronized with top navbar (h-20 / 80px)
 */
export function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const dispatch = useDispatch();

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Accounts', path: '/accounts', icon: <TrendingUp className="w-4 h-4" /> },
    { name: 'Send Money', path: '/transfers', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Transactions', path: '/activity', icon: <RefreshCw className="w-4 h-4" /> },
    { name: 'Statistics', path: '/statistics', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const navContent = (
    <div className="flex flex-col h-full bg-card border-r border-border w-64 select-none transition-colors">
      {/* Brand Header - exactly h-20 (80px) to match top navbar */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-sm tracking-wider">
              FINCHECK
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Banking
            </span>
          </div>
        </div>

        {mobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCloseMobile}
            className="text-muted-foreground hover:text-foreground lg:hidden h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            onClick={() => mobileOpen && onCloseMobile && onCloseMobile()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-secondary text-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:translate-x-0.5'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section: Settings & Log-out */}
      <div className="p-3 border-t border-border space-y-1.5">
        <NavLink
          to="/settings"
          onClick={() => mobileOpen && onCloseMobile && onCloseMobile()}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-all duration-200 group',
              isActive
                ? 'bg-secondary text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:translate-x-0.5'
            )
          }
        >
          <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform duration-200 group-hover:rotate-45" />
          <span>Settings</span>
        </NavLink>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-md text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
