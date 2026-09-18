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
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import { cn } from '../../utils/cn';

/**
 * Modern Fincheck Sidebar Navigation
 * 
 * Features:
 * - FINCHECK brand logo with gradient swirl
 * - Active blue vertical accent pill indicator on left edge
 * - Clean, spacious navigation links
 * - Bottom Settings & Log-out controls
 */
export function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.ui);

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
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 w-60 select-none transition-colors">
      {/* Brand Header */}
      <div className="h-18 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Fincheck Swirl Gradient Logo Icon */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38bdf8] via-[#a855f7] to-[#f472b6] p-[2px] flex items-center justify-center shadow-xs">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent border-r-[#38bdf8] border-b-[#a855f7] border-l-[#f472b6] rotate-45" />
            </div>
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-wider font-sans">
            FINCHECK
          </span>
        </div>

        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            onClick={() => mobileOpen && onCloseMobile && onCloseMobile()}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all group',
                isActive
                  ? 'text-slate-900 dark:text-white bg-slate-50/80 dark:bg-slate-800/60'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Left Active Blue Indicator Pill */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#3b82f6] rounded-r-md" />
                )}

                <span
                  className={cn(
                    'transition-colors',
                    isActive
                      ? 'text-[#3b82f6]'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section: Settings & Log-out */}
      <div className="px-3 pb-6 space-y-1 border-t border-slate-50 dark:border-slate-800/80 pt-4">
        <NavLink
          to="/settings"
          onClick={() => mobileOpen && onCloseMobile && onCloseMobile()}
          className={({ isActive }) =>
            cn(
              'relative flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all group',
              isActive
                ? 'text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#3b82f6] rounded-r-md" />
              )}
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
              <span>Settings</span>
            </>
          )}
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors group"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
          <span>Log-out</span>
        </button>

        {/* Clean Theme Toggle */}
        <div className="pt-2 px-1">
          <button
            type="button"
            onClick={() => dispatch(toggleDarkMode())}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {darkMode ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
            </div>
          </button>
        </div>
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
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
