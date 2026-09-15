import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreateAccountModal } from '../banking/CreateAccountModal';
import { TransferModal } from '../banking/TransferModal';
import { ToastContainer } from '../common/ToastContainer';

/**
 * Main Banking Shell Layout
 */
export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Simple, human-friendly page titles
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/accounts':
        return 'My Accounts';
      case '/transfers':
        return 'Send Money';
      case '/activity':
        return 'Activity';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row antialiased transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          title={getPageTitle(location.pathname)}
          onToggleMobileMenu={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CreateAccountModal />
      <TransferModal />
      <ToastContainer />
    </div>
  );
}

export default AppLayout;
