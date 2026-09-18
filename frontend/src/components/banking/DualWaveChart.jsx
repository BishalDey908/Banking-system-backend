import React, { useState, useMemo } from 'react';
import { Card } from '../common/Card';
import { ChevronDown, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import { cn } from '../../utils/cn';

/**
 * DualWaveChart
 * 
 * Dual-line cubic spline wave chart showing Inflow vs Outflow over time
 * with interactive peak point tooltip badge, computed from real transactions.
 * 
 * @param {Object} props
 * @param {Array} [props.transactions=[]]
 * @param {string} [props.currency='INR']
 * @param {string} [props.className='']
 */
export function DualWaveChart({
  transactions = [],
  currency = 'INR',
  className = '',
}) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last week');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activePoint, setActivePoint] = useState(6); // Default to latest day

  // Dynamically compute 7 day buckets from real transactions
  const {
    dates,
    seriesA,
    seriesB,
    amounts,
    inflows,
    outflows,
    totalPeriodCashFlow,
    changePercent,
    isPositiveChange,
    peakIndex,
    gridLevels,
  } = useMemo(() => {
    const numDays = 7;
    const now = new Date();
    const buckets = [];

    // Create 7 day buckets ending today
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      buckets.push({
        dateObj: d,
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timeLabel: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        inflow: 0,
        outflow: 0,
        total: 0,
      });
    }

    // Previous 7 days for trend calculation (days 7 to 13 ago)
    let priorPeriodTotal = 0;
    const priorCutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
    const currentCutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    // Aggregate transactions
    transactions.forEach((tx) => {
      if (!tx.createdAt && !tx.date) return;
      const txDate = new Date(tx.createdAt || tx.date);
      const amt = Math.abs(Number(tx.amount)) || 0;

      // Check current 7 days buckets
      const matchedBucket = buckets.find(
        (b) => b.dateObj.toDateString() === txDate.toDateString()
      );

      if (matchedBucket) {
        if (tx.type === 'CREDIT') {
          matchedBucket.inflow += amt;
        } else if (tx.type === 'DEBIT') {
          matchedBucket.outflow += amt;
        }
        matchedBucket.total += amt;
      } else if (txDate >= priorCutoff && txDate < currentCutoff) {
        priorPeriodTotal += amt;
      }
    });

    const calculatedDates = buckets.map((b) => b.dateLabel);
    const calculatedInflows = buckets.map((b) => Math.round((b.inflow + Number.EPSILON) * 100) / 100);
    const calculatedOutflows = buckets.map((b) => Math.round((b.outflow + Number.EPSILON) * 100) / 100);
    const calculatedAmounts = buckets.map((b) => Math.round((b.total + Number.EPSILON) * 100) / 100);

    const totalCashFlow = calculatedAmounts.reduce((sum, v) => sum + v, 0);

    // Calculate percentage change
    let pct = 0;
    let isPos = true;
    if (priorPeriodTotal > 0) {
      pct = Math.round(((totalCashFlow - priorPeriodTotal) / priorPeriodTotal) * 1000) / 10;
      isPos = pct >= 0;
    } else if (totalCashFlow > 0) {
      pct = 100;
      isPos = true;
    }

    // Determine max daily amount for SVG scaling
    const maxVal = Math.max(...calculatedInflows, ...calculatedOutflows, 10);
    const gridMax = Math.ceil(maxVal * 1.15);

    // Dynamic grid levels
    const levels = [
      Math.round(gridMax * 0.2),
      Math.round(gridMax * 0.4),
      Math.round(gridMax * 0.6),
      Math.round(gridMax * 0.8),
      gridMax,
    ];

    // Normalize series to 0-100 scale (with min baseline 15 and max 85)
    const normalizedA = calculatedInflows.map((v) => {
      if (maxVal === 0 || v === 0) return 15;
      return Math.min(85, Math.max(15, Math.round((v / maxVal) * 70 + 15)));
    });

    const normalizedB = calculatedOutflows.map((v) => {
      if (maxVal === 0 || v === 0) return 12;
      return Math.min(85, Math.max(12, Math.round((v / maxVal) * 70 + 12)));
    });

    // Find peak index
    let peakIdx = numDays - 1;
    let highestAmount = -1;
    calculatedAmounts.forEach((amt, idx) => {
      if (amt > highestAmount) {
        highestAmount = amt;
        peakIdx = idx;
      }
    });

    return {
      dates: calculatedDates,
      seriesA: normalizedA,
      seriesB: normalizedB,
      amounts: calculatedAmounts,
      inflows: calculatedInflows,
      outflows: calculatedOutflows,
      totalPeriodCashFlow: Math.round((totalCashFlow + Number.EPSILON) * 100) / 100,
      changePercent: Math.abs(pct),
      isPositiveChange: isPos,
      peakIndex: peakIdx,
      gridLevels: levels,
    };
  }, [transactions]);

  // Update active point if peak index changes
  const activeIdx = Math.min(activePoint, dates.length - 1);

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const getPointX = (index) => {
    return paddingX + (index / (dates.length - 1)) * (svgWidth - paddingX * 2);
  };

  const getPointY = (val) => {
    // Invert Y: 100 is top, 0 is bottom
    const availableH = svgHeight - paddingY * 2;
    return svgHeight - paddingY - (val / 100) * availableH;
  };

  // Generate cubic spline path string for points
  const generateSplinePath = (series) => {
    const points = series.map((val, idx) => ({
      x: getPointX(idx),
      y: getPointY(val),
    }));

    if (points.length < 2) return '';

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return d;
  };

  const pathA = generateSplinePath(seriesA);
  const pathB = generateSplinePath(seriesB);

  // Peak highlight coords
  const peakX = getPointX(activeIdx);
  const peakY = getPointY(seriesB[activeIdx]);

  return (
    <Card padding="md" className={cn('rounded-2xl border-slate-100 dark:border-slate-800 flex flex-col justify-between', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Cash Flow Analytics
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrency(totalPeriodCashFlow, currency)}
            </span>
            <span className="text-[11px] text-slate-400">/ 7-day volume</span>
            {changePercent > 0 && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded-md',
                  isPositiveChange
                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                )}
              >
                {isPositiveChange ? (
                  <ArrowUpRight className="w-2.5 h-2.5" />
                ) : (
                  <ArrowDownRight className="w-2.5 h-2.5" />
                )}
                <span>{changePercent}%</span>
              </span>
            )}
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-700/60 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
          >
            <span>{selectedTimeframe}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-20 text-[11px]">
              {['Last week', 'Last month', 'Last 6 months', 'This year'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => {
                    setSelectedTimeframe(tf);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SVG Dual Wave Graphic */}
      <div className="relative w-full h-44 sm:h-48 my-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
          <defs>
            {/* Lavender Wave Area Gradient (Inflow) */}
            <linearGradient id="waveGradientA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d946ef" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#d946ef" stopOpacity="0.0" />
            </linearGradient>

            {/* Indigo Wave Area Gradient (Outflow) */}
            <linearGradient id="waveGradientB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {gridLevels.map((level, i) => {
            const y = getPointY((i + 1) * 18);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800/80"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono"
                >
                  {formatCompactCurrency(level, currency)}
                </text>
              </g>
            );
          })}

          {/* Series A Spline Area & Stroke (Lavender Inflow) */}
          <path
            d={`${pathA} L ${getPointX(seriesA.length - 1)} ${svgHeight - paddingY} L ${getPointX(0)} ${svgHeight - paddingY} Z`}
            fill="url(#waveGradientA)"
          />
          <path
            d={pathA}
            fill="none"
            stroke="#d946ef"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Series B Spline Area & Stroke (Indigo Outflow) */}
          <path
            d={`${pathB} L ${getPointX(seriesB.length - 1)} ${svgHeight - paddingY} L ${getPointX(0)} ${svgHeight - paddingY} Z`}
            fill="url(#waveGradientB)"
          />
          <path
            d={pathB}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Vertical guideline for active peak */}
          <line
            x1={peakX}
            y1={peakY}
            x2={peakX}
            y2={svgHeight - paddingY}
            stroke="#6366f1"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.6"
          />

          {/* Peak point circles */}
          <circle
            cx={peakX}
            cy={peakY}
            r="5"
            fill="#6366f1"
            stroke="#ffffff"
            strokeWidth="2"
            className="shadow-md cursor-pointer"
          />

          {/* Floating Tooltip Box */}
          <g transform={`translate(${Math.max(10, Math.min(svgWidth - 110, peakX - 50))}, ${Math.max(4, peakY - 36)})`}>
            <rect
              width="100"
              height="28"
              rx="6"
              fill="#ffffff"
              className="dark:fill-slate-800 shadow-lg"
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
            <text
              x="50"
              y="11"
              textAnchor="middle"
              className="text-[8px] fill-slate-400 font-sans font-medium"
            >
              {dates[activeIdx]} • {inflows[activeIdx] > 0 ? `+${formatCompactCurrency(inflows[activeIdx], currency)}` : '0 flow'}
            </text>
            <text
              x="50"
              y="22"
              textAnchor="middle"
              className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 font-mono"
            >
              {formatCurrency(amounts[activeIdx], currency)}
            </text>
          </g>

          {/* Interactive touch targets along bottom line */}
          {seriesB.map((val, idx) => {
            const x = getPointX(idx);
            return (
              <circle
                key={idx}
                cx={x}
                cy={getPointY(val)}
                r="14"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setActivePoint(idx)}
                onClick={() => setActivePoint(idx)}
              />
            );
          })}
        </svg>
      </div>

      {/* X-Axis Date Labels */}
      <div className="flex items-center justify-between px-3 pt-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        {dates.map((date, idx) => (
          <span
            key={date}
            onClick={() => setActivePoint(idx)}
            className={`cursor-pointer transition-colors ${
              activeIdx === idx
                ? 'text-slate-900 dark:text-slate-100 font-bold'
                : 'hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {date}
          </span>
        ))}
      </div>
    </Card>
  );
}

export default DualWaveChart;
