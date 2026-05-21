import React from 'react';
import LegalPolicyPage from '../../components/layout/LegalPolicyPage';
import { privacyPolicySections } from './policyData';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalPolicyPage
      badge="Privacy Guard"
      title="Privacy Policy"
      description="We value your trust. Understand exactly how we collect, secure, shard, and process your institutional and patient information."
      versionText="Version: 2.0 (Security Audited)"
      contactLabel="Data Officer"
      contactEmail="privacy@ratnamsolutions.com"
      supportText="Data Grievance: privacy@ratnamsolutions.com"
      sections={privacyPolicySections}
    />
  );
};

export default PrivacyPolicyPage;
