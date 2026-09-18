import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, Copy, Check, Wifi, QrCode } from 'lucide-react';
import { deriveCardNumber, maskCardNumber } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { BankCardSkeleton } from '../common/Skeleton';
import { cn } from '../../utils/cn';
import { setReceiveQrAccountId, setReceiveQrModalOpen } from '../../store/slices/uiSlice';

/**
 * Modern Fincheck Virtual Debit Card Component
 */
export function BankCard({
  accountId = '',
  cardholderName = 'Valued Member',
  currency = 'INR',
  theme = 'obsidian',
  className = '',
  loading = false,
  onShowQr,
}) {
  if (loading) {
    return <BankCardSkeleton className={className} />;
  }
  const dispatch = useDispatch();
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

  return (
    <div
      className={cn(
        'relative w-full max-w-sm aspect-[1.586/1] rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden',
        'shadow-xl border border-white/10 transition-all duration-300 select-none group',
        'bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#090d16] text-white',
        className
      )}
    >
      {/* Subtle background ambient glow */}
      <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />

      {/* Top Row: Fincheck Logo & Contactless */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#38bdf8] via-[#a855f7] to-[#f472b6] p-[1.5px] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full border border-t-transparent border-r-[#38bdf8] border-b-[#a855f7] border-l-[#f472b6] rotate-45" />
            </div>
          </div>
          <span className="text-xs font-bold tracking-wider text-white">
            FINCHECK
          </span>
        </div>

        <div className="flex items-center gap-2">
          {accountId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onShowQr) {
                  onShowQr();
                } else {
                  dispatch(setReceiveQrAccountId(accountId));
                  dispatch(setReceiveQrModalOpen(true));
                }
              }}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Show Account UPI QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          )}
          <Wifi className="w-4 h-4 text-slate-400 rotate-90" />
          <span className="text-[10px] font-semibold tracking-wider text-slate-300 uppercase bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
            {currency}
          </span>
        </div>
      </div>

      {/* Middle Row: EMV Chip & Number */}
      <div className="relative z-10 my-auto pt-2">
        {/* EMV Chip */}
        <div className="w-9 h-6.5 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 border border-amber-500/50 shadow-inner relative overflow-hidden mb-3.5">
          <div className="absolute inset-0 grid grid-cols-3 gap-0.5 opacity-30">
            <div className="border-r border-amber-700" />
            <div className="border-r border-amber-700" />
            <div />
          </div>
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-700/40" />
        </div>

        {/* Card Number & Action Buttons */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-base sm:text-lg tracking-[0.16em] text-white font-medium drop-shadow-xs">
            {displayedCardNumber}
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={() => setIsRevealed(!isRevealed)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isRevealed ? 'Hide Details' : 'Show Details'}
            >
              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Copy Card Number"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Cardholder & Expiry */}
      <div className="relative z-10 flex items-end justify-between pt-1 text-xs">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">
            Cardholder
          </span>
          <span className="font-medium text-white tracking-wide block uppercase truncate max-w-[170px]">
            {cardholderName}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">
            Expires
          </span>
          <span className="font-mono font-medium text-white">
            {expiryDate}
          </span>
        </div>
      </div>
    </div>
  );
}

export default BankCard;
