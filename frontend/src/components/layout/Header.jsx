import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  Calendar,
  Search,
  Bell,
  ChevronDown,
  Plus,
  ArrowUpRight,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  QrCode,
  ScanLine,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Skeleton } from '../common/Skeleton';
import {
  setCreateAccountModalOpen,
  setTransferModalOpen,
  setQrScannerModalOpen,
  setReceiveQrModalOpen,
  toggleDarkMode,
} from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';

/**
 * Modern Fincheck Header Component
 * 
 * Features:
 * - Left: "Hi [User Name], Welcome back!" greeting
 * - Right: Date pill badge, search input pill, notification bell, and user avatar dropdown
 */
export function Header({ onToggleMobileMenu }) {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Formatted date matching Fincheck reference (e.g. "Jul 19, 2022" or today's date)
  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const displayName = user?.name || 'Adaline Horton';

  return (
    <header className="h-18 px-4 sm:px-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger + User Greeting */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate">
              Hi {displayName},
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            Welcome back!
          </span>
        </div>
      </div>

      {/* Right: Date Pill + Search Input + Notification Bell + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date Pill Badge (Hidden on small mobile) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 select-none">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDateFormatted}</span>
        </div>

        {/* Search Bar Pill (Hidden on mobile) */}
        <div className="hidden sm:flex items-center relative w-48 lg:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Type to search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>


        {/* Action: My QR Trigger */}
        <button
          type="button"
          onClick={() => dispatch(setReceiveQrModalOpen(true))}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors select-none cursor-pointer"
          title="Show My UPI QR Code"
        >
          <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>My QR</span>
        </button>

        {/* Action: Scan & Pay QR Trigger */}
        <button
          type="button"
          onClick={() => dispatch(setQrScannerModalOpen(true))}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl border border-blue-100 dark:border-blue-900/40 transition-colors select-none cursor-pointer"
          title="Scan UPI QR Code"
        >
          <ScanLine className="w-3.5 h-3.5" />
          <span>Scan & Pay</span>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {/* Notification Alert Dot */}
          <span className="w-2 h-2 rounded-full bg-[#f472b6] absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => dispatch(toggleDarkMode())}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Profile & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 sm:pl-2 sm:pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
          >
            {authLoading && !user ? (
              <Skeleton variant="circular" className="w-8 h-8" />
            ) : (
              <Avatar name={displayName} size="sm" />
            )}
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden lg:inline truncate max-w-[120px]">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1.5 z-30 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block truncate">
                  {displayName}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {user?.email || 'adaline@fincheck.io'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  dispatch(setCreateAccountModalOpen(true));
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                <span>Open New Account</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  dispatch(logoutUser());
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
