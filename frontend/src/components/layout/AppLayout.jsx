import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreateAccountModal } from '../banking/CreateAccountModal';
import { TransferModal } from '../banking/TransferModal';
import { DepositModal } from '../banking/DepositModal';
import { QrScannerModal } from '../banking/QrScannerModal';
import { ReceiveQrModal } from '../banking/ReceiveQrModal';
import { ToastContainer } from '../common/ToastContainer';

/**
 * Modern Fincheck App Layout Shell with Page Transitions
 */
export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('fincheck_sidebar_collapsed') === 'true';
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('fincheck_sidebar_collapsed', String(next));
      return next;
    });
  };

  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row antialiased transition-colors duration-200 selection:bg-primary selection:text-primary-foreground">
      {/* Left Navigation Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          onToggleMobileMenu={() => setMobileOpen(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-8xl w-full mx-auto">
          <div key={location.pathname} className="animate-page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CreateAccountModal />
      <TransferModal />
      <DepositModal />
      <QrScannerModal />
      <ReceiveQrModal />
      <ToastContainer />
    </div>
  );
}

export default AppLayout;
