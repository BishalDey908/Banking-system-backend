import React, { useState } from 'react';
import { Card } from '../common/Card';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * ConcentricRingsChart
 * 
 * Renders concentric circular progress arcs matching the "Device Type" and
 * "Resonance score" visualizations from the reference dashboard.
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (e.g. "Device Type", "Resonance score by creative")
 * @param {Array<{ label: string, value: number, color: string, percentage: number }>} props.data
 * @param {string} [props.timeframe='Last week']
 * @param {string} [props.className='']
 */
export function ConcentricRingsChart({
  title = 'Payment Channels',
  data = [],
  timeframe = 'Last week',
  className = '',
}) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [showDropdown, setShowDropdown] = useState(false);

  // Default fallback data if none provided
  const items = data.length > 0 ? data : [
    { label: 'UPI Payments', value: 45, percentage: 45, color: '#be82ff' }, // Lavender/Purple
    { label: 'Wire Transfer', value: 50, percentage: 50, color: '#38bdf8' }, // Cyan
    { label: 'Card Debit', value: 5, percentage: 5, color: '#818cf8' },   // Indigo
  ];

  // Concentric ring geometric parameters
  // Outer to inner ring radii
  const ringRadii = [68, 52, 36, 22];
  const strokeWidth = 8;
  const center = 85;

  return (
    <Card padding="md" className={cn('rounded-2xl border-slate-100 dark:border-slate-800 flex flex-col justify-between', className)}>
      {/* Header with Title and Timeframe Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h3>

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

      {/* Main Content: Left Legend + Right Concentric SVG Rings */}
      <div className="flex items-center justify-between gap-4 my-auto">
        {/* Left: Legend list with dots and percentages */}
        <div className="space-y-2.5 min-w-[120px]">
          {items.map((item, idx) => (
            <div key={item.label || idx} className="flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[95px]">
                  {item.label}
                </span>
              </div>
              <span className="text-slate-400 dark:text-slate-500 tabular-nums font-semibold shrink-0">
                {String(item.percentage).padStart(2, '0')}%
              </span>
            </div>
          ))}
        </div>

        {/* Right: SVG Concentric Arcs */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 170 170" className="w-full h-full -rotate-90">
            {items.map((item, index) => {
              const radius = ringRadii[index % ringRadii.length];
              const circumference = 2 * Math.PI * radius;
              // Arc length according to percentage (leave small gap if 100%)
              const pct = Math.min(100, Math.max(2, item.percentage));
              const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;

              return (
                <g key={item.label || index}>
                  {/* Track Background Ring */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth={strokeWidth}
                  />

                  {/* Active Progress Ring Arc */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </Card>
  );
}

export default ConcentricRingsChart;

