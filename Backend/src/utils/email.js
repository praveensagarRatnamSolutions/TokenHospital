const logger = require('../config/logger');
const nodemailer = require('nodemailer');

console.log('Email configuration:', {
  emailFrom: process.env.EMAIL_FROM || 'not set',
  host: process.env.SMTP_HOST || 'not set',
  port: process.env.SMTP_PORT || 'not set',
  user: process.env.SMTP_USER || 'not set',
  pass: process.env.SMTP_PASS || 'not set',
  secure: process.env.SMTP_SECURE || 'not set',
});

const DEFAULT_FROM =
  process.env.EMAIL_FROM || 'Hospital Token <no-reply@hospitaltoken.com>';

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user, pass },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  if (!transporter) {
    logger.info(`EMAIL MOCK -> ${to} | ${subject}`);
    return { mocked: true };
  }

  return transporter.sendMail({
    from: DEFAULT_FROM,
    to,
    subject,
    text,
    html,
  });
};

const buildDoctorWelcomeEmail = ({
  hospitalName,
  doctorName,
  email,
  temporaryPassword,
  loginUrl,
  hospitalLogo,
}) => {
  const subject = `Welcome to ${hospitalName} - Your Doctor Account`;
  const safeLoginUrl = loginUrl || 'https://hospitaltoken.com/login';
  const logoBlock = hospitalLogo
    ? `<img src="${process.env.CLOUDFRONT_URL}/${hospitalLogo}" alt="${hospitalName} logo" style="display:block;width:56px;height:56px;object-fit:contain;border-radius:16px;background:#fff;padding:8px;margin-bottom:16px;border:1px solid rgba(255,255,255,.18);" />`
    : '';

  const html = `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:680px;margin:0 auto;padding:32px 16px;">
        <div style="background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);border-radius:24px 24px 0 0;padding:28px 32px;color:#fff;">
          ${logoBlock}
          <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;opacity:.75;font-weight:700;">Hospital Token Platform</div>
          <h1 style="margin:12px 0 0;font-size:30px;line-height:1.1;">Doctor account created</h1>
          <p style="margin:12px 0 0;font-size:15px;line-height:1.7;max-width:520px;opacity:.92;">Your doctor account is ready. Use the credentials below to sign in and start managing patients.</p>
        </div>

        <div style="background:#ffffff;padding:32px;border-radius:0 0 24px 24px;box-shadow:0 10px 30px rgba(15,23,42,.08);border:1px solid #e2e8f0;border-top:none;">
          <div style="padding:20px 22px;border:1px solid #dbe4f0;border-radius:18px;background:#f8fbff;margin-bottom:24px;">
            <div style="font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Doctor</div>
            <div style="font-size:22px;font-weight:800;margin-top:6px;color:#0f172a;">${doctorName}</div>
            <div style="font-size:14px;color:#334155;margin-top:6px;">Hospital: <strong>${hospitalName}</strong></div>
          </div>

          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0 12px;">
            <tr>
              <td style="width:170px;font-size:13px;font-weight:700;color:#64748b;">Login email</td>
              <td style="font-size:15px;font-weight:600;color:#0f172a;">${email}</td>
            </tr>
            <tr>
              <td style="width:170px;font-size:13px;font-weight:700;color:#64748b;">Temporary password</td>
              <td style="font-size:15px;font-weight:700;color:#0f172a;letter-spacing:.04em;">${temporaryPassword}</td>
            </tr>
            <tr>
              <td style="width:170px;font-size:13px;font-weight:700;color:#64748b;">Sign in</td>
              <td style="font-size:15px;font-weight:600;"><a href="${safeLoginUrl}" style="color:#2563eb;text-decoration:none;">${safeLoginUrl}</a></td>
            </tr>
          </table>

          <div style="margin-top:28px;padding:18px 20px;border-radius:16px;background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a;font-size:14px;line-height:1.7;">
            Please sign in and change your password immediately after first login.
          </div>

          <div style="margin-top:28px;font-size:12px;line-height:1.6;color:#64748b;">
            This is an automated message from Hospital Token Platform. If you were not expecting this email, contact your administrator.
          </div>
        </div>
      </div>
    </div>
  `;

  const text = [
    `Doctor account created for ${doctorName}`,
    `Hospital: ${hospitalName}`,
    `Login email: ${email}`,
    `Temporary password: ${temporaryPassword}`,
    `Sign in: ${safeLoginUrl}`,
    '',
    'Please change your password immediately after first login.',
  ].join('\n');

  return { subject, text, html };
};

const sendOnboardingEmail = async ({
  to,
  hospitalName,
  adminName,
  tempPassword,
  invoiceLink,
}) => {
  try {
    const subject = 'Welcome to Hospital Token System!';
    const text = [
      `Dear ${adminName},`,
      '',
      `Welcome to the Hospital Token Platform! Your facility "${hospitalName}" has been successfully onboarded.`,
      '',
      'Administrator Login Credentials:',
      'URL: https://hospitaltoken.com/admin/login',
      `Email: ${to}`,
      `Temporary Password: ${tempPassword}`,
      '',
      'Please change your password upon your first login.',
      invoiceLink ? '' : null,
      invoiceLink ? `Subscription payment link: ${invoiceLink}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const html = `
      <p>Dear ${adminName},</p>
      <p>Welcome to the Hospital Token Platform! Your facility "<strong>${hospitalName}</strong>" has been successfully onboarded.</p>
      <p><strong>Administrator Login Credentials</strong><br />
      URL: <a href="https://hospitaltoken.com/admin/login">https://hospitaltoken.com/admin/login</a><br />
      Email: ${to}<br />
      Temporary Password: ${tempPassword}</p>
      <p>Please change your password upon your first login.</p>
      ${invoiceLink ? `<p><strong>Subscription Payment Link:</strong><br /><a href="${invoiceLink}" style="color:#2563eb;text-decoration:none;font-weight:600;">${invoiceLink}</a></p>` : ''}
    `;

    await sendEmail({ to, subject, text, html });
    console.log('✅ Onboarding email sent:', {
      to,
      hospitalName,
      hasPaymentLink: !!invoiceLink,
      paymentLink: invoiceLink || 'N/A',
    });
    return true;
  } catch (error) {
    logger.error('Failed to send onboarding email:', error);
    throw error;
  }
};

const sendPriceChangeNoticeEmail = async ({
  to,
  hospitalName,
  planName,
  billingCycle,
  currentAmount,
  newAmount,
  currency = 'INR',
  effectiveDate,
}) => {
  const formattedDate = new Date(effectiveDate).toLocaleDateString('en-IN', {
    dateStyle: 'long',
  });
  const money = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const subject = `Upcoming ${planName} price change`;
  const text = [
    `Hello ${hospitalName},`,
    '',
    `We are writing to let you know that the ${planName} (${billingCycle}) subscription price will change from ${money(currentAmount)} to ${money(newAmount)} starting ${formattedDate}.`,
    '',
    'Your current access continues normally until then. You can review your billing page for renewal options before the change takes effect.',
    '',
    'Thank you for using Hospital Token Platform.',
  ].join('\n');

  const html = `
    <p>Hello <strong>${hospitalName}</strong>,</p>
    <p>We are writing to let you know that the <strong>${planName}</strong> (${billingCycle}) subscription price will change from <strong>${money(currentAmount)}</strong> to <strong>${money(newAmount)}</strong> starting <strong>${formattedDate}</strong>.</p>
    <p>Your current access continues normally until then. You can review your billing page for renewal options before the change takes effect.</p>
    <p>Thank you for using Hospital Token Platform.</p>
  `;

  return sendEmail({ to, subject, text, html });
};

const sendApprovalRequestEmail = async ({
  to,
  adminName,
  doctorName,
  itemName,
  itemType,
}) => {
  try {
    const subject = `Approval Required: New ${itemType} Created`;
    const text = [
      `Dear ${adminName || 'Administrator'},`,
      '',
      `A new ${itemType} titled "${itemName}" has been created/updated by Doctor ${doctorName} and is pending your approval.`,
      '',
      `Please log in to the administrator dashboard to approve or reject this request.`,
      '',
      `Thank you,`,
      `Hospital Token Platform`,
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;padding:20px;color:#0f172a;">
        <h2 style="color:#2563eb;">Approval Required</h2>
        <p>Dear ${adminName || 'Administrator'},</p>
        <p>A new <strong>${itemType}</strong> titled "<strong>${itemName}</strong>" has been created/updated by <strong>Doctor ${doctorName}</strong> and requires your review.</p>
        <p>Please log in to the administrator dashboard to approve or reject this request.</p>
        <br/>
        <p style="font-size:12px;color:#64748b;">This is an automated notification from the Hospital Token Platform.</p>
      </div>
    `;

    await sendEmail({ to, subject, text, html });
    return true;
  } catch (error) {
    logger.error('Failed to send approval request email:', error);
  }
};

const sendApprovalResultEmail = async ({
  to,
  doctorName,
  itemName,
  itemType,
  status,
  reason,
}) => {
  try {
    const isApproved = status === 'accepted';
    const subject = `${itemType} Approval Decision: ${isApproved ? 'Approved' : 'Rejected'}`;
    const text = [
      `Dear Doctor ${doctorName},`,
      '',
      `Your request to deploy the ${itemType} "${itemName}" has been ${status}.`,
      !isApproved && reason ? `Reason for rejection: ${reason}` : null,
      '',
      `Thank you,`,
      `Hospital Token Platform`,
    ].filter(Boolean).join('\n');

    const statusColor = isApproved ? '#16a34a' : '#dc2626';

    const html = `
      <div style="font-family:Arial,sans-serif;padding:20px;color:#0f172a;">
        <h2 style="color:${statusColor};">${itemType} ${isApproved ? 'Approved' : 'Rejected'}</h2>
        <p>Dear Doctor ${doctorName},</p>
        <p>Your request to deploy the <strong>${itemType}</strong> "<strong>${itemName}</strong>" has been <strong style="color:${statusColor}; text-transform:uppercase;">${status}</strong>.</p>
        ${!isApproved && reason ? `<div style="padding:15px;background:#fef2f2;border:1px solid #fee2e2;border-radius:8px;color:#991b1b;margin-top:15px;"><strong>Reason for Rejection:</strong> ${reason}</div>` : ''}
        <br/>
        <p style="font-size:12px;color:#64748b;">This is an automated notification from the Hospital Token Platform.</p>
      </div>
    `;

    await sendEmail({ to, subject, text, html });
    return true;
  } catch (error) {
    logger.error('Failed to send approval result email:', error);
  }
};

module.exports = {
  sendEmail,
  buildDoctorWelcomeEmail,
  sendOnboardingEmail,
  sendPriceChangeNoticeEmail,
  sendApprovalRequestEmail,
  sendApprovalResultEmail,
};
