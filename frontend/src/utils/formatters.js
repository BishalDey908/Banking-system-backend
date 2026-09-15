/**
 * Format a numeric amount to standard currency format
 * @param {number|string} amount - Monetary amount
 * @param {string} currency - Currency code (e.g. 'INR', 'USD', 'EUR')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'INR') {
  const num = Number(amount) || 0;
  
  if (currency.toUpperCase() === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Format date string into human-readable banking timestamp
 * @param {string|Date} date - ISO Date string or Date object
 * @returns {string} Formatted date (e.g. "Sep 15, 2026, 04:30 PM")
 */
export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Short date format for transaction tables
 * @param {string|Date} date
 * @returns {string} e.g. "Sep 15, 2026"
 */
export function formatDateShort(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * Masks a banking account or ID, exposing only the last 4 digits
 * @param {string} accountId - Mongo ObjectId or Account Number
 * @returns {string} Masked string e.g. "•••• 9f2a"
 */
export function maskAccountNumber(accountId) {
  if (!accountId) return '•••• 0000';
  const clean = String(accountId).trim();
  const lastFour = clean.slice(-4);
  return `•••• ${lastFour}`;
}

/**
 * Derives a consistent 16-digit debit card number from an account ID
 * @param {string} accountId
 * @returns {string} 16-digit spaced card number
 */
export function deriveCardNumber(accountId = '') {
  if (!accountId) return '4532 8901 2345 6789';
  
  // Deterministic seed from MongoDB ObjectId
  let hash = 0;
  for (let i = 0; i < accountId.length; i++) {
    hash = (hash << 5) - hash + accountId.charCodeAt(i);
    hash |= 0;
  }
  
  const absHash = Math.abs(hash).toString().padStart(12, '492018374652');
  const part1 = '4218'; // Standard Visa prefix
  const part2 = absHash.slice(0, 4);
  const part3 = absHash.slice(4, 8);
  const part4 = absHash.slice(8, 12);

  return `${part1} ${part2} ${part3} ${part4}`;
}

/**
 * Masks or unmasks a 16-digit card number based on visibility state
 * @param {string} cardNumber - 16-digit card number
 * @param {boolean} isRevealed - Whether the full number is displayed
 * @returns {string}
 */
export function maskCardNumber(cardNumber, isRevealed = false) {
  if (!cardNumber) return '•••• •••• •••• ••••';
  if (isRevealed) return cardNumber;
  
  const parts = cardNumber.split(' ');
  if (parts.length === 4) {
    return `•••• •••• •••• ${parts[3]}`;
  }
  return `•••• •••• •••• ${cardNumber.slice(-4)}`;
}

