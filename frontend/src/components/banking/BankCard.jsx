import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Wifi } from 'lucide-react';
import { deriveCardNumber, maskCardNumber } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { BankCardSkeleton } from '../common/Skeleton';
import { cn } from '../../utils/cn';

/**
 * Modern Minimalist Virtual Debit Card Component
 * 
 * @param {Object} props
 * @param {string} [props.accountId] - Associated backend account ID
 * @param {string} [props.cardholderName='Valued Member'] - User display name
 * @param {string} [props.currency='INR'] - Currency code
 * @param {'obsidian' | 'emerald' | 'sapphire'} [props.theme='obsidian'] - Card visual theme
 * @param {string} [props.className='']
 * @param {boolean} [props.loading=false] - Show skeleton loader
 */
export function BankCard({
  accountId = '',
  cardholderName = 'Valued Member',
  currency = 'INR',
  theme = 'obsidian',
  className = '',
  loading = false,
}) {
  if (loading) {
    return <BankCardSkeleton className={className} />;
  }
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { showSuccess } = useToast();

  const fullCardNumber = deriveCardNumber(accountId);
  const displayedCardNumber = maskCardNumber(fullCardNumber, isRevealed);
  const expiryDate = '08/29';
  const cvv = '842';

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullCardNumber.replace(/\s+/g, ''));
    setIsCopied(true);
    showSuccess('Card number copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const themeStyles = {
    obsidian: 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white border-slate-750',
    emerald: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white border-emerald-800/40',
    sapphire: 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white border-blue-900/40',
  };

  return (
    <div
      className={cn(
        'relative w-full max-w-sm aspect-[1.586/1] rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden',
        'shadow-2xl border transition-all duration-300 select-none group',
        themeStyles[theme],
        className
      )}
    >
      {/* Card Shimmer Overlay */}
      <div className="card-shimmer absolute inset-0 pointer-events-none" />

      {/* Background Micro Watermark */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full border border-white/5 pointer-events-none" />

      {/* Top Row: Brand & Contactless Icon */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <span className="font-bold text-xs tracking-tighter text-emerald-400">A</span>
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300 font-mono">
            Aura Black
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-slate-400 rotate-90" />
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">
            {currency}
          </span>
        </div>
      </div>

      {/* Middle Row: EMV Chip & Number */}
      <div className="relative z-10 my-auto pt-2">
        {/* EMV Chip */}
        <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 border border-amber-500/50 shadow-inner relative overflow-hidden mb-4">
          <div className="absolute inset-0 grid grid-cols-3 gap-0.5 opacity-30">
            <div className="border-r border-amber-700" />
            <div className="border-r border-amber-700" />
            <div />
          </div>
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-700/40" />
        </div>

        {/* Card Number & Action Buttons */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-base sm:text-lg tracking-[0.18em] text-white font-medium drop-shadow-sm">
            {displayedCardNumber}
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={() => setIsRevealed(!isRevealed)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title={isRevealed ? 'Hide Details' : 'Show Details'}
            >
              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy Card Number"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Cardholder, Expiry, CVV */}
      <div className="relative z-10 flex items-end justify-between text-xs pt-2">
        <div>
          <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-mono mb-0.5">
            Cardholder
          </span>
          <span className="font-medium tracking-wide uppercase text-slate-100 truncate max-w-[140px] block">
            {cardholderName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-mono mb-0.5">
              Expires
            </span>
            <span className="font-mono text-slate-200">{expiryDate}</span>
          </div>

          <div>
            <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-mono mb-0.5">
              CVV
            </span>
            <span className="font-mono text-slate-200">
              {isRevealed ? cvv : '•••'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BankCard;

