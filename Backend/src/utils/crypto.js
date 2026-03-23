const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

/**
 * Encrypts sensitive text using AES-256-GCM
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text in format iv:authTag:encryptedText
 */
const encrypt = (text) => {
  if (!text) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts sensitive text using AES-256-GCM
 * @param {string} encryptedData - The encrypted text in format iv:authTag:encryptedText
 * @returns {string} - The decrypted text
 */
const decrypt = (encryptedData) => {
  if (!encryptedData || !encryptedData.includes(':')) return encryptedData;
  
  try {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return encryptedData; // Return as is if decryption fails
  }
};

module.exports = {
  encrypt,
  decrypt,
};
