import React, { useState, useMemo } from 'react';
import { Card } from '../common/Card';
import { Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

/**
 * RoundedBarChart
 * 
 * Modern rounded vertical bar chart with diagonal striped active peak bar
 * dynamically computed from real transactions ledger.
 * 
 * @param {Object} props
 * @param {Array} [props.transactions=[]]
 * @param {Array} [props.data]
 * @param {string} [props.currency='INR']
 * @param {string} [props.className='']
 */
export function RoundedBarChart({
  transactions = [],
  data = [],
  currency = 'INR',
  className = '',
}) {
  const { showSuccess } = useToast();

  // Helper to extract a friendly channel/payee label from a transaction
  const extractChannelLabel = (tx) => {
    if (tx.recipientName && tx.recipientName.trim()) {
      return tx.recipientName.trim().slice(0, 10);
    }
    if (tx.recipientAccount && tx.recipientAccount.includes('@')) {
      const handle = tx.recipientAccount.split('@')[0];
      return (handle.charAt(0).toUpperCase() + handle.slice(1)).slice(0, 10);
    }
    if (tx.title && tx.title.trim()) {
      const clean = tx.title
        .replace(/^Transfer to /i, '')
        .replace(/^Payment to /i, '')
        .replace(/^Deposit /i, 'Deposit')
        .replace(/^Welcome Credit.*/i, 'Opening')
        .trim();
      return clean.slice(0, 10);
    }
    if (tx.category && tx.category !== 'General') {
      return tx.category.slice(0, 10);
    }
    return 'Transfer';
  };

  // Dynamically compute spending channels from real transactions
  const { channels, maxAmount, peakIdx, gridLevels, totalSpend } = useMemo(() => {
    if (data && data.length > 0) {
      const max = Math.max(...data.map((d) => d.amount || 0), 100);
      let peak = 0;
      data.forEach((d, idx) => {
        if (d.isPeak || d.amount === max) peak = idx;
      });
      return {
        channels: data,
        maxAmount: max,
        peakIdx: peak,
        gridLevels: [max * 0.95, max * 0.65, max * 0.35, max * 0.1],
        totalSpend: data.reduce((s, d) => s + (d.amount || 0), 0),
      };
    }

    // Filter debit transactions (spending)
    const debitTxs = transactions.filter((tx) => tx.type === 'DEBIT');
    // If user has 0 debits but has other transactions (e.g. deposits), show all transactions
    const sourceTxs = debitTxs.length > 0 ? debitTxs : transactions;

    const channelMap = {};
    sourceTxs.forEach((tx) => {
      const label = extractChannelLabel(tx);
      const amt = Math.abs(Number(tx.amount)) || 0;
      channelMap[label] = (channelMap[label] || 0) + amt;
    });

    const entries = Object.entries(channelMap);

    let resolvedChannels = [];
    if (entries.length > 0) {
      // Sort by amount descending
      entries.sort((a, b) => b[1] - a[1]);
      const topEntries = entries.slice(0, 13);
      const highest = topEntries[0][1];

      resolvedChannels = topEntries.map(([label, amt], idx) => {
        const heightPct = highest > 0 ? Math.max(18, Math.round((amt / highest) * 88)) : 20;
        return {
          label,
          amount: Math.round((amt + Number.EPSILON) * 100) / 100,
          height: heightPct,
          isPeak: idx === 0,
        };
      });
    } else {
      // Clean fallback when 0 transactions
      resolvedChannels = [
        { label: 'UPI', amount: 0, height: 15 },
        { label: 'Wire', amount: 0, height: 15 },
        { label: 'Cards', amount: 0, height: 15 },
        { label: 'Bills', amount: 0, height: 15 },
        { label: 'General', amount: 0, height: 15 },
      ];
    }

    const max = Math.max(...resolvedChannels.map((c) => c.amount), 100);
    const sum = resolvedChannels.reduce((s, c) => s + c.amount, 0);

    return {
      channels: resolvedChannels,
      maxAmount: max,
      peakIdx: 0,
      gridLevels: [max * 0.95, max * 0.65, max * 0.35, Math.max(10, max * 0.1)],
      totalSpend: sum,
    };
  }, [transactions, data]);

  const [activeBarIndex, setActiveBarIndex] = useState(peakIdx);

  const handleExport = () => {
    const csvContent = 'Channel,Amount\n' + channels.map((c) => `${c.label},${c.amount}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spend_by_channel_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Channel spend exported successfully.');
  };

  const svgWidth = 640;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingBottom = 20;
  const paddingTop = 35;
  const availableHeight = svgHeight - paddingTop - paddingBottom;

  const totalBars = channels.length;
  const barWidth = Math.min(22, Math.max(14, Math.floor((svgWidth - paddingX * 2) / (totalBars * 1.8))));
  const barSpacing = (svgWidth - paddingX * 2) / totalBars;

  const activeIdx = Math.min(activeBarIndex, channels.length - 1);
  const activeChannel = channels[activeIdx] || channels[0];

  return (
    <Card padding="md" className={cn('rounded-2xl border-slate-100 dark:border-slate-800 flex flex-col justify-between', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Spend by channel
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span>Total: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(totalSpend, currency)}</strong></span>
            {channels.length > 0 && totalSpend > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                • {channels.length} active channels
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors select-none cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span>Export</span>
        </button>
      </div>

      {/* SVG Bar Graphic */}
      <div className="relative w-full h-44 sm:h-48 my-auto overflow-x-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full min-w-[500px]">
          <defs>
            {/* Diagonal Striped Pattern for Peak Highlight Bar */}
            <pattern id="diagonalStripes" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#ffffff" strokeWidth="2.5" opacity="0.35" />
            </pattern>

            {/* Gradient for peak bar */}
            <linearGradient id="peakBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>

            {/* Default bar gradient */}
            <linearGradient id="defaultBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d8b4fe" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          {/* Horizontal Dynamic Gridlines */}
          {[0.9, 0.6, 0.3, 0.05].map((pct, idx) => {
            const y = svgHeight - paddingBottom - pct * availableHeight;
            const levelVal = gridLevels[idx] || 0;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800/60"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono"
                >
                  {formatCompactCurrency(levelVal, currency)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {channels.map((ch, idx) => {
            const x = paddingX + idx * barSpacing + (barSpacing - barWidth) / 2;
            const barH = (ch.height / 100) * availableHeight;
            const y = svgHeight - paddingBottom - barH;
            const isActive = activeIdx === idx;

            return (
              <g
                key={ch.label + idx}
                className="cursor-pointer group"
                onClick={() => setActiveBarIndex(idx)}
                onMouseEnter={() => setActiveBarIndex(idx)}
              >
                {/* Main rounded bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="6"
                  ry="6"
                  fill={isActive ? 'url(#peakBarGradient)' : 'url(#defaultBarGradient)'}
                  className="transition-all duration-200 group-hover:opacity-90"
                />

                {/* Diagonal stripes overlay on active bar */}
                {isActive && (
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx="6"
                    ry="6"
                    fill="url(#diagonalStripes)"
                  />
                )}

                {/* Active Tooltip Badge directly over bar */}
                {isActive && (
                  <g transform={`translate(${Math.max(10, Math.min(svgWidth - 95, x + barWidth / 2 - 45))}, ${Math.max(4, y - 30)})`}>
                    <rect
                      width="90"
                      height="24"
                      rx="6"
                      fill="#4f46e5"
                      className="shadow-md"
                    />
                    <polygon
                      points="41,24 45,28 49,24"
                      fill="#4f46e5"
                    />
                    <text
                      x="45"
                      y="15"
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-white font-mono"
                    >
                      {formatCurrency(ch.amount, currency)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* X-Axis Channel Labels */}
      <div className="flex items-center justify-between pl-8 pr-2 pt-1 text-[10px] text-slate-400 dark:text-slate-500 overflow-x-auto">
        {channels.map((ch, idx) => (
          <span
            key={ch.label + idx}
            onClick={() => setActiveBarIndex(idx)}
            className={`cursor-pointer text-center truncate px-0.5 transition-colors ${
              activeIdx === idx
                ? 'text-slate-900 dark:text-slate-100 font-bold'
                : 'hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {ch.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

export default RoundedBarChart;
