/**
 * Validation utilities matching banking backend constraints
 */

/**
 * Validates an email address against standard RFC patterns
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  return re.test(email.trim());
}

/**
 * Validates password meets backend minimum criteria (length >= 6)
 * @param {string} password
 * @returns {{ isValid: boolean, message?: string }}
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, message: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long.' };
  }
  return { isValid: true };
}

/**
 * Validates transfer or deposit amount against business rules
 * @param {number|string} amount - User-entered amount
 * @param {number} [availableBalance] - Optional available balance constraint
 * @returns {{ isValid: boolean, message?: string }}
 */
export function validateTransferAmount(amount, availableBalance) {
  if (amount === '' || amount === null || amount === undefined) {
    return { isValid: false, message: 'Please enter a transfer amount.' };
  }

  const num = Number(amount);
  if (isNaN(num) || !isFinite(num) || num <= 0) {
    return { isValid: false, message: 'Please enter a valid amount greater than 0.' };
  }

  // Check decimal precision (banking standard: max 2 decimal places)
  const str = String(amount).trim();
  if (str.includes('.')) {
    const decimals = str.split('.')[1];
    if (decimals && decimals.length > 2) {
      return { isValid: false, message: 'Amount cannot have more than 2 decimal places.' };
    }
  }

  // Check available funds only if availableBalance is explicitly provided as a number
  if (typeof availableBalance === 'number' && !isNaN(availableBalance)) {
    const roundedAmount = Math.round((num + Number.EPSILON) * 100) / 100;
    const roundedBalance = Math.round((availableBalance + Number.EPSILON) * 100) / 100;

    if (roundedAmount > roundedBalance) {
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(roundedBalance);
      return { isValid: false, message: `Insufficient funds. Available balance is ${formatted}.` };
    }
  }

  return { isValid: true };
}

