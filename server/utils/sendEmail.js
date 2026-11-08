const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass && user !== 'test_user') {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    } else {
      // In development or when SMTP is not configured, simulate by logging to console
      transporter = {
        sendMail: async (options) => {
          console.log('\n================== [EMAIL SIMULATION] ==================');
          console.log(`To:      ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          if (options.text) console.log(`Body:    ${options.text}`);
          console.log('========================================================\n');
          return { messageId: `simulated-${Date.now()}` };
        }
      };
    }
  }
  return transporter;
};

/**
 * Send 6-digit OTP verification email with modern HTML styling
 */
const sendOtpEmail = async (email, name, otp, purpose = 'Email Verification') => {
  try {
    const mailer = getTransporter();
    const fromAddress = process.env.ADMIN_EMAIL || 'no-reply@petitionsystem.org';

    const mailOptions = {
      from: `"Petition Pulse Security" <${fromAddress}>`,
      to: email,
      subject: `Your ${purpose} Code: ${otp}`,
      text: `Hello ${name || 'User'},\n\nYour one-time verification code is: ${otp}.\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
            .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { background: #2563eb; color: #ffffff; padding: 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
            .content { padding: 32px 24px; text-align: center; }
            .otp-box { font-size: 32px; letter-spacing: 8px; font-weight: 800; color: #1e40af; background: #eff6ff; border: 2px dashed #93c5fd; padding: 16px 24px; border-radius: 8px; display: inline-block; margin: 20px 0; }
            .notice { font-size: 14px; color: #64748b; line-height: 1.5; }
            .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>Petition Pulse Security</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">Hello <strong>${name || 'Citizen'}</strong>,</p>
              <p class="notice">Use the one-time password (OTP) below to complete your <strong>${purpose}</strong>.</p>
              <div class="otp-box">${otp}</div>
              <p class="notice">
                ⏳ This code expires in <strong>10 minutes</strong>.<br>
                🔒 Never share this code with anyone. We will never ask for your code.
              </p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Petition Pulse Platform. Automated security transmission.
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await mailer.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Error] Failed to send OTP email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send alert email to ADMIN_EMAIL when a new protest is created
 */
const sendAdminProtestNotification = async (protest, creator) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@petitionsystem.org';
    const mailer = getTransporter();

    const mailOptions = {
      from: `"Petition Pulse System" <no-reply@petitionsystem.org>`,
      to: adminEmail,
      subject: `[Review Required] New Protest Created: "${protest.title}"`,
      text: `A new protest titled "${protest.title}" was submitted by ${creator.name} (${creator.email}) and is pending review.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2563eb;">New Protest Submitted for Review</h2>
          <p>A new civic protest has been submitted and is currently in <strong>pending</strong> status.</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <p><strong>Title:</strong> ${protest.title}</p>
            <p><strong>Authority:</strong> ${protest.concernedAuthority}</p>
            <p><strong>Creator:</strong> ${creator.name} (${creator.email})</p>
          </div>
          <p style="font-size: 13px; color: #64748b;">Log in to the Admin Dashboard to review and approve or reject this submission.</p>
        </div>
      `
    };

    const info = await mailer.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Error] Failed to send admin notification:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpEmail,
  sendAdminProtestNotification
};

