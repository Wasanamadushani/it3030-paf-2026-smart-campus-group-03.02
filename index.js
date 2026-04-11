require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const PasswordResetOtp = require("./models/PasswordResetOtp");
const { sendOtpEmail } = require("./services/emailService");

require("./config/passport");

const app = express();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);
const maxOtpAttempts = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const passwordMinLength = Number(process.env.PASSWORD_MIN_LENGTH || 8);
const otpSecret = process.env.OTP_SECRET || process.env.SESSION_SECRET || "otp-fallback-secret";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashValue(value) {
  return crypto.createHmac("sha256", otpSecret).update(value).digest("hex");
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

// DB CONNECT
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use(cors({
  origin: [
    frontendUrl,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
  credentials: true,
}));

app.use(express.json());

// SESSION
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// HOME
app.get("/", (req, res) => {
  res.send("<a href='/auth/google'>Login with Google</a>");
});

// GOOGLE LOGIN
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// CALLBACK
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const params = new URLSearchParams({
      auth: "success",
      fullName: req.user?.name || "Customer",
      email: req.user?.email || "",
      profilePic: req.user?.profilePic || "",
      role: "CUSTOMER",
    });
    res.redirect(`${frontendUrl}/?${params.toString()}`);
  }
);

// PROFILE (protected)
app.get("/profile", (req, res) => {
  if (!req.user) return res.redirect("/");

  res.send(`
    <h1>Welcome ${req.user.name}</h1>
    <p>${req.user.email}</p>
    <img src="${req.user.profilePic}" width="100"/>
    <br><br>
    <a href="/logout">Logout</a>
  `);
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// REQUEST PASSWORD RESET OTP
const requestForgotPasswordOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Generic response to reduce account enumeration risk.
      return res.status(200).json({
        message: "If an account exists for this email, an OTP has been sent.",
      });
    }

    await PasswordResetOtp.deleteMany({ userId: user._id, used: false });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);

    await PasswordResetOtp.create({
      userId: user._id,
      email,
      otpHash: hashValue(otp),
      expiresAt,
    });

    await sendOtpEmail({
      to: email,
      otp,
      expiresInMinutes: otpExpiryMinutes,
    });

    return res.status(200).json({
      message: "If an account exists for this email, an OTP has been sent.",
      expiresInMinutes: otpExpiryMinutes,
    });
  } catch (error) {
    console.error("Forgot password request failed:", error);
    return res.status(500).json({ message: "Unable to process request right now." });
  }
};

app.post("/auth/forgot-password/request", requestForgotPasswordOtp);
app.post("/api/auth/forgot-password/send-code", requestForgotPasswordOtp);

// VERIFY PASSWORD RESET OTP
app.post("/auth/forgot-password/verify", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be a 6-digit code." });
    }

    const otpRecord = await PasswordResetOtp.findOne({
      email,
      used: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "No OTP request found for this email." });
    }

    if (otpRecord.attemptCount >= maxOtpAttempts) {
      return res.status(429).json({ message: "Too many invalid attempts. Request a new OTP." });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const isOtpValid = hashValue(otp) === otpRecord.otpHash;

    if (!isOtpValid) {
      otpRecord.attemptCount += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP.",
        attemptsLeft: Math.max(0, maxOtpAttempts - otpRecord.attemptCount),
      });
    }

    const resetToken = generateResetToken();
    otpRecord.verifiedAt = new Date();
    otpRecord.resetTokenHash = hashValue(resetToken);
    otpRecord.resetTokenExpiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
    await otpRecord.save();

    return res.status(200).json({
      message: "OTP verified successfully.",
      resetToken,
      resetTokenExpiresInMinutes: otpExpiryMinutes,
    });
  } catch (error) {
    console.error("OTP verification failed:", error);
    return res.status(500).json({ message: "Unable to verify OTP right now." });
  }
});

app.post("/api/auth/forgot-password/verify", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be a 6-digit code." });
    }

    const otpRecord = await PasswordResetOtp.findOne({
      email,
      used: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "No OTP request found for this email." });
    }

    if (otpRecord.attemptCount >= maxOtpAttempts) {
      return res.status(429).json({ message: "Too many invalid attempts. Request a new OTP." });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const isOtpValid = hashValue(otp) === otpRecord.otpHash;

    if (!isOtpValid) {
      otpRecord.attemptCount += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP.",
        attemptsLeft: Math.max(0, maxOtpAttempts - otpRecord.attemptCount),
      });
    }

    const resetToken = generateResetToken();
    otpRecord.verifiedAt = new Date();
    otpRecord.resetTokenHash = hashValue(resetToken);
    otpRecord.resetTokenExpiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
    await otpRecord.save();

    return res.status(200).json({
      message: "OTP verified successfully.",
      resetToken,
      resetTokenExpiresInMinutes: otpExpiryMinutes,
    });
  } catch (error) {
    console.error("OTP verification failed:", error);
    return res.status(500).json({ message: "Unable to verify OTP right now." });
  }
});

// RESET PASSWORD AFTER OTP VERIFICATION
const resetForgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const resetToken = String(req.body?.resetToken || "").trim();
    const verificationCode = String(req.body?.verificationCode || "").trim();
    const newPassword = String(req.body?.newPassword || "");
    const confirmPassword = String(req.body?.confirmPassword || "");

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (newPassword.length < passwordMinLength) {
      return res.status(400).json({
        message: `Password must be at least ${passwordMinLength} characters long.`,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    let otpRecord = null;

    if (resetToken) {
      otpRecord = await PasswordResetOtp.findOne({
        email,
        used: false,
        resetTokenHash: hashValue(resetToken),
        resetTokenExpiresAt: { $gt: new Date() },
        verifiedAt: { $ne: null },
      }).sort({ createdAt: -1 });
    } else if (verificationCode) {
      if (!/^\d{6}$/.test(verificationCode)) {
        return res.status(400).json({ message: "Verification code must be a 6-digit code." });
      }

      otpRecord = await PasswordResetOtp.findOne({
        email,
        used: false,
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return res.status(400).json({ message: "No OTP request found for this email." });
      }

      if (otpRecord.attemptCount >= maxOtpAttempts) {
        return res.status(429).json({ message: "Too many invalid attempts. Request a new OTP." });
      }

      if (otpRecord.expiresAt.getTime() < Date.now()) {
        return res.status(400).json({ message: "OTP has expired. Please request a new one." });
      }

      const isOtpValid = hashValue(verificationCode) === otpRecord.otpHash;

      if (!isOtpValid) {
        otpRecord.attemptCount += 1;
        await otpRecord.save();

        return res.status(400).json({
          message: "Invalid verification code.",
          attemptsLeft: Math.max(0, maxOtpAttempts - otpRecord.attemptCount),
        });
      }
    } else {
      return res.status(400).json({
        message: "Missing reset token or verification code.",
      });
    }

    if (!otpRecord) {
      return res.status(400).json({ message: "Reset session is invalid or expired." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const updatedUser = await User.findByIdAndUpdate(
      otpRecord.userId,
      { passwordHash },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    otpRecord.used = true;
    otpRecord.otpHash = "used";
    otpRecord.resetTokenHash = null;
    otpRecord.resetTokenExpiresAt = null;
    await otpRecord.save();

    return res.status(200).json({
      message: "Password reset successful.",
      redirectTo: `${frontendUrl}/login`,
    });
  } catch (error) {
    console.error("Password reset failed:", error);
    return res.status(500).json({ message: "Unable to reset password right now." });
  }
};

app.post("/auth/forgot-password/reset", resetForgotPassword);
app.post("/api/auth/forgot-password/reset", resetForgotPassword);

// START SERVER
app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
