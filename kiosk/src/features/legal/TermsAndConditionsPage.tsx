import React from 'react';
import LegalPolicyPage from '../../components/layout/LegalPolicyPage';
import { termsSections } from './policyData';

const TermsAndConditionsPage: React.FC = () => {
  return (
    <LegalPolicyPage
      badge="Legal Agreement"
      title="Terms & Conditions"
      description="Please read these terms carefully. By accessing or using our Hospital Token Management platform, you agree to comply with our billing, operational, and data service terms."
      versionText="Version: 2.1 (Production)"
      contactLabel="Contact Legal"
      contactEmail="info@ratnamsolutions.com"
      supportText="Legal Support: info@ratnamsolutions.com"
      sections={termsSections}
    />
  );
};

export default TermsAndConditionsPage;
