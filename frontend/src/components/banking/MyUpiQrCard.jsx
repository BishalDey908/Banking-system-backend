import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QRCode from 'qrcode';
import {
  Copy,
  Check,
  Download,
  QrCode,
  ShieldCheck,
  Landmark,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { setActiveAccount } from '../../store/slices/accountSlice';
import { getAccountUpiId, getUserDefaultUpiId, generateUpiUri } from '../../utils/upi';
import { maskAccountNumber, formatCurrency } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

/**
 * Account-Specific Receiver UPI QR Code Card
 * Supports multi-account selection, custom requested amount, downloading QR, and copying UPI details.
 */
export function MyUpiQrCard({
  accountId,
  className = '',
  showAccountSelector = true,
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { accounts, activeAccountId } = useSelector((state) => state.accounts);
  const { showSuccess } = useToast();

  const [selectedAccId, setSelectedAccId] = useState(
    accountId || activeAccountId || accounts[0]?._id || ''
  );
  const [requestAmount, setRequestAmount] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAccId, setCopiedAccId] = useState(false);

  // Sync if prop changes
  useEffect(() => {
    if (accountId) {
      setSelectedAccId(accountId);
    } else if (!selectedAccId && (activeAccountId || accounts[0]?._id)) {
      setSelectedAccId(activeAccountId || accounts[0]?._id);
    }
  }, [accountId, activeAccountId, accounts, selectedAccId]);

  const currentAccount =
    accounts.find((a) => a._id === selectedAccId) || accounts[0] || null;

  const upiId = currentAccount ? getAccountUpiId(currentAccount, user) : getUserDefaultUpiId(user);
  const userName = user?.name || 'Aura Bank Member';

  // Generate QR code whenever account, user, or requested amount changes
  useEffect(() => {
    if (!currentAccount) return;

    const numAmount = Number(requestAmount);
    const upiUri = generateUpiUri({
      upiId,
      name: userName,
      amount: numAmount > 0 ? numAmount : '',
      currency: currentAccount.currency || 'INR',
      note: `Payment to ${userName}`,
    });

    QRCode.toDataURL(upiUri, {
      width: 320,
      margin: 2,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [upiId, userName, currentAccount, requestAmount]);

  const handleAccountChange = (newId) => {
    setSelectedAccId(newId);
    dispatch(setActiveAccount(newId));
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    showSuccess('Receiver UPI ID copied to clipboard');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAccId = () => {
    if (!currentAccount?._id) return;
    navigator.clipboard.writeText(currentAccount._id);
    setCopiedAccId(true);
    showSuccess('Account ID copied to clipboard');
    setTimeout(() => setCopiedAccId(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    const cleanId = currentAccount?._id ? currentAccount._id.slice(-6) : 'account';
    link.download = `aura_qr_${cleanId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('QR code image downloaded successfully.');
  };

  const accountOptions = accounts.map((acc) => ({
    value: acc._id,
    label: `${maskAccountNumber(acc._id)} (${acc.currency || 'INR'}) — Bal: ${formatCurrency(acc.balance || 0, acc.currency)}`,
  }));

  const quickAmounts = [100, 250, 500, 1000, 2000];

  return (
    <Card padding="lg" className={cn('max-w-md mx-auto text-center space-y-5', className)}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
          <QrCode className="w-4 h-4" />
          <span>Receiver's QR Code</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Receive Money Instantly
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Scan with Aura Bank, Google Pay, PhonePe, Paytm, or BHIM
        </p>
      </div>

      {/* Account Selector (if user has accounts and enabled) */}
      {showAccountSelector && accountOptions.length > 0 && (
        <div className="text-left space-y-1.5 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-slate-400" />
              <span>Receiving Account:</span>
            </span>
            {currentAccount && (
              <Badge variant="emerald" size="sm" dot>
                {currentAccount.status || 'ACTIVE'}
              </Badge>
            )}
          </div>

          <Select
            options={accountOptions}
            value={selectedAccId}
            onChange={(e) => handleAccountChange(e.target.value)}
          />
        </div>
      )}

      {/* Scannable QR Code Canvas */}
      <div className="relative inline-block p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`Receiver QR Code for ${currentAccount ? maskAccountNumber(currentAccount._id) : 'Account'}`}
            className="w-56 h-56 sm:w-60 sm:h-60 mx-auto rounded-lg select-none"
          />
        ) : (
          <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-lg text-xs font-mono text-slate-400 animate-pulse">
            Generating receiver QR...
          </div>
        )}

        {/* Dynamic Amount Badge on QR */}
        {Number(requestAmount) > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold shadow-xs">
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Requesting: {formatCurrency(Number(requestAmount), currentAccount?.currency || 'INR')}</span>
          </div>
        )}

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] font-mono font-medium text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>NPCI • Direct Account Settlement</span>
        </div>
      </div>

      {/* Optional Request Specific Amount Tool */}
      <div className="text-left bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase font-semibold text-slate-600 dark:text-slate-400">
            Request Specific Amount (Optional)
          </label>
          {requestAmount && (
            <button
              type="button"
              onClick={() => setRequestAmount('')}
              className="text-[11px] font-mono text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <Input
          type="number"
          min="1"
          step="any"
          placeholder="e.g. 500 (Leave blank for any amount)"
          value={requestAmount}
          onChange={(e) => setRequestAmount(e.target.value)}
          leftIcon={<span className="text-xs font-mono font-bold">₹</span>}
        />

        {/* Quick Amount Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setRequestAmount(String(amt))}
              className={cn(
                'px-2 py-0.5 rounded text-[11px] font-mono border transition-colors cursor-pointer',
                Number(requestAmount) === amt
                  ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500'
              )}
            >
              +₹{amt}
            </button>
          ))}
        </div>
      </div>

      {/* Receiver UPI ID & Account Details Card */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2 text-left text-xs">
        {/* UPI ID Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500 block">
              Receiver UPI ID
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate block text-xs sm:text-sm">
              {upiId}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyUpiId}
            className="p-2 rounded-lg bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0 cursor-pointer shadow-xs"
            title="Copy Receiver UPI ID"
          >
            {copiedUpi ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Account Number Row */}
        {currentAccount && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500 block">
                Direct Account Number
              </span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300 truncate block text-xs">
                {currentAccount._id}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyAccId}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0 cursor-pointer text-xs"
              title="Copy Account ID"
            >
              {copiedAccId ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-3 pt-1 text-xs">
        <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] text-left">
          Funds credit instantly into {currentAccount ? maskAccountNumber(currentAccount._id) : 'your account'}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadQr}
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Download QR
        </Button>
      </div>
    </Card>
  );
}

export default MyUpiQrCard;
