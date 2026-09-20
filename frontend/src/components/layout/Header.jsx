import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  Calendar,
  Search,
  Bell,
  ChevronDown,
  Plus,
  Sun,
  Moon,
  LogOut,
  QrCode,
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  setCreateAccountModalOpen,
  setReceiveQrModalOpen,
  toggleDarkMode,
} from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';

/**
 * Authentic shadcn/ui Dashboard Top Navbar
 * Increased height, enhanced spacing, and precise optical alignment.
 */
export function Header({ onToggleMobileMenu }) {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const [searchQuery, setSearchQuery] = useState('');

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const displayName = user?.name || 'Customer';

  return (
    <header className="h-20 px-6 sm:px-8 lg:px-10 bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-20 flex items-center justify-between transition-colors shadow-2xs">
      {/* Left: Mobile hamburger + User Greeting */}
      <div className="flex items-center gap-3.5 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          className="lg:hidden h-10 w-10 text-muted-foreground"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex flex-col min-w-0 justify-center">
          <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight tracking-tight truncate">
            Hi, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight mt-0.5 hidden sm:block">
            Welcome back to your financial command center
          </p>
        </div>
      </div>

      {/* Right: Search, Date, Actions & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
        {/* Date Badge */}
        <div className="hidden xl:flex items-center gap-2 h-10 px-3.5 bg-secondary/60 border border-border/80 rounded-md text-xs font-medium text-muted-foreground select-none shadow-2xs">
          <Calendar className="w-4 h-4" />
          <span>{currentDateFormatted}</span>
        </div>

        {/* Spacious shadcn Search Input */}
        <div className="hidden sm:flex items-center relative w-56 lg:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search accounts, transfers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full pl-9 pr-12 py-2 bg-background border border-solid border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground hover:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring shadow-2xs transition-all duration-200"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Action: My QR Trigger */}
        <Button
          variant="outline"
          size="default"
          onClick={() => dispatch(setReceiveQrModalOpen(true))}
          className="hidden md:inline-flex h-10 px-3.5 text-xs sm:text-sm gap-2 font-medium hover-lift"
          title="Show My UPI QR Code"
        >
          <QrCode className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          <span>My QR</span>
        </Button>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-md text-muted-foreground hover:text-foreground transition-transform duration-200 active:scale-95"
          title="Notifications"
        >
          <Bell className="w-4 h-4 hover:animate-bounce" />
          <span className="w-2 h-2 rounded-full bg-destructive absolute top-2.5 right-2.5 ring-2 ring-background animate-pulse" />
        </Button>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleDarkMode())}
          className="h-10 w-10 rounded-md text-muted-foreground hover:text-foreground transition-transform duration-200 active:scale-95"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground transition-transform duration-300 hover:-rotate-12" />
          )}
        </Button>

        {/* User Profile & Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 h-11 px-2 sm:px-3 rounded-md border border-border/60 hover:bg-secondary/70 hover:border-border transition-all select-none"
            >
              {authLoading && !user ? (
                <Skeleton className="w-8 h-8 rounded-full" />
              ) : (
                <Avatar name={displayName} size="sm" />
              )}
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  Account Holder
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden lg:inline" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 mt-1">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => dispatch(setCreateAccountModalOpen(true))}
              className="gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Open New Account</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => dispatch(logoutUser())}
              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Header;
