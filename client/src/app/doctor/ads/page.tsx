'use client';

import React from 'react';
import { PlayCircle } from 'lucide-react';
import { AdList } from '@/modules/admin/ads/components/AdList';

export default function DoctorAdsPage() {
  return (
    <AdList 
      superTitle="PROMOTIONAL CONTENT"
      title={<React.Fragment>My <span className="text-primary italic font-serif">Ads</span></React.Fragment>}
      description="Manage your promotional content and advertisements on the kiosk network." 
      icon={PlayCircle}
    />
  );
}
