const nodemailer = require('nodemailer');

let transporter = null;

// Lazy initialization of transporter
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
      // In development or when credentials are not configured, use a mock logger
      transporter = {
        sendMail: async (options) => {
          console.log(`[Email Simulation] To: ${options.to} | Subject: "${options.subject}"`);
          return { messageId: `mock-${Date.now()}` };
        }
      };
    }
  }
  return transporter;
};

/**
 * Send a welcome email when a user registers
 */
const sendWelcomeEmail = async (user) => {
  try {
    const mailer = getTransporter();
    const fromAddress = process.env.ADMIN_EMAIL || 'support@petitionsystem.org';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    await mailer.sendMail({
      from: `"Petition Platform" <${fromAddress}>`,
      to: user.email,
      subject: 'Welcome to Petition Voting System! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2563eb;">Welcome, ${user.name}!</h2>
          <p>Thank you for joining the <strong>Petition Voting System</strong>. You can now start creating petitions for causes you care about and signing petitions created by others.</p>
          <div style="margin: 25px 0;">
            <a href="${clientUrl}/petitions" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Browse Petitions
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px;">If you have any questions or feedback, reach out to us at ${fromAddress}.</p>
        </div>
      `
    });
  } catch (error) {
    console.error(`[Email Service] Failed to send welcome email to ${user.email}:`, error.message);
  }
};

/**
 * Send confirmation when a user signs a petition
 */
const sendSignatureConfirmationEmail = async (user, petition) => {
  try {
    const mailer = getTransporter();
    const fromAddress = process.env.ADMIN_EMAIL || 'support@petitionsystem.org';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    await mailer.sendMail({
      from: `"Petition Platform" <${fromAddress}>`,
      to: user.email,
      subject: `Thank you for signing: ${petition.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #059669;">Your Signature Has Been Recorded!</h2>
          <p>Hi ${user.name}, thank you for supporting:</p>
          <blockquote style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; margin: 15px 0; font-size: 16px; font-style: italic;">
            "${petition.title}"
          </blockquote>
          <p>This petition currently has <strong>${petition.currentSignatures}</strong> of <strong>${petition.targetSignatures}</strong> signatures.</p>
          <div style="margin: 25px 0;">
            <a href="${clientUrl}/petitions/${petition._id}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Petition & Share
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px;">Sharing this petition with your friends and community can help it reach its goal faster!</p>
        </div>
      `
    });
  } catch (error) {
    console.error(`[Email Service] Failed to send signature email:`, error.message);
  }
};

/**
 * Send notification to creator when signature target is reached
 */
const sendGoalReachedEmail = async (creator, petition) => {
  try {
    const mailer = getTransporter();
    const fromAddress = process.env.ADMIN_EMAIL || 'support@petitionsystem.org';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    await mailer.sendMail({
      from: `"Petition Platform" <${fromAddress}>`,
      to: creator.email,
      subject: `🎉 Milestone Reached: "${petition.title}" hit its goal!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #7c3aed;">Congratulations ${creator.name}!</h2>
          <p>Your petition <strong>"${petition.title}"</strong> has successfully reached its target of <strong>${petition.targetSignatures}</strong> signatures!</p>
          <div style="margin: 25px 0;">
            <a href="${clientUrl}/petitions/${petition._id}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Petition & Post an Update
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px;">Keep your supporters informed by posting an official update on your campaign page.</p>
        </div>
      `
    });
  } catch (error) {
    console.error(`[Email Service] Failed to send milestone email:`, error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendSignatureConfirmationEmail,
  sendGoalReachedEmail
};
