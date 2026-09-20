const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ["REGISTER", "LOGIN", "2FA", "RESET_PASSWORD"],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // MongoDB TTL index: automatically deletes document after 10 minutes (600s)
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Verify candidate plain OTP against hashed OTP
 */
otpSchema.methods.verifyOtp = async function (candidateOtp) {
  if (Date.now() > this.expiresAt.getTime()) {
    return false;
  }
  return await bcrypt.compare(String(candidateOtp), this.otp);
};

/**
 * Static method to generate, hash, and store an OTP
 * Returns the unhashed 6-digit OTP for email transmission
 */
otpSchema.statics.generateOtp = async function ({ email, purpose, ttlMinutes = 10 }) {
  // Generate cryptographically random 6-digit number between 100000 and 999999
  const plainOtp = crypto.randomInt(100000, 1000000).toString();

  // Delete any existing active OTP for this email and purpose to prevent collisions
  await this.deleteMany({ email: email.toLowerCase(), purpose });

  // Hash OTP before storing for maximum security
  const hashedOtp = await bcrypt.hash(plainOtp, 10);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await this.create({
    email: email.toLowerCase(),
    otp: hashedOtp,
    purpose,
    expiresAt,
  });

  return plainOtp;
};

/**
 * Static method to verify and invalidate an OTP
 */
otpSchema.statics.verifyAndConsumeOtp = async function ({ email, purpose, candidateOtp }) {
  const record = await this.findOne({
    email: email.toLowerCase(),
    purpose,
  }).sort({ createdAt: -1 });

  if (!record) {
    return { valid: false, message: "No active OTP found or code has expired." };
  }

  if (Date.now() > record.expiresAt.getTime()) {
    await this.deleteOne({ _id: record._id });
    return { valid: false, message: "OTP has expired. Please request a new code." };
  }

  const isMatch = await bcrypt.compare(String(candidateOtp), record.otp);
  if (!isMatch) {
    return { valid: false, message: "Invalid OTP code. Please check and try again." };
  }

  // Invalidate OTP after single use
  await this.deleteOne({ _id: record._id });
  return { valid: true, message: "OTP verified successfully." };
};

const otpModel = mongoose.model("otp", otpSchema);

module.exports = otpModel;

