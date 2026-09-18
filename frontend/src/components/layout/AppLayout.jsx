import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreateAccountModal } from '../banking/CreateAccountModal';
import { TransferModal } from '../banking/TransferModal';
import { DepositModal } from '../banking/DepositModal';
import { QrScannerModal } from '../banking/QrScannerModal';
import { ReceiveQrModal } from '../banking/ReceiveQrModal';
import { ToastContainer } from '../common/ToastContainer';

/**
 * Modern Fincheck App Layout Shell
 */
export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F5FA] dark:bg-[#0C101C] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row antialiased transition-colors duration-200 selection:bg-blue-500 selection:text-white">
      {/* Left Navigation Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onToggleMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          <Outlet />
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
