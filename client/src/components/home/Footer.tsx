'use client';

import { motion } from 'framer-motion';
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

const footerLinks = [
  {
    title: 'Product',
    links: ['Features', 'Dashboard', 'Kiosk System', 'Pricing', 'Live Demo'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Case Studies', 'Hospital Partners', 'Careers', 'Contact'],
  },
  {
    title: 'Support',
    links: [
      'Help Center',
      'API Docs',
      'System Status',
      'Privacy Policy',
      'Terms of Service',
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-white pt-20 pb-10 px-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* TOP SECTION: BRANDING & LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Link href="/" className="text-lg sm:text-xl font-bold">
                <img
                  src="/logo.png" // 👉 replace with your real logo
                  className="h-15 w-25"
                  alt="Ratnam Solutions"
                />
              </Link>
            </div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-8">
              Transforming patient experiences through intelligent queue management and
              real-time hospital analytics.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-xs text-gray-500 hover:text-[#0091DD] transition-colors">
                <Mail size={14} className="text-[#0091DD]" />
                info@ratnamsolutions.com
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 hover:text-[#0091DD] transition-colors">
                <Phone size={14} className="text-[#0091DD]" />
                +91 8790523012
              </div>
            </div>

            {/* SOCIAL LINKS */}
            <div className="flex gap-4">
              {[Linkedin, Twitter, Facebook, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-[#F5F9FF] flex items-center justify-center text-[#131793] hover:bg-[#131793] hover:text-white transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* DYNAMIC LINK COLUMNS */}
          {footerLinks.map((group, i) => (
            <div key={i}>
              <h4 className="text-sm font-bold text-[#131793] uppercase tracking-wider mb-6">
                {group.title}
              </h4>
              <ul className="space-y-4">
                {group.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 hover:text-[#0091DD] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION: COPYRIGHT */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-400">
            © All rights reserved. 2026 • Ratnam Solutions Private Limited
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600">
              Security
            </a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600">
              Cookies
            </a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
