import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Landmark,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Zap,
  CheckCircle2,
  Wallet,
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
  Lock,
  Menu,
  X,
  Send,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import { cn } from '@/lib/utils';

/**
 * Modern Fincheck Banking Landing Page
 * Features fixed, high-contrast, fully functional shadcn/ui buttons across all sections.
 */
export function LandingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index);
  };

  const faqs = [
    {
      question: 'How quickly can I open an account with Fincheck?',
      answer:
        'Account creation takes under 60 seconds. Simply sign up with your email, set a secure password, and you are instantly provisioned with a liquid bank account and your personal UPI ID with zero waiting period.',
    },
    {
      question: 'Are there any hidden fees or minimum balance requirements?',
      answer:
        'None. Fincheck operates on complete transparency. There are 0% transaction fees on peer-to-peer and UPI transfers, and no monthly maintenance charges or minimum balance penalties.',
    },
    {
      question: 'How does the ₹10,000 opening reserve work?',
      answer:
        'Every newly opened primary account is automatically credited with a ₹10,000 opening liquid reserve, allowing you to immediately test transfers, scan QR codes, and experience real-time ledger accounting.',
    },
    {
      question: 'How secure is the platform and double-entry ledger?',
      answer:
        'Fincheck employs AES-256 bank-grade encryption, time-based one-time password (TOTP) two-factor authentication, and an immutable double-entry ledger architecture where every transaction is audited with mathematical integrity.',
    },
    {
      question: 'Can I generate and scan real UPI QR codes?',
      answer:
        'Yes! Fincheck provides dynamic and static UPI QR generation compliant with NPCI standards, as well as a camera-based QR scanner to instantly send and receive funds.',
    },
  ];

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: 'Instant Zero-Fee UPI Transfers',
      description:
        'Send and receive funds in milliseconds using UPI IDs, bank account numbers, or QR codes with zero transaction fees.',
      tag: 'Real-time',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      title: 'Double-Entry Accounting Ledger',
      description:
        'Enterprise-grade ledger architecture ensures every debit has a matching credit. Full mathematical immutability and audit trails.',
      tag: 'Institutional',
    },
    {
      icon: <QrCode className="w-5 h-5 text-blue-500" />,
      title: 'Integrated UPI QR Scanner & Codes',
      description:
        'Generate custom UPI QR codes with pre-filled amounts or scan any standard UPI QR with your device camera in seconds.',
      tag: 'Omnichannel',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-indigo-500" />,
      title: 'Real-Time Financial Analytics',
      description:
        'Visual spending breakdowns, monthly cash flow charts, and income vs. expense donut visualizations keep you in full control.',
      tag: 'Insights',
    },
    {
      icon: <Wallet className="w-5 h-5 text-purple-500" />,
      title: 'Multi-Account Management',
      description:
        'Create and organize multiple savings, checking, or business accounts under a single login with segregated balances.',
      tag: 'Flexible',
    },
    {
      icon: <Lock className="w-5 h-5 text-rose-500" />,
      title: 'Two-Factor & Rate-Limit Security',
      description:
        'Multi-layer defense with 6-digit email OTP 2FA, rate-limiting guards, and encrypted session management for peace of mind.',
      tag: 'Bank-Grade',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans antialiased overflow-x-hidden">
      {/* 1. STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md transition-colors duration-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-base tracking-wider leading-none font-heading">
                FINCHECK
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                Digital Banking
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#security" className="hover:text-foreground transition-colors">
              Security
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleDarkMode())}
              className="h-10 w-10 rounded-md text-muted-foreground hover:text-foreground transition-transform duration-200 active:scale-95"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-muted-foreground transition-transform duration-300 hover:-rotate-12" />
              )}
            </Button>

            {isAuthenticated ? (
              <Button
                variant="default"
                onClick={() => navigate('/dashboard')}
                className="gap-2 h-10 px-4 text-xs font-medium hover-lift shadow-xs"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="hidden sm:inline-flex h-10 px-4 text-xs font-medium border-border"
                >
                  Sign In
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate('/register')}
                  className="gap-2 h-10 px-4 text-xs font-medium hover-lift shadow-xs"
                >
                  <span>Open Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </>
            )}

            {/* Mobile Menu Trigger Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-10 w-10 text-muted-foreground hover:text-foreground"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2.5 text-sm font-medium">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                How It Works
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Security
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                FAQ
              </a>
            </nav>

            <div className="pt-3 border-t border-border flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Button
                  variant="default"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full h-11 justify-center gap-2 text-xs font-semibold"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full h-11 justify-center text-xs font-medium"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/register');
                    }}
                    className="w-full h-11 justify-center gap-2 text-xs font-semibold"
                  >
                    <span>Open Free Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[350px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-secondary/60 text-foreground text-xs font-medium mb-6 animate-fade-in shadow-2xs hover:border-primary/40 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Fincheck Digital Banking 2.0 • Zero-Fee UPI & Live Ledger</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground font-heading max-w-4xl mx-auto leading-[1.1] animate-page-enter">
            Next-Generation Banking Built for <span className="underline decoration-primary/30 underline-offset-8">Modern Finance</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-page-enter animation-delay-75">
            Experience frictionless banking with instant zero-fee UPI transfers, an immutable double-entry ledger, and a ₹10,000 opening reserve upon sign-up.
          </p>

          {/* Fixed CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 animate-page-enter animation-delay-150">
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="w-full sm:w-auto h-12 px-8 text-sm font-semibold gap-2.5 shadow-sm hover-lift whitespace-nowrap inline-flex items-center justify-center"
            >
              <span className="whitespace-nowrap">{isAuthenticated ? 'Go to Dashboard' : 'Open Free Account in 60s'}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto h-12 px-7 text-sm font-medium gap-2 border-border hover:bg-accent whitespace-nowrap inline-flex items-center justify-center"
            >
              <span className="whitespace-nowrap">Sign In to Existing Account</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" />
            </Button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>₹10,000 Liquid Reserve</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>0% Transaction Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>AES-256 Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Instant QR Scanner</span>
            </div>
          </div>

          {/* 3. HERO INTERACTIVE MOCKUP PREVIEW */}
          <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto animate-scale-up animation-delay-225">
            <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 shadow-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm text-left">
              {/* Mockup Header Bar */}
              <div className="flex items-center justify-between pb-5 border-b border-border mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground hidden sm:inline ml-2">
                    fincheck.app/dashboard
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary text-[11px] font-mono text-muted-foreground border border-border">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ledger Status: Operational</span>
                </div>
              </div>

              {/* Mockup Grid Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left Card: Account Balance & Quick Send */}
                <div className="md:col-span-7 space-y-4">
                  <Card className="p-5 border-border bg-background/50">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Primary Liquid Account</span>
                      <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-muted border border-border">
                        Active UPI
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground mt-1">
                      ₹10,000.00
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                        +₹10,000.00
                      </span>
                      <span>opening reserve credited</span>
                    </div>

                    {/* Interactive Mock Quick Send Form */}
                    <div className="mt-5 pt-4 border-t border-border space-y-3">
                      <span className="text-xs font-semibold text-foreground block">
                        Quick Transfer
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value="alex@okaxis"
                          className="h-10 flex-1 px-3 bg-background border border-solid border-input rounded-md text-xs font-mono text-foreground focus:outline-none"
                        />
                        <input
                          type="text"
                          readOnly
                          value="₹500.00"
                          className="h-10 w-24 px-3 bg-background border border-solid border-input rounded-md text-xs font-mono text-foreground focus:outline-none text-right"
                        />
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate(isAuthenticated ? '/transfers' : '/register')}
                          className="h-10 px-3.5 gap-1.5 font-medium hover-lift"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Send</span>
                        </Button>
                      </div>

                      {/* Interactive Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-muted-foreground mr-1">Handles:</span>
                        {['@okhdfcbank', '@okicici', '@paytm'].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => navigate(isAuthenticated ? '/transfers' : '/register')}
                            className="px-2 py-0.5 rounded-md bg-muted hover:bg-primary/10 hover:text-primary border border-border text-[10px] font-mono text-foreground transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Right Card: Live Transaction Feed Mockup */}
                <div className="md:col-span-5 flex flex-col">
                  <Card className="p-5 border-border bg-background/50 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-foreground">
                          Recent Activity
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Live Feed
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border/60">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold">
                              ↓
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">Welcome Reserve</p>
                              <p className="text-[10px] text-muted-foreground">Double-Entry Credit</p>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            +₹10,000.00
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border/60">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-bold">
                              ↑
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">UPI Transfer to Alex</p>
                              <p className="text-[10px] text-muted-foreground">alex@okaxis</p>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-semibold text-foreground">
                            -₹500.00
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Audit Verification:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Balanced
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY STATS BANNER */}
      <section className="py-12 border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-bold font-mono text-foreground font-heading">
                ₹10,000
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Opening Liquid Reserve
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-bold font-mono text-foreground font-heading">
                0%
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                UPI & Transfer Fees
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-bold font-mono text-foreground font-heading">
                &lt; 1s
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Instant Settlement Speed
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-bold font-mono text-foreground font-heading">
                100%
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Double-Entry Audit Trail
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE FEATURES BENTO GRID */}
      <section id="features" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary font-mono">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-heading mt-2">
            Everything You Need for Effortless Banking
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            Built from the ground up with modern standards: high-speed transactions, impenetrable ledger guarantees, and intuitive design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => (
            <Card
              key={item.title}
              className="p-6 border-border bg-card hover-lift transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/80">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground tracking-tight font-heading mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Fixed Action Button on Card */}
              <Button
                variant="subtle"
                size="sm"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                className="mt-6 w-full justify-between text-xs font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all"
              >
                <span>Explore Feature</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS (3-STEP FLOW) */}
      <section id="how-it-works" className="py-20 bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary font-mono">
              Simple Onboarding
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-heading mt-2">
              Start Banking in 3 Simple Steps
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              No branch visits, no paperwork. Everything is digital and instantaneous.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-card p-6 rounded-2xl border border-border relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold font-mono text-sm flex items-center justify-center shadow-xs">
                1
              </div>
              <h3 className="text-base font-semibold text-foreground font-heading">
                Create Free Account
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Sign up with your email and basic details. Verify instantly with our secure OTP verification.
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold font-mono text-sm flex items-center justify-center shadow-xs">
                2
              </div>
              <h3 className="text-base font-semibold text-foreground font-heading">
                Get ₹10,000 Reserve
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your primary bank account is automatically funded with ₹10,000 to jumpstart your digital transactions.
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold font-mono text-sm flex items-center justify-center shadow-xs">
                3
              </div>
              <h3 className="text-base font-semibold text-foreground font-heading">
                Transact & Scan UPI
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Transfer instantly to any UPI ID, share your custom QR code, or scan codes with zero fees.
              </p>
            </div>
          </div>

          {/* Fixed CTA Button below steps */}
          <div className="mt-12 text-center">
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="h-12 px-8 text-sm font-semibold gap-2 shadow-sm hover-lift"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 7. SECURITY & ARCHITECTURE SPOTLIGHT */}
      <section id="security" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-secondary/50 p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Institutional Grade Security</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-heading">
                Mathematical Integrity at Every Step
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fincheck implements double-entry bookkeeping principles derived from institutional banking standards. Every transfer creates immutable dual debit/credit records, ensuring financial consistency with zero room for phantom balances.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">Double-Entry Ledger</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Automated debit/credit reconciliation</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">Two-Factor Authentication</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Mandatory 6-digit OTP verification</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">Rate Limiting Protection</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Automated lockout guards against brute force</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">End-to-End Encryption</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">AES-256 encrypted data in transit and rest</p>
                  </div>
                </div>
              </div>

              {/* Fixed Button in Security section */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/register')}
                  className="gap-2 text-xs font-medium border-border"
                >
                  <span>Open a Protected Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Card className="p-6 border-border bg-background shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-xs font-bold font-mono">LEDGER TRANSACTION #9842</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    VERIFIED
                  </span>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between p-2 rounded bg-muted/60">
                    <span className="text-muted-foreground">DR (Debit) Acc:</span>
                    <span className="font-semibold text-foreground">•••• c859</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/60">
                    <span className="text-muted-foreground">CR (Credit) Acc:</span>
                    <span className="font-semibold text-foreground">alex@okaxis</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/60">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold text-foreground">₹500.00 INR</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/60">
                    <span className="text-muted-foreground">Checksum:</span>
                    <span className="text-muted-foreground text-[10px] truncate max-w-[120px]">
                      0x8f2a...e91c
                    </span>
                  </div>
                </div>
                <div className="pt-2 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    Zero balance discrepancies across 100,000+ test entries.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE FAQ ACCORDION */}
      <section id="faq" className="py-20 bg-secondary/20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary font-mono">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-heading mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Everything you need to know about Fincheck accounts and transfers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <Card
                  key={faq.question}
                  className="border-border bg-card overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 select-none hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-foreground font-heading">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0',
                        isOpen && 'rotate-180 text-foreground'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in-0 duration-200">
                      {faq.answer}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-[var(--gradient-brand-from)] via-[var(--gradient-brand-via)] to-[var(--gradient-brand-to)] text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-radial-gradient from-white/10 via-transparent to-black/30 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Instant Setup • No Credit Card Required</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight font-heading leading-tight">
              Ready to Upgrade Your Banking Experience?
            </h2>

            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl mx-auto">
              Join thousands of users who trust Fincheck for instant zero-fee transfers, double-entry security, and an effortless financial command center.
            </p>

            {/* Fixed CTA Buttons in bottom banner */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm gap-2 shadow-lg hover-lift cursor-pointer whitespace-nowrap inline-flex items-center justify-center"
              >
                <span className="whitespace-nowrap">Get Started in 60 Seconds</span>
                <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto h-12 px-7 text-sm font-medium border-white/40 text-white hover:bg-white/15 bg-transparent cursor-pointer whitespace-nowrap inline-flex items-center justify-center"
              >
                <span className="whitespace-nowrap">Sign In</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="border-t border-border bg-background py-12 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="font-bold text-foreground text-sm tracking-wider font-heading">
                FINCHECK
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <a href="#features" className="hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#security" className="hover:text-foreground transition-colors">
                Security
              </a>
              <a href="#faq" className="hover:text-foreground transition-colors">
                FAQ
              </a>
              <Link to="/login" className="hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="hover:text-foreground transition-colors">
                Register
              </Link>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} Fincheck Digital Banking System. All rights reserved.</p>
            <p>Designed with shadcn/ui & Tailwind CSS • Bank-grade Ledger Architecture</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
