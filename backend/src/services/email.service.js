const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const nodemailer = require('nodemailer');

let cachedTransporter = null;

/**
 * Resolves or creates a Nodemailer transporter.
 * Supports:
 * 1. Standard SMTP / Gmail App Password (EMAIL_USER + EMAIL_PASS)
 * 2. OAuth2 (EMAIL_USER + CLIENT_ID + CLIENT_SECRET + REFRESH_TOKEN)
 * 3. Custom SMTP (SMTP_HOST + SMTP_PORT + EMAIL_USER + EMAIL_PASS)
 * 4. Automatic Ethereal test account fallback in development (generates clickable preview URLs)
 */
async function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
  const pass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || '').trim();
  const clientId = process.env.CLIENT_ID ? process.env.CLIENT_ID.trim() : '';
  const clientSecret = process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET.trim() : '';
  const refreshToken = process.env.REFRESH_TOKEN ? process.env.REFRESH_TOKEN.trim() : '';
  const smtpHost = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : '';
  const smtpPort = process.env.SMTP_PORT;

  // 1. Gmail with OAuth2 (Prioritized if OAuth2 credentials provided)
  if (user && clientId && clientSecret && refreshToken) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user,
        clientId,
        clientSecret,
        refreshToken,
      },
    });
    console.log('[Email Service] Configured with Gmail OAuth2 account:', user);
    return cachedTransporter;
  }

  // 2. Custom SMTP server
  if (smtpHost && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort) || 587,
      secure: Number(smtpPort) === 465,
      auth: { user, pass },
    });
    console.log('[Email Service] Configured with custom SMTP host:', smtpHost);
    return cachedTransporter;
  }

  // 3. Gmail with App Password
  if (user && pass) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    console.log('[Email Service] Configured with Gmail SMTP account:', user);
    return cachedTransporter;
  }

  // 4. Fallback: Ethereal test account for local testing
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email Service] Initialized Ethereal test account: ${testAccount.user}`);
    return cachedTransporter;
  } catch (err) {
    console.warn('[Email Service] Could not connect to Ethereal, using console fallback:', err.message);
    cachedTransporter = {
      sendMail: async (options) => {
        console.log('\n================== EMAIL ALERT (LOCAL SIMULATION) ==================');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body:\n${options.text || options.html}`);
        console.log('====================================================================\n');
        return { messageId: `sim_${Date.now()}` };
      },
    };
    return cachedTransporter;
  }
}

/**
 * Sends an email safely without throwing uncaught exceptions
 */
const sendEmail = async (to, subject, text, html) => {
  if (!to) return null;

  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'alerts@aurabank.com';

    const info = await transporter.sendMail({
      from: `"Aura Bank Alerts" <${fromAddress}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[Email Service] Sent to ${to} | ID: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Service] View Test Email Preview: ${previewUrl}`);
    }

    return info;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${to}:`, error.message);
    return null;
  }
};

/**
 * Sends a welcome email upon registration
 */
async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to Aura Bank';
  const text = `Welcome to Aura Bank, ${name}! Your modern digital banking account is ready.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0f172a; margin: 0 0 6px;">Aura Bank</h2>
        <span style="font-size: 12px; color: #10b981; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Account Ready</span>
      </div>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Welcome to <strong>Aura Bank</strong>. Your modern financial account has been successfully created. You can now manage multiple currencies, send and receive money via UPI QR codes, and track instant transfers with real-time double-entry ledgers.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; font-size: 13px; color: #64748b;">If you have any questions or need assistance, our support team is available 24/7.</p>
      </div>
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 24px 0 0;">© ${new Date().getFullYear()} Aura Bank. All rights reserved.</p>
    </div>
  `;

  return sendEmail(userEmail, subject, text, html);
}

/**
 * Sends a real-time transaction alert email to the account owner
 * @param {Object} options
 * @param {string} options.userEmail
 * @param {string} options.userName
 * @param {Object} options.transaction (amount, currency, reference, type, title, note, balanceAfter, recipientName, recipientAccount, createdAt)
 * @param {Object} [options.account]
 * @param {string} [options.type] ('CREDIT' | 'DEBIT' | 'REFUND')
 */
async function sendTransactionAlertEmail({
  userEmail,
  userName = 'Valued Customer',
  transaction,
  account,
  type = 'DEBIT',
}) {
  if (!userEmail || !transaction) return;

  const isCredit = type === 'CREDIT';
  const isRefund = type === 'REFUND' || transaction.category === 'Refund';
  const currency = transaction.currency || account?.currency || 'INR';
  const formattedAmount = Number(transaction.amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const balanceAfter = Number(transaction.balanceAfter ?? account?.balance ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const accountMask = account?._id ? `•••• ${account._id.toString().slice(-4)}` : 'Bank Account';
  const dateStr = new Date(transaction.createdAt || Date.now()).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Determine Subject and Theme
  let subject = '';
  let badgeText = '';
  let badgeColor = '';
  let amountPrefix = '';

  if (isRefund) {
    subject = `Refund Alert: ${currency} ${formattedAmount} credited to ${accountMask}`;
    badgeText = 'REFUND CREDITED';
    badgeColor = '#6366f1'; // indigo
    amountPrefix = '+';
  } else if (isCredit) {
    subject = `Credit Alert: ${currency} ${formattedAmount} received in ${accountMask}`;
    badgeText = 'MONEY RECEIVED / DEPOSITED';
    badgeColor = '#10b981'; // emerald
    amountPrefix = '+';
  } else {
    subject = `Debit Alert: ${currency} ${formattedAmount} paid from ${accountMask}`;
    badgeText = 'MONEY SENT / DEBITED';
    badgeColor = '#ef4444'; // rose/red
    amountPrefix = '-';
  }

  // Plain Text Content
  const text = `
Aura Bank - Transaction Alert

Hello ${userName},

Your account ${accountMask} has been ${isCredit || isRefund ? 'credited' : 'debited'} with ${currency} ${formattedAmount} on ${dateStr}.

Transaction Details:
- Amount: ${amountPrefix}${currency} ${formattedAmount}
- Type: ${isCredit || isRefund ? 'CREDIT' : 'DEBIT'}
- Title: ${transaction.title || 'Banking Transaction'}
- Reference: ${transaction.reference || 'N/A'}
- ${transaction.recipientName ? (isCredit ? 'Sender: ' : 'Recipient: ') + transaction.recipientName : ''}
- ${transaction.recipientAccount ? 'UPI / Account: ' + transaction.recipientAccount : ''}
- Note: ${transaction.note || 'None'}
- Available Balance: ${currency} ${balanceAfter}

If you did not authorize this transaction, please immediately freeze your account or contact support.

Aura Bank Security Team
  `.trim();

  // Rich HTML Email
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
        
        <!-- Header -->
        <tr>
          <td style="background-color: #0f172a; padding: 24px 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: -0.5px;">Aura Bank</h1>
            <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">Official Transaction Notification</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 32px 32px 24px;">
            <p style="color: #334155; font-size: 15px; margin: 0 0 16px;">Dear <strong>${userName}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 24px;">
              This is to confirm that a transaction occurred on your Aura Bank account <strong>${accountMask}</strong>.
            </p>

            <!-- Hero Amount Box -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 20px; text-align: center;">
                  <span style="display: inline-block; background-color: ${badgeColor}15; color: ${badgeColor}; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 9999px; font-family: monospace; margin-bottom: 8px;">
                    ${badgeText}
                  </span>
                  <div style="font-size: 32px; font-weight: 800; color: ${isCredit || isRefund ? '#059669' : '#0f172a'}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace; letter-spacing: -0.5px;">
                    ${amountPrefix}${currency} ${formattedAmount}
                  </div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                    Available Balance: <strong style="color: #0f172a;">${currency} ${balanceAfter}</strong>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Details List -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #334155; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;">Transaction Title</td>
                <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #0f172a;">${transaction.title || 'Funds Transfer'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;">Reference ID</td>
                <td style="padding: 10px 0; font-family: monospace; font-size: 12px; text-align: right; color: #334155;">${transaction.reference || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;">Date & Time</td>
                <td style="padding: 10px 0; font-family: monospace; font-size: 12px; text-align: right; color: #334155;">${dateStr}</td>
              </tr>
              ${
                transaction.recipientName
                  ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;">${isCredit ? 'Received From' : 'Sent To'}</td>
                <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #0f172a;">${transaction.recipientName}</td>
              </tr>
              `
                  : ''
              }
              ${
                transaction.recipientAccount
                  ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;">UPI ID / Account</td>
                <td style="padding: 10px 0; font-family: monospace; font-size: 12px; text-align: right; color: #059669;">${transaction.recipientAccount}</td>
              </tr>
              `
                  : ''
              }
              ${
                transaction.note
                  ? `
              <tr>
                <td style="padding: 10px 0; color: #64748b;">Note</td>
                <td style="padding: 10px 0; text-align: right; color: #475569; font-style: italic;">"${transaction.note}"</td>
              </tr>
              `
                  : ''
              }
            </table>

            <!-- Security Advisory -->
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px; margin-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.4;">
                <strong>Security Alert:</strong> Aura Bank never asks for your password or OTP. If you did not make or authorize this transaction, please log in immediately to freeze your card or contact our fraud prevention desk.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">
              This is an automated transaction notification from Aura Bank Systems.<br>
              © ${new Date().getFullYear()} Aura Bank India. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Send asynchronously without awaiting to ensure fast response times
  return sendEmail(userEmail, subject, text, html);
}

/**
 * Sends a branded OTP email for Registration, Login, 2FA, or Password Reset
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} [options.name='Valued Customer'] - User name
 * @param {string} options.otp - 6-digit OTP code
 * @param {'REGISTER'|'LOGIN'|'2FA'|'RESET_PASSWORD'} [options.purpose='LOGIN']
 */
async function sendOtpEmail({ to, name = 'Valued Customer', otp, purpose = 'LOGIN' }) {
  if (!to || !otp) return null;

  let title = 'Verification Code';
  let subject = `Aura Bank - Verification Code (${otp})`;
  let badgeText = 'ONE-TIME PASSCODE';
  let badgeColor = '#635BFF'; // Aura Indigo
  let description = 'Please use the verification code below to verify your identity with Aura Bank.';
  let securityNote = 'This code will expire in 10 minutes. Never share this OTP with anyone, including Aura Bank support agents.';

  switch (purpose) {
    case 'REGISTER':
      title = 'Verify Your Email';
      subject = `Aura Bank - Email Verification Code (${otp})`;
      badgeText = 'ACCOUNT REGISTRATION';
      badgeColor = '#10B981'; // Emerald
      description = 'Welcome to Aura Bank! Please verify your email address to complete your registration and activate your banking account.';
      break;

    case 'LOGIN':
      title = 'Login Passcode';
      subject = `Aura Bank - One-Time Login Code (${otp})`;
      badgeText = 'PASSWORDLESS SIGN-IN';
      badgeColor = '#3B82F6'; // Blue
      description = 'We received a request to sign in to your Aura Bank account. Enter the one-time passcode below to proceed.';
      break;

    case '2FA':
      title = 'Two-Factor Authentication';
      subject = `Aura Bank - 2FA Security Code (${otp})`;
      badgeText = '2FA CHALLENGE';
      badgeColor = '#8B5CF6'; // Purple
      description = 'A login attempt was initiated for your account. Please enter this two-factor authentication code to confirm it is you.';
      break;

    case 'RESET_PASSWORD':
      title = 'Reset Your Password';
      subject = `Aura Bank - Password Reset Code (${otp})`;
      badgeText = 'SECURITY RESET';
      badgeColor = '#F97316'; // Coral / Orange
      description = 'We received a request to reset the password for your Aura Bank account. Use the code below to set up a new password.';
      securityNote = 'If you did not request a password reset, please change your password immediately or contact Aura Bank fraud support.';
      break;
  }

  // Format OTP with spaces for visual clarity (e.g. 1 2 3  4 5 6)
  const formattedOtp = String(otp).split('').join(' ');

  const text = `
Aura Bank - ${title}

Hello ${name},

${description}

Your Verification Code: ${otp}

${securityNote}

This code is valid for 10 minutes.

© ${new Date().getFullYear()} Aura Bank. All rights reserved.
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 24px 16px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
        
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Aura Bank</h1>
            <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1.5px; font-family: monospace;">Security & Authentication</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 32px 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="display: inline-block; background-color: ${badgeColor}15; color: ${badgeColor}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; font-family: monospace;">
                ${badgeText}
              </span>
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 12px 0 6px;">${title}</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                Hello <strong>${name}</strong>, ${description}
              </p>
            </div>

            <!-- OTP Highlight Card -->
            <div style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 16px; padding: 24px 16px; text-align: center; margin-bottom: 24px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px;">
                Your Verification Code
              </div>
              <div style="font-family: 'Courier New', Courier, monospace, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; margin: 0; line-height: 1.2;">
                ${otp}
              </div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 10px;">
                ⏱️ Valid for <strong>10 minutes</strong>
              </div>
            </div>

            <!-- Security Advisory -->
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px 16px;">
              <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                <strong>Security Notice:</strong> ${securityNote}
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
              This is an automated security transmission from Aura Bank Systems.<br>
              If you did not initiate this request, please ignore this email or alert our security team.<br>
              © ${new Date().getFullYear()} Aura Bank India. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail(to, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionAlertEmail,
  sendOtpEmail,
  sendEmail,
};