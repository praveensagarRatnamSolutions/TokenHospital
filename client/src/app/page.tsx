// 'use client';

import CTA from '@/components/home/CTA';
import DashboardShowcase from '@/components/home/DashboardPreview';
import Features from '@/components/home/Features';
import Footer from '@/components/home/Footer';
import Hero from '@/components/home/Hero';
import Navbar from '@/components/home/Navbar';
import Testimonials from '@/components/home/Testimonials';
import HowItWorks from '@/components/home/Workflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900">

      <Navbar />

      <Hero />

      <Features />

      <HowItWorks />

      <DashboardShowcase />

      <Testimonials />

      <CTA />

      <Footer />
    </div>
  );
}
