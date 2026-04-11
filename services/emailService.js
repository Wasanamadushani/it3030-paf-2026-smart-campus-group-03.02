const nodemailer = require("nodemailer");

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

function hasSmtpConfig() {
  return Boolean(smtpHost && smtpPort && smtpUser && smtpPass);
}

function createTransporter() {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

async function sendOtpEmail({ to, otp, expiresInMinutes }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(
      `[DEV OTP] Email config missing. OTP for ${to}: ${otp} (expires in ${expiresInMinutes} minutes)`
    );
    return;
  }

  const fromAddress = process.env.SMTP_FROM || smtpUser;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: "Your Password Reset OTP",
    text: `Your OTP is ${otp}. It expires in ${expiresInMinutes} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.4;">
        <h2>Password Reset Request</h2>
        <p>Use the following one-time password (OTP) to reset your password:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</p>
        <p>This OTP expires in ${expiresInMinutes} minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = {
  sendOtpEmail,
};
