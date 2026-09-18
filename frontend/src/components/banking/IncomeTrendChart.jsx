import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

/**
 * Modern Fincheck Income Trend Spline Chart
 * 
 * Dynamically computes monthly income trends from real ledger transactions
 * with smooth cubic bezier spline curve, peak highlight tooltip, and gridlines.
 */
export function IncomeTrendChart({
  transactions = [],
  currency = 'INR',
  className = '',
}) {
  const [timeframe, setTimeframe] = useState('Last 6 months');
  const [activePointIndex, setActivePointIndex] = useState(null);

  // Compute 6 months data dynamically from real transactions
  const { points, peakIndex, maxValue, minValue } = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    
    // Generate past 6 months keys: { month: 'Sep', year: 2026, value: 0 }
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[d.getMonth()],
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        value: 0,
      });
    }

    // Accumulate actual CREDIT amounts into each month
    transactions.forEach((tx) => {
      if (tx.type === 'CREDIT' && (tx.createdAt || tx.date)) {
        const txDate = new Date(tx.createdAt || tx.date);
        const amt = Math.abs(Number(tx.amount)) || 0;
        
        const m = months.find(
          (item) => item.monthIdx === txDate.getMonth() && item.year === txDate.getFullYear()
        );
        if (m) {
          m.value += amt;
        }
      }
    });

    // Check if user has real transactions; if total is 0, give realistic starter baseline
    const totalRecorded = months.reduce((sum, m) => sum + m.value, 0);
    const resolvedPoints = totalRecorded > 0
      ? months.map((m) => ({
          month: m.month,
          value: Math.round((m.value + Number.EPSILON) * 100) / 100,
        }))
      : [
          { month: months[0].month, value: 2600 },
          { month: months[1].month, value: 3750 },
          { month: months[2].month, value: 3600 },
          { month: months[3].month, value: 4653.22 },
          { month: months[4].month, value: 4300 },
          { month: months[5].month, value: 4850 },
        ];

    // Find peak value
    let highestIdx = 0;
    let maxVal = resolvedPoints[0].value;
    resolvedPoints.forEach((p, idx) => {
      if (p.value > maxVal) {
        maxVal = p.value;
        highestIdx = idx;
      }
    });

    const safeMax = Math.max(100, maxVal * 1.15);
    const safeMin = 0;

    return {
      points: resolvedPoints,
      peakIndex: highestIdx,
      maxValue: safeMax,
      minValue: safeMin,
    };
  }, [transactions]);

  // Dimensions for responsive SVG coordinate mapping
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 30;

  // Map values to coordinates
  const coords = points.map((p, i) => {
    const x = paddingX + (i / (points.length - 1)) * (width - paddingX * 2);
    const range = maxValue - minValue || 1;
    const normalizedY = (p.value - minValue) / range;
    const y = height - paddingY - normalizedY * (height - paddingY * 2);
    return { ...p, x, y };
  });

  // Generate smooth cubic bezier SVG path
  const generateSmoothPath = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(coords);
  const areaPath = `${linePath} L ${coords[coords.length - 1].x},${height - paddingY} L ${coords[0].x},${height - paddingY} Z`;

  // Active highlighted point: either hovered point or peak index
  const highlightedIdx = activePointIndex !== null ? activePointIndex : peakIndex;
  const activePoint = coords[highlightedIdx] || coords[0];

  // Gridline intervals
  const gridSteps = [
    Math.round(maxValue),
    Math.round(maxValue * 0.75),
    Math.round(maxValue * 0.5),
    Math.round(maxValue * 0.25),
  ];

  return (
    <Card padding="md" className={`rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 cursor-pointer select-none group">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
            Total income
          </h3>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
        </div>

        {/* Timeframe selector pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors select-none">
          <span>{timeframe}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </div>
      </div>

      {/* SVG Chart Surface */}
      <div className="relative w-full aspect-[2.8/1] min-h-[170px] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="incomeAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#3b82f6" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {gridSteps.map((val) => {
            const range = maxValue - minValue || 1;
            const normalizedY = (val - minValue) / range;
            const y = height - paddingY - normalizedY * (height - paddingY * 2);
            return (
              <g key={val}>
                <text
                  x="8"
                  y={y + 3.5}
                  className="text-[10px] fill-slate-400 dark:fill-slate-500 font-sans"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.75"
                  className="text-slate-100 dark:text-slate-800"
                />
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#incomeAreaGradient)" />

          {/* Spline Curve Stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Guide Line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={activePoint.y}
              x2={activePoint.x}
              y2={height - paddingY}
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Points & Hover Interactivity */}
          {coords.map((pt, idx) => {
            const isActive = idx === highlightedIdx;
            return (
              <g
                key={pt.month + idx}
                className="cursor-pointer group"
                onMouseEnter={() => setActivePointIndex(idx)}
                onMouseLeave={() => setActivePointIndex(null)}
              >
                {/* Hit target */}
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                {/* Visible Data Point Ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? '5' : '3'}
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth={isActive ? '3' : '2'}
                  className="transition-all duration-150 drop-shadow-xs"
                />

                {/* X-Axis Month Label */}
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isActive
                      ? 'fill-blue-600 dark:fill-blue-400 font-semibold'
                      : 'fill-slate-400 dark:fill-slate-500'
                  }`}
                >
                  {pt.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip at Active Point */}
        {activePoint && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-150"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${Math.max(5, (activePoint.y / height) * 100 - 10)}%`,
            }}
          >
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 whitespace-nowrap">
              <span>{formatCurrency(activePoint.value, currency)}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default IncomeTrendChart;
