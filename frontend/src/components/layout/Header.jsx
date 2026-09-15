import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Plus, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { setCreateAccountModalOpen, setTransferModalOpen, toggleDarkMode } from '../../store/slices/uiSlice';
import { setActiveAccount } from '../../store/slices/accountSlice';
import { maskAccountNumber } from '../../utils/formatters';

/**
 * Top Application Header Component
 */
export function Header({ onToggleMobileMenu, title = 'Dashboard' }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { accounts, activeAccountId } = useSelector((state) => state.accounts);
  const { darkMode } = useSelector((state) => state.ui);

  return (
    <header className="h-16 px-4 sm:px-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between">
      {/* Left: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</span>
          <span className="text-xs text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-mono">
            Hi, {user?.name?.split(' ')[0] || 'there'}
          </span>
        </div>
      </div>

      {/* Right: Account Switcher + Actions + Dark Mode Toggle + User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Account Selector Pill */}
        {accounts.length > 0 && (
          <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 dark:text-slate-500 mr-1.5 uppercase font-mono text-[10px]">
              Account:
            </span>
            <select
              value={activeAccountId || ''}
              onChange={(e) => dispatch(setActiveAccount(e.target.value))}
              className="bg-transparent font-mono font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id} className="dark:bg-slate-800 dark:text-slate-200">
                  {maskAccountNumber(acc._id)} ({acc.currency || 'INR'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action: Open Account */}
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => dispatch(setCreateAccountModalOpen(true))}
          className="hidden sm:inline-flex"
        >
          New Account
        </Button>

        {/* Action: Send Money */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          onClick={() => dispatch(setTransferModalOpen(true))}
        >
          Send Money
        </Button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => dispatch(toggleDarkMode())}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Avatar */}
        <Avatar name={user?.name || 'User'} size="sm" status="online" />
      </div>
    </header>
  );
}

export default Header;
