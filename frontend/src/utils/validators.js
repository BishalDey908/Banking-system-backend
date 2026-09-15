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
 * Validates transfer amount
 * @param {number|string} amount
 * @param {number} availableBalance
 * @returns {{ isValid: boolean, message?: string }}
 */
export function validateTransferAmount(amount, availableBalance = 0) {
  const num = Number(amount);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, message: 'Please enter a valid transfer amount greater than 0.' };
  }
  if (num > availableBalance) {
    return { isValid: false, message: 'Insufficient funds in the selected account.' };
  }
  return { isValid: true };
}

