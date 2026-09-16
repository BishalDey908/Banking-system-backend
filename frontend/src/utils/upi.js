/**
 * UPI Protocol and QR Code Utility Functions
 */

export const POPULAR_UPI_HANDLES = [
  '@okhdfcbank',
  '@okicici',
  '@oksbi',
  '@paytm',
  '@ybl',
  '@upi',
];

/**
 * Validates whether a string matches a standard UPI ID pattern
 * Format: username@bankname (e.g. rahul@okaxis, 9876543210@paytm)
 * @param {string} upiId
 * @returns {boolean}
 */
export function validateUpiId(upiId) {
  if (!upiId || typeof upiId !== 'string') return false;
  const regex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/;
  return regex.test(upiId.trim());
}

/**
 * Parses a raw string which could be a full UPI payment URI or plain UPI ID
 * Examples:
 * - upi://pay?pa=merchant@hdfc&pn=Coffee%20Shop&am=150.00&cu=INR&tn=Latte
 * - merchant@hdfc
 * 
 * @param {string} raw
 * @returns {{
 *   isValid: boolean,
 *   upiId: string,
 *   name: string,
 *   amount: string,
 *   currency: string,
 *   note: string
 * }}
 */
export function parseUpiUri(raw) {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, upiId: '', name: '', amount: '', currency: 'INR', note: '' };
  }

  const trimmed = raw.trim();

  // If it's a standard UPI URL
  if (trimmed.toLowerCase().startsWith('upi://pay?') || trimmed.toLowerCase().startsWith('upi://pay')) {
    try {
      const urlQuery = trimmed.includes('?') ? trimmed.split('?')[1] : '';
      const params = new URLSearchParams(urlQuery);

      const upiId = params.get('pa') || '';
      const name = params.get('pn') ? decodeURIComponent(params.get('pn')) : '';
      const amount = params.get('am') || '';
      const currency = params.get('cu') || 'INR';
      const note = params.get('tn') ? decodeURIComponent(params.get('tn')) : '';

      return {
        isValid: Boolean(upiId),
        upiId,
        name,
        amount,
        currency,
        note,
      };
    } catch {
      // fallback
    }
  }

  // Check if it's a direct UPI ID
  if (validateUpiId(trimmed)) {
    const handleName = trimmed.split('@')[0];
    const formattedName = handleName
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      isValid: true,
      upiId: trimmed,
      name: formattedName,
      amount: '',
      currency: 'INR',
      note: '',
    };
  }

  // Check if it has an @ symbol
  if (trimmed.includes('@')) {
    const handleName = trimmed.split('@')[0];
    const formattedName = handleName
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      isValid: true,
      upiId: trimmed,
      name: '',
      name: formattedName,
      amount: '',
      currency: 'INR',
      note: '',
    };
  }

  // Check if it's a 24-char hex account ObjectId
  if (/^[a-fA-F0-9]{24}$/.test(trimmed)) {
    return {
      isValid: true,
      upiId: `${trimmed}@aurabank`,
      name: 'Aura Bank Account',
      amount: '',
      currency: 'INR',
      note: '',
    };
  }

  return { isValid: false, upiId: '', name: '', amount: '', currency: 'INR', note: '' };
}

/**
 * Constructs an NPCI-compliant UPI URI for QR code generation
 * @param {Object} params
 * @param {string} params.upiId
 * @param {string} [params.name]
 * @param {string|number} [params.amount]
 * @param {string} [params.note]
 * @param {string} [params.currency='INR']
 * @returns {string}
 */
export function generateUpiUri({
  upiId,
  name = 'Aura Bank Member',
  amount = '',
  note = '',
  currency = 'INR',
}) {
  if (!upiId) return '';
  const params = new URLSearchParams();
  params.set('pa', upiId.trim());
  if (name) params.set('pn', name.trim());
  if (amount && Number(amount) > 0) params.set('am', String(Number(amount).toFixed(2)));
  params.set('cu', currency || 'INR');
  if (note) params.set('tn', note.trim());

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates an account-specific UPI ID (e.g. 660f9a...@aurabank)
 * @param {Object} account
 * @param {Object} [user]
 * @returns {string}
 */
export function getAccountUpiId(account, user) {
  if (account && account._id) {
    return `${account._id}@aurabank`;
  }
  return getUserDefaultUpiId(user);
}

/**
 * Generates a user handle UPI ID (e.g. rahul@aurabank)
 * @param {Object} user
 * @returns {string}
 */
export function getUserHandleUpiId(user) {
  return getUserDefaultUpiId(user);
}

/**
 * Generates a default user UPI handle from their profile name or email
 * @param {Object} user
 * @returns {string}
 */
export function getUserDefaultUpiId(user) {
  if (!user) return 'member@aurabank';
  if (user.email) {
    const prefix = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${prefix || 'user'}@aurabank`;
  }
  if (user.name) {
    const prefix = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${prefix || 'user'}@aurabank`;
  }
  return 'member@aurabank';
}


