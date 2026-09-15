import React from 'react';
import { PlusCircle, ArrowUpRight, ArrowDownLeft, Download } from 'lucide-react';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Quick Actions Grid
 */
export function QuickActions({
  onOpenCreateModal,
  onOpenTransferModal,
  onOpenDepositModal,
  onExportStatement,
  className = '',
}) {
  const actions = [
    {
      label: 'Send Money',
      description: 'Transfer instantly',
      icon: <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      onClick: onOpenTransferModal,
      highlight: true,
    },
    {
      label: 'Deposit Funds',
      description: 'Add money',
      icon: <ArrowDownLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />,
      onClick: onOpenDepositModal,
    },
    {
      label: 'New Account',
      description: 'Open in seconds',
      icon: <PlusCircle className="w-5 h-5 text-slate-700 dark:text-slate-300" />,
      onClick: onOpenCreateModal,
    },
    {
      label: 'Download CSV',
      description: 'Export statement',
      icon: <Download className="w-5 h-5 text-slate-700 dark:text-slate-300" />,
      onClick: onExportStatement,
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-3', className)}>
      {actions.map((action, index) => (
        <Card
          key={index}
          padding="sm"
          hoverable
          onClick={action.onClick}
          className={cn(
            'flex flex-col justify-center items-start text-left border cursor-pointer group',
            action.highlight
              ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/30 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
            {action.icon}
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white">
            {action.label}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{action.description}</span>
        </Card>
      ))}
    </div>
  );
}

export default QuickActions;
