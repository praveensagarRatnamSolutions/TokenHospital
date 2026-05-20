const logger = require('../config/logger');

/**
 * Mock Email Utility
 * In production, this would be wired up to Nodemailer, SendGrid, AWS SES, etc.
 */
const sendOnboardingEmail = async ({ to, hospitalName, adminName, tempPassword, invoiceLink }) => {
  try {
    logger.info(`=========================================`);
    logger.info(`📧 EMAIL DISPATCHED TO: ${to}`);
    logger.info(`SUBJECT: Welcome to Hospital Token System!`);
    logger.info(`=========================================`);
    logger.info(`Dear ${adminName},`);
    logger.info(`\nWelcome to the Hospital Token Platform! Your facility "${hospitalName}" has been successfully onboarded.`);
    logger.info(`\nHere are your Administrator Login Credentials:`);
    logger.info(`URL: https://hospitaltoken.com/admin/login`);
    logger.info(`Email: ${to}`);
    logger.info(`Temporary Password: ${tempPassword}`);
    logger.info(`\n* Please change your password upon your first login.`);
    
    if (invoiceLink) {
      logger.info(`\n💳 Subscription Invoice Generation`);
      logger.info(`To activate your selected plan, please complete the payment using the secure link below:`);
      logger.info(`Payment Link: ${invoiceLink}`);
    }
    
    logger.info(`=========================================`);

    // In a real scenario: await transporter.sendMail(...)
    return true;
  } catch (error) {
    logger.error('Failed to send onboarding email:', error);
    throw error;
  }
};

module.exports = {
  sendOnboardingEmail,
};
