const nodemailer = require('nodemailer');
const { config } = require('../config/env');
const logger = require('../utils/logger');

// ── Create transporter ─────────────────────────────────────────────────────
const createTransporter = () => {
  // Development: use Ethereal (test SMTP) or Mailtrap
  if (config.env === 'development' || !config.smtpHost) {
    return nodemailer.createTransport({
      host: config.smtpHost || 'smtp.ethereal.email',
      port: config.smtpPort || 587,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  // Production: SendGrid / AWS SES
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort || 587,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
};

// ── Email template builder ─────────────────────────────────────────────────
const buildTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1d4ed8, #7c3aed); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px; color: #374151; line-height: 1.6; }
    .body h2 { color: #111827; font-size: 20px; margin-top: 0; }
    .btn { display: inline-block; background: #1d4ed8; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Udaan 🚀</h1>
      <p>Mentorship & Community Platform</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Udaan Platform. All rights reserved.</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
`;

// ── Send email helper ──────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Udaan Platform" <${config.emailFrom || 'noreply@udaan.in'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    // Don't throw — email failure shouldn't break the main flow
    return { success: false, error: error.message };
  }
};

// ── Email templates ────────────────────────────────────────────────────────

const sendWelcomeEmail = async (user) => {
  const html = buildTemplate('Welcome to Udaan!', `
    <h2>Welcome to Udaan, ${user.name}! 🎉</h2>
    <p>We're so excited to have you on board. Udaan is a mentorship and community platform built for Dalit students and professionals.</p>
    <p>Here's what you can do next:</p>
    <ul>
      <li>Complete your profile to get discovered by mentors</li>
      <li>Explore expert mentors in your field</li>
      <li>Join the community forum and share your story</li>
      <li>Access our curated resource library</li>
    </ul>
    <a href="${config.frontendUrl}/dashboard" class="btn">Get Started →</a>
    <hr class="divider">
    <p><small>If you have any questions, reply to this email or visit our help center.</small></p>
  `);
  return sendEmail({ to: user.email, subject: 'Welcome to Udaan! 🚀', html });
};

const sendVerificationEmail = async (user, verificationUrl) => {
  const html = buildTemplate('Verify Your Email', `
    <h2>Verify your email address</h2>
    <p>Hi ${user.name}, thanks for joining Udaan! Please verify your email address to unlock all features.</p>
    <p>Click the button below to verify your email:</p>
    <a href="${verificationUrl}" class="btn">Verify Email Address</a>
    <p><small>This link expires in 24 hours. If you didn't create an account, please ignore this email.</small></p>
    <p><small>Or copy this URL: <code>${verificationUrl}</code></small></p>
  `);
  return sendEmail({
    to: user.email,
    subject: 'Verify your Udaan email address',
    html,
  });
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = buildTemplate('Reset Your Password', `
    <h2>Reset your password</h2>
    <p>Hi ${user.name}, you requested a password reset for your Udaan account.</p>
    <p>Click the button below to set a new password:</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p><small>⚠️ This link expires in <strong>1 hour</strong>. If you didn't request a reset, please ignore this email.</small></p>
    <p><small>Or copy this URL: <code>${resetUrl}</code></small></p>
  `);
  return sendEmail({
    to: user.email,
    subject: 'Reset your Udaan password',
    html,
  });
};

const sendMentorshipRequestEmail = async (expert, seeker, request) => {
  const html = buildTemplate('New Mentorship Request', `
    <h2>New Mentorship Request! 🌟</h2>
    <p>Hi ${expert.name}, <strong>${seeker.name}</strong> has sent you a mentorship request on Udaan.</p>
    <p><strong>Topic:</strong> ${request.topic}</p>
    <p><strong>Message:</strong> ${request.message}</p>
    <a href="${config.frontendUrl}/dashboard/requests" class="btn">View Request →</a>
    <p><small>Please respond within 7 days. The request will expire after that.</small></p>
  `);
  return sendEmail({
    to: expert.email,
    subject: `New mentorship request from ${seeker.name}`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMentorshipRequestEmail,
};
