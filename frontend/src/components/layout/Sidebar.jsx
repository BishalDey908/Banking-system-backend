import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import { cn } from '../../utils/cn';

/**
 * Clean & Simple Banking Sidebar Navigation
 */
export function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Accounts', path: '/accounts', icon: <Landmark className="w-4 h-4" /> },
    { name: 'Send Money', path: '/transfers', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { name: 'Activity', path: '/activity', icon: <History className="w-4 h-4" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 w-64 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <span className="font-bold text-sm tracking-tighter text-emerald-400 dark:text-white">A</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight font-mono">
            AURA BANK
          </span>
        </div>

        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 sm:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => mobileOpen && onCloseMobile && onCloseMobile()}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Dark Mode Toggle Button */}
      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={() => dispatch(toggleDarkMode())}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-500" />
            )}
            <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {darkMode ? 'DARK' : 'LIGHT'}
          </span>
        </button>
      </div>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={user?.name || 'User'} size="md" status="online" />
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block truncate">
              {user?.name || 'My Account'}
            </span>
            <span className="text-[11px] text-slate-400 block truncate font-mono">
              {user?.email || 'user@aurabank.io'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Modal Drawer */}
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
