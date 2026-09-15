import React from 'react';
import { Landmark } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist EmptyState Placeholder
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title - Empty state headline
 * @param {string} props.description - Explanatory text
 * @param {React.ReactNode} [props.action] - Primary call-to-action button
 * @param {React.ReactNode} [props.secondaryAction]
 * @param {string} [props.className='']
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 mb-4">
        {icon || <Landmark className="w-6 h-6 text-slate-500 dark:text-slate-400" />}
      </div>

      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export default EmptyState;

