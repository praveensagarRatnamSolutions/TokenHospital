// 'use client';

import CTA from '@/components/home/CTA';
import DashboardShowcase from '@/components/home/DashboardPreview';
import Features from '@/components/home/Features';
import Footer from '@/components/home/Footer';
import Hero from '@/components/home/Hero';
import Navbar from '@/components/home/Navbar';
import Testimonials from '@/components/home/Testimonials';
import HowItWorks from '@/components/home/Workflow';

export default function HomePage() {
  return (
    <div>
      <Hero />

      <Features />

      <HowItWorks />

      <DashboardShowcase />

      <Testimonials />

      <CTA />
    </div>
  );
}
