import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Authentic shadcn/ui Sidebar Navigation with Shrink / Collapse functionality
 * Height perfectly synchronized with top navbar (h-20 / 80px)
 */
export function Sidebar({
  mobileOpen = false,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse,
}) {
  const dispatch = useDispatch();

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Accounts', path: '/accounts', icon: <TrendingUp className="w-5 h-5" /> },
    { name: 'Send Money', path: '/transfers', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Transactions', path: '/activity', icon: <RefreshCw className="w-5 h-5" /> },
    { name: 'Statistics', path: '/statistics', icon: <BarChart2 className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const renderNavContent = (isCollapsed) => (
    <div
      className={cn(
        'flex flex-col h-full bg-card border-r border-border select-none transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header - exactly h-20 (80px) to match top navbar */}
      <div
        className={cn(
          'h-20 flex items-center border-b border-border transition-all duration-300',
          isCollapsed ? 'px-3 justify-center' : 'px-6 justify-between'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 cursor-pointer',
            isCollapsed && 'justify-center'
          )}
          onClick={isCollapsed ? onToggleCollapse : undefined}
          title={isCollapsed ? 'Click to expand sidebar' : undefined}
        >
          <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0 hover:scale-105 transition-transform">
            <Landmark className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-bold text-foreground text-sm tracking-wider">
                FINCHECK
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                Banking
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button in header */}
        {!isCollapsed && onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        )}

        {/* Mobile Close Button */}
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
      <nav
        className={cn(
          'flex-1 py-5 space-y-1.5 overflow-y-auto',
          isCollapsed ? 'px-2' : 'px-3'
        )}
      >
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            onClick={() => mobileOpen && onCloseMobile && onCloseMobile()}
            title={isCollapsed ? item.name : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-md text-xs font-medium transition-all duration-200 group relative',
                isCollapsed
                  ? 'justify-center h-11 w-full'
                  : 'gap-3 px-3.5 py-2.5',
                isActive
                  ? 'bg-secondary text-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                !isCollapsed && !isActive && 'hover:translate-x-0.5'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'transition-transform duration-200 shrink-0',
                    !isCollapsed && 'group-hover:scale-110',
                    isCollapsed && 'group-hover:scale-115',
                    isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {item.icon}
                </span>

                {!isCollapsed && <span>{item.name}</span>}

                {/* Active Indicator */}
                {isActive && (
                  isCollapsed ? (
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section: Settings, Log-out, and Toggle */}
      <div
        className={cn(
          'border-t border-border space-y-1.5 transition-all',
          isCollapsed ? 'p-2' : 'p-3'
        )}
      >
        <NavLink
          to="/settings"
          onClick={() => mobileOpen && onCloseMobile && onCloseMobile()}
          title={isCollapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center rounded-md text-xs font-medium transition-all duration-200 group',
              isCollapsed
                ? 'justify-center h-10 w-full'
                : 'gap-3 px-3.5 py-2.5',
              isActive
                ? 'bg-secondary text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
              !isCollapsed && !isActive && 'hover:translate-x-0.5'
            )
          }
        >
          <Settings className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-foreground transition-transform duration-200 group-hover:rotate-45" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>

        <Button
          variant="ghost"
          onClick={handleLogout}
          title={isCollapsed ? 'Log out' : undefined}
          className={cn(
            'w-full h-10 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors',
            isCollapsed
              ? 'justify-center px-0'
              : 'justify-start gap-3 px-3.5'
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Log out</span>}
        </Button>

        {/* Expand / Collapse Button (at bottom of sidebar) */}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'hidden lg:flex w-full h-10 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors border-t border-border/50 pt-2',
              isCollapsed
                ? 'justify-center px-0'
                : 'justify-between px-3.5'
            )}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-foreground" />
            ) : (
              <>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Collapse</span>
                <PanelLeftClose className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block h-screen sticky top-0 shrink-0 z-30 transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {renderNavContent(collapsed)}
      </aside>

      {/* Mobile Drawer (Always full width for easy touch navigation) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {renderNavContent(false)}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
