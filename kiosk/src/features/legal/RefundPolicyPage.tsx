import React from 'react';
import LegalPolicyPage from '../../components/layout/LegalPolicyPage';
import { refundPolicySections } from './policyData';

const RefundPolicyPage: React.FC = () => {
  return (
    <LegalPolicyPage
      badge="Billing Guard"
      title="Refund & Cancellation"
      description="Transparent billing details. Read our rules on SaaS cancellations, transaction refunds, and Razorpay settlement cycles."
      versionText="Gateway: Razorpay Settled"
      contactLabel="Billing Support"
      contactEmail="billing@ratnamsolutions.com"
      supportText="Billing Support: billing@ratnamsolutions.com"
      sections={refundPolicySections}
    />
  );
};

export default RefundPolicyPage;
