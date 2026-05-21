const logger = require('../config/logger');

const sendSms = async ({ to, message }) => {
  const apiKey = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID || 'HTOKEN';

  if (!apiKey) {
    logger.info(`SMS MOCK -> ${to} | ${message}`);
    return { mocked: true };
  }

  // Replace this with your gateway integration.
  // The shape is intentionally generic so you can plug in Fast2SMS, Textlocal,
  // Twilio, MSG91, or any other provider without changing business logic.
  logger.info(`SMS DISPATCH READY -> ${to} | sender=${senderId}`);
  return { success: true, to, senderId };
};

const buildTokenCreatedSms = ({ hospitalName, tokenNumber, patientName, doctorName, roomNumber }) => {
  return [
    `Hi ${patientName || 'there'},`,
    `${hospitalName}: Token ${tokenNumber} created.`,
    `Doctor: ${doctorName}`,
    roomNumber ? `Room: ${roomNumber}` : null,
    'Please wait for your token to be called.',
  ]
    .filter(Boolean)
    .join(' ');
};

const buildTokenCalledSms = ({ hospitalName, tokenNumber, patientName, doctorName, roomNumber }) => {
  return [
    `Hi ${patientName || 'there'},`,
    `${hospitalName}: Token ${tokenNumber} is called.`,
    `Doctor: ${doctorName}`,
    roomNumber ? `Room: ${roomNumber}` : null,
    'Please go to the consultation room now.',
  ]
    .filter(Boolean)
    .join(' ');
};

module.exports = {
  sendSms,
  buildTokenCreatedSms,
  buildTokenCalledSms,
};
