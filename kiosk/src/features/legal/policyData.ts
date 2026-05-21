export const privacyPolicySections = [
  {
    id: 'collection',
    title: '1. Information We Collect',
    content: `We collect information to provide a streamlined, high-quality queue routing and notification experience for hospital administrators, doctors, receptionists, and patients.

- Hospital Profiles: When registering, we collect organization names, corporate addresses, contact numbers, email configurations, and taxation documents (GSTIN).
- Healthcare Staff Accounts: Names, email logins, departments, schedules, and portal credentials of doctors and assistants created on your private hospital node.
- Patient Queue Ticketing Data: For token generation and automated notifications, we process patient names, phone numbers, and department targets. We do NOT store electronic medical records (EHR) or complex diagnostic histories.
- Secure Payment Transactions: Wallet top-up details and standard premium subscription fees are processed securely. All transactional values are routed via Razorpay under high-grade SSL encryption. We do not store credit card codes or banking passwords.`,
  },
  {
    id: 'usage',
    title: '2. How We Use Information',
    content: `The details we collect are put to use solely to operate, improve, and secure hospital token dashboards:

- To issue real-time token numbers and sync live queue displays on kiosks and clinic TVs.
- To deliver instant SMS text alerts and email updates regarding waiting times to patients and staff.
- To manage subscription package renewals, SMS wallet billing, and detailed transaction statements.
- To run diagnostic tools, solve active kiosk bugs, and perform cybersecurity audits.
- To file legal tax reports under GST and standard corporate financial regulations in India.`,
  },
  {
    id: 'security',
    title: '3. Data Security Measures',
    content: `We run enterprise-grade protective measures to ensure your hospital databases remain private and sealed:

- Standard TLS/SSL: All network traffic moving between patient kiosks, staff panels, and cloud database instances is fully encrypted in transit.
- Strong Hashing: All user accounts are secured with modern encryption (bcrypt) to avoid plaintext breaches.
- Multi-Factor Access: Access to raw production database endpoints is sealed under strictly audited administrative access tokens.
- Redundant Backups: Continuous data backups are safely housed in secure hosting centers with automated threat detection rules.`,
  },
  {
    id: 'sharing',
    title: '4. Information Sharing & Third-Parties',
    content: `Ratnam Solutions Private Limited enforces a strict policy against trading or leasing user data to advertisers or third-party brokers. We disclose data solely to specialized services essential for executing platform utilities:

- Secure Payment Gateways: Subscription processing is completed via Razorpay.
- Communications Infrastructure: Mobile queue alerts are dispatched through reliable partner channels (like AWS SES and Msg91 SMS APIs).
- Core Cloud Nodes: Databases are stored on highly compliant servers with strict NDA terms.
- Legal Declarations: Data may be shared with judicial courts if formally mandated under law.`,
  },
  {
    id: 'consent',
    title: '5. Patient Consent & Hospital Role',
    content: `Subscribing hospitals utilizing our platform act as the Data Controller, while the Company operates as the Data Processor.

The hospital warrants that it has collected necessary consent from patients before registering their contact numbers or department entries into the local kiosk for automated ticketing services.`,
  },
  {
    id: 'rights',
    title: '6. User Rights & Data Purging',
    content: `SuperAdmins can access, modify, or correct their corporate profiles and doctor listings at any time through the live settings.

We retain hospital data as long as subscription accounts are maintained. In the event of subscription termination, hospital managers can request immediate, permanent deletion of their database sharding nodes by raising a support query.`,
  },
];

export const termsSections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing, registering, or using the Hospital Token Management System ("the Service") provided by Ratnam Solutions Private Limited ("the Company," "we," "our," or "us"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not access or use the Service.

These terms apply in full to all subscribing hospitals, clinics, medical practitioners, administrators, and any other users of our platform. Any minor deviation or custom SLA must be mutually signed in writing.`,
  },
  {
    id: 'registration',
    title: '2. Registration & Account Security',
    content: `To utilize the Service, you must register for an account by providing accurate, complete, and current information as prompted. You are solely responsible for maintaining the confidentiality of your account credentials, including passwords and API keys, and for all activities that occur under your account.

You agree to notify us immediately of any unauthorized use or security breach. The Company will not be liable for any losses or operational disruptions caused by unauthorized use of your account.`,
  },
  {
    id: 'services',
    title: '3. Description of Services & Payment Terms',
    content: `The Service is a cloud-based software-as-a-service (SaaS) platform designed for hospital token management, queue optimization, patient appointments, and related real-time analytics.

Subscriptions, including top-up packages for SMS, email notification credits, and premium kiosk modules, are billed in advance as per the select plan details. Payments are processed securely via our designated payment gateways (including Razorpay). Prices are listed in Indian Rupees (INR) and are subject to applicable taxes (GST).`,
  },
  {
    id: 'delivery',
    title: '4. Service Delivery & Provisioning',
    content: `Since the Hospital Token Management System is a Software-as-a-Service (SaaS) cloud platform, all purchased licenses, kiosk nodes, doctor dashboard access, and dynamically purchased SMS/email transaction credits are delivered and provisioned entirely digitally.

- Instant Access: Standard subscription tier setups, default kiosk dashboards, and standalone SMS/email packages are activated immediately onto your hospital subdomain node upon successful checkout and payment validation.
- Custom Onboarding: For complex multi-site hospitals requesting dedicated domain mapping or local print queue configurations, digital provisioning is finalized and administrator keys dispatched via email within twenty-four (24) to forty-eight (48) hours of registration approvals.
- Zero Logistics: No physical products, CDs, hardware devices, or printed materials are shipped, and zero logistics or shipping costs are applied.`,
  },
  {
    id: 'refunds',
    title: '5. Refund & Cancellation Policy',
    content: `Subscription plans and credit top-up packages are non-refundable once purchased and provisioned to the hospital account.

Users may cancel their recurring subscriptions at any time through the billing dashboard, which will terminate renewals starting from the next billing cycle. For complete details, please refer to our dedicated Refund and Cancellation Policy page.`,
  },
  {
    id: 'data-protection',
    title: '6. Data Protection & Privacy',
    content: `The security and privacy of hospital operations and patient records are our utmost priority. The Company processes patient name, phone number, and queue status only for queue routing and real-time alerts.

All data is collected, stored, and handled in compliance with our Privacy Policy, which is incorporated into these Terms by reference. You warrant that you have obtained necessary consent from your patients to transmit their details for token processing.`,
  },
  {
    id: 'intellectual-property',
    title: '7. Intellectual Property & Prohibited Activities',
    content: `All content, source code, logos, designs, visual assets, and technology associated with the Service are the exclusive intellectual property of Ratnam Solutions Private Limited.

You are granted a limited, non-exclusive, non-transferable license to access the platform for standard business operations. You must not attempt to reverse-engineer, exploit, scrape, or perform security vulnerability testing on our servers without prior written consent.`,
  },
  {
    id: 'limitation',
    title: '8. Limitation of Liability',
    content: `To the maximum extent permitted by law, Ratnam Solutions Private Limited shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the Service, including but not limited to patient queue delays, technical downtimes, SMS gateway failures, or loss of medical records.

The Service is provided on an "AS IS" and "AS AVAILABLE" basis.`,
  },
  {
    id: 'governing-law',
    title: '9. Governing Law & Jurisdiction',
    content: `These Terms and Conditions shall be governed by and construed in accordance with the laws of India.

Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad, Telangana, India.`,
  },
];

export const refundPolicySections = [
  {
    id: 'cancellation',
    title: '1. Subscription Cancellation',
    content: `You may cancel your recurring SaaS subscription (monthly or annual plan) at any time.

- Graceful Access: Upon cancellation, your access to the Hospital Token Management dashboard, doctor queues, and kiosk modules remains fully active until the end of your current paid billing period.
- No Auto-Renewals: Once canceled, your card or bank account will not be charged automatically for any subsequent renewal cycles.
- Process: You can cancel directly via the billing section in your Admin dashboard or by sending an official email request to billing@ratnamsolutions.com.`,
  },
  {
    id: 'wallet',
    title: '2. Wallet Top-Up Packages',
    content: `Wallet top-ups (such as dedicated standalone SMS packages, email delivery bundles, or extra token slot credits) are consumed dynamically based on utility.

- Strict Non-Refundability: Once a wallet top-up package is purchased and the communication credits are provisioned to your hospital node, they are completely non-refundable.
- No Expiry Option: Standard SMS/email packages purchased as standalone top-ups do not expire as long as your base SaaS account remains in good standing.`,
  },
  {
    id: 'saas-refunds',
    title: '3. Standard SaaS Refund Rules',
    content: `As our system provisions dedicated database shards, customized hospital token subdomains, and instant API gateways immediately upon payment confirmation, we enforce a standard "No Refund" policy on active subscription terms.

- Exceptional Cases: A refund may be considered only if there is a verified platform-wide technical failure or bug that prevents your hospital from generating tokens, and our development team fails to resolve the issue within seven (7) business days of written escalation.
- Trial Recommendation: We highly encourage hospitals to request a live demo or utilize free trials before subscribing to standard premium plans.`,
  },
  {
    id: 'timeline',
    title: '4. Refund Processing Timeline',
    content: `In the rare event that a refund is approved by our management team:

- Settlement: The refund will be settled back to your original source of payment (credit card, debit card, UPI, or net banking account) used during checkout.
- Channel: All transactions are securely reversed through our gateway partner (Razorpay).
- Timeframe: Approved refunds will be initiated within three (3) business days, and typically reflect in your bank account or card statement within five to seven (5-7) business days, subject to standard banking settlement cycles.`,
  },
];
