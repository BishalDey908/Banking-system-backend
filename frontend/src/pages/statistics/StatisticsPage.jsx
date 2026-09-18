import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { ActivityDonutChart } from '../../components/banking/ActivityDonutChart';
import { ConcentricRingsChart } from '../../components/banking/ConcentricRingsChart';
import { DualWaveChart } from '../../components/banking/DualWaveChart';
import { RoundedBarChart } from '../../components/banking/RoundedBarChart';
import { fetchAccounts } from '../../store/slices/accountSlice';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { formatCurrency } from '../../utils/formatters';

/**
 * Modern Fincheck Statistics & Analytics View
 * 
 * 100% computed from real MongoDB ledger transactions and live user accounts.
 */
export function StatisticsPage() {
  const dispatch = useDispatch();
  const { accounts, activeAccountId, loading: accountsLoading } = useSelector(
    (state) => state.accounts
  );
  const { items: transactions, loading: transactionsLoading } = useSelector(
    (state) => state.transactions
  );

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const activeAccount =
    accounts.find((a) => a._id === activeAccountId) || accounts[0] || null;
  const currency = activeAccount?.currency || 'INR';

  // Compute live totals and breakdowns from real MongoDB ledger
  const { totalInflow, totalOutflow, totalBalance, netReserve, creditCount, debitCount } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    let credits = 0;
    let debits = 0;

    transactions.forEach((tx) => {
      const amt = Math.abs(Number(tx.amount)) || 0;
      if (tx.type === 'CREDIT') {
        inflow += amt;
        credits += 1;
      } else if (tx.type === 'DEBIT') {
        outflow += amt;
        debits += 1;
      }
    });

    const balance = accounts.reduce(
      (sum, acc) => sum + (Number(acc.balance) || 0),
      0
    );

    return {
      totalInflow: Math.round((inflow + Number.EPSILON) * 100) / 100,
      totalOutflow: Math.round((outflow + Number.EPSILON) * 100) / 100,
      totalBalance: Math.round((balance + Number.EPSILON) * 100) / 100,
      netReserve: Math.round((inflow - outflow + Number.EPSILON) * 100) / 100,
      creditCount: credits,
      debitCount: debits,
    };
  }, [transactions, accounts]);

  // Payment channel data computed dynamically from real transactions
  const paymentChannelData = useMemo(() => {
    let upiTotal = 0;
    let wireTotal = 0;
    let cardTotal = 0;

    transactions.forEach((tx) => {
      const amt = Math.abs(Number(tx.amount)) || 0;
      const rec = (tx.recipientAccount || '').toLowerCase();
      const title = (tx.title || '').toLowerCase();
      const cat = (tx.category || '').toLowerCase();
      const note = (tx.note || '').toLowerCase();

      if (rec.includes('@') || title.includes('upi') || cat === 'upi' || note.includes('upi') || note.includes('qr')) {
        upiTotal += amt;
      } else if (rec.length >= 10 || cat === 'transfer' || title.includes('transfer')) {
        wireTotal += amt;
      } else {
        cardTotal += amt;
      }
    });

    const sum = upiTotal + wireTotal + cardTotal;
    if (sum > 0) {
      const upiPct = Math.round((upiTotal / sum) * 100);
      const wirePct = Math.round((wireTotal / sum) * 100);
      const cardPct = Math.max(0, 100 - upiPct - wirePct);

      return [
        { label: 'UPI Payments', value: Math.round(upiTotal), percentage: upiPct, color: '#c084fc' },
        { label: 'Wire Transfer', value: Math.round(wireTotal), percentage: wirePct, color: '#38bdf8' },
        { label: 'Card & Cash', value: Math.round(cardTotal), percentage: cardPct, color: '#818cf8' },
      ];
    }

    return [
      { label: 'UPI Payments', value: 0, percentage: 0, color: '#c084fc' },
      { label: 'Wire Transfer', value: 0, percentage: 0, color: '#38bdf8' },
      { label: 'Card & Cash', value: 0, percentage: 0, color: '#818cf8' },
    ];
  }, [transactions]);

  // Portfolio allocation resonance data computed dynamically from real accounts & reserves
  const portfolioResonanceData = useMemo(() => {
    if (!accounts || accounts.length === 0) {
      return [
        { label: 'Primary', value: 0, percentage: 0, color: '#f472b6' },
        { label: 'Reserve', value: 0, percentage: 0, color: '#38bdf8' },
      ];
    }

    const palette = ['#f472b6', '#38bdf8', '#818cf8', '#34d399', '#facc15'];

    // If user has 2+ accounts, each real account gets its actual percentage of the portfolio
    if (accounts.length > 1 && totalBalance > 0) {
      return accounts.slice(0, 4).map((acc, idx) => {
        const bal = Number(acc.balance) || 0;
        const pct = Math.min(100, Math.max(1, Math.round((bal / totalBalance) * 100)));
        const label = acc._id ? `Acct ••${acc._id.slice(-4)}` : `Account ${idx + 1}`;
        return {
          label,
          value: bal,
          percentage: pct,
          color: palette[idx % palette.length],
        };
      });
    }

    // If user has 1 account, compute real financial health metrics from ledger
    const primaryBalance = accounts[0]?.balance || 0;
    const retentionRate = totalInflow > 0
      ? Math.min(100, Math.max(0, Math.round((netReserve / totalInflow) * 100)))
      : 100;
    const spendRatio = (primaryBalance + totalOutflow) > 0
      ? Math.min(100, Math.max(0, Math.round((totalOutflow / (primaryBalance + totalOutflow)) * 100)))
      : 0;
    const reserveHealth = totalInflow > 0 && totalOutflow > 0
      ? Math.min(100, Math.max(10, Math.round((totalBalance / (totalOutflow * 2 || 1)) * 100)))
      : 100;

    return [
      { label: 'Portfolio Share', value: primaryBalance, percentage: 100, color: '#f472b6' },
      { label: 'Fund Retention', value: netReserve, percentage: retentionRate, color: '#38bdf8' },
      { label: 'Spend Ratio', value: totalOutflow, percentage: spendRatio, color: '#818cf8' },
      { label: 'Reserve Health', value: totalBalance, percentage: Math.min(100, reserveHealth), color: '#34d399' },
    ];
  }, [accounts, totalBalance, totalInflow, totalOutflow, netReserve]);

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* 1. Header with Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Measurements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time financial performance, cash flow waves, and channel analytics.
          </p>
        </div>
      </div>

      {/* 2. Top 4 Signature Pastel Gradient Metric Cards (Live MongoDB Ledger Totals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Spend (Cyan Pastel) */}
        <StatCard
          variant="cyan"
          label="Total Spend"
          value={formatCurrency(totalOutflow, currency)}
          change={`${debitCount} debit movements`}
          changeType="neutral"
          icon={<CreditCard className="w-4 h-4 text-white" />}
          loading={transactionsLoading}
        />

        {/* Card 2: Total Inflow (Lavender/Purple Pastel) */}
        <StatCard
          variant="purple"
          label="Total Inflow"
          value={formatCurrency(totalInflow, currency)}
          change={`${creditCount} credit receipts`}
          changeType="positive"
          icon={<ArrowDownLeft className="w-4 h-4 text-white" />}
          loading={transactionsLoading}
        />

        {/* Card 3: Net Reserve (Mint/Green Pastel) */}
        <StatCard
          variant="blue"
          label="Net Reserve"
          value={formatCurrency(netReserve, currency)}
          change={netReserve >= 0 ? '+ Inflow surplus' : '- Outflow deficit'}
          changeType={netReserve >= 0 ? 'positive' : 'negative'}
          icon={<ArrowUpRight className="w-4 h-4 text-white" />}
          loading={transactionsLoading}
        />

        {/* Card 4: Total Balance / Portfolio (Pink/Coral Pastel) */}
        <StatCard
          variant="pink"
          label="Total Balance"
          value={formatCurrency(totalBalance, currency)}
          change={`${accounts.length} registered account${accounts.length === 1 ? '' : 's'}`}
          changeType="positive"
          icon={<Wallet className="w-4 h-4 text-white" />}
          loading={accountsLoading}
        />
      </div>

      {/* 3. Middle Row (3 Cards): Contextual Donut (33%) + Payment Channels Rings (33%) + Cash Flow Dual Wave (34%) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        {/* Contextual Donut Chart */}
        <div className="flex flex-col">
          <ActivityDonutChart
            title="Contextual Spending"
            transactions={transactions}
            currency={currency}
            className="flex-1"
          />
        </div>

        {/* Payment Channels Concentric Rings */}
        <div className="flex flex-col">
          <ConcentricRingsChart
            title="Payment Channels"
            data={paymentChannelData}
            timeframe="Last week"
            className="flex-1"
          />
        </div>

        {/* Cash Flow Dual Wave Chart */}
        <div className="flex flex-col md:col-span-2 lg:col-span-1">
          <DualWaveChart
            transactions={transactions}
            currency={currency}
            className="flex-1"
          />
        </div>
      </div>

      {/* 4. Bottom Row (2 Cards): Spend by Channel Bar Chart (~65%) + Resonance Score Rings (~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Spend by channel Rounded Bar Chart */}
        <div className="lg:col-span-7 flex flex-col">
          <RoundedBarChart
            transactions={transactions}
            currency={currency}
            className="flex-1"
          />
        </div>

        {/* Resonance Score Concentric Multi-Ring */}
        <div className="lg:col-span-5 flex flex-col">
          <ConcentricRingsChart
            title="Portfolio & Fund Health"
            data={portfolioResonanceData}
            timeframe="Last week"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}

export default StatisticsPage;
