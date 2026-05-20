'use client';

import { useState } from 'react';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  HelpCircle, 
  Globe, 
  Calendar, 
  Search, 
  Printer, 
  Mail, 
  Phone, 
  ArrowRight,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';

export default function TermsAndConditionsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: CheckCircle,
      content: `By accessing, registering, or using the Hospital Token Management System ("the Service") provided by Ratnam Solutions Private Limited ("the Company," "we," "our," or "us"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not access or use the Service. 
      
      These terms apply in full to all subscribing hospitals, clinics, medical practitioners, administrators, and any other users of our platform. Any minor deviation or custom SLA must be mutually signed in writing.`,
    },
    {
      id: 'registration',
      title: '2. Registration & Account Security',
      icon: Shield,
      content: `To utilize the Service, you must register for an account by providing accurate, complete, and current information as prompted. You are solely responsible for maintaining the confidentiality of your account credentials, including passwords and API keys, and for all activities that occur under your account. 
      
      You agree to notify us immediately of any unauthorized use or security breach. The Company will not be liable for any losses or operational disruptions caused by unauthorized use of your account.`,
    },
    {
      id: 'services',
      title: '3. Description of Services & Payment Terms',
      icon: FileText,
      content: `The Service is a cloud-based software-as-a-service (SaaS) platform designed for hospital token management, queue optimization, patient appointments, and related real-time analytics. 
      
      Subscriptions, including top-up packages for SMS, email notification credits, and premium kiosk modules, are billed in advance as per the select plan details. Payments are processed securely via our designated payment gateways (including Razorpay). Prices are listed in Indian Rupees (INR) and are subject to applicable taxes (GST).`,
    },
    {
      id: 'delivery',
      title: '4. Service Delivery & Provisioning',
      icon: Clock,
      content: `Since the Hospital Token Management System is a Software-as-a-Service (SaaS) cloud platform, all purchased licenses, kiosk nodes, doctor dashboard access, and dynamically purchased SMS/email transaction credits are delivered and provisioned entirely digitally.
      
      • Instant Access: Standard subscription tier setups, default kiosk dashboards, and standalone SMS/email packages are activated immediately onto your hospital subdomain node upon successful checkout and payment validation.
      • Custom Onboarding: For complex multi-site hospitals requesting dedicated domain mapping or local print queue configurations, digital provisioning is finalized and administrator keys dispatched via email within twenty-four (24) to forty-eight (48) hours of registration approvals.
      • Zero Logistics: No physical products, CDs, hardware devices, or printed materials are shipped, and zero logistics or shipping costs are applied.`,
    },
    {
      id: 'refunds',
      title: '5. Refund & Cancellation Policy',
      icon: HelpCircle,
      content: `Subscription plans and credit top-up packages are non-refundable once purchased and provisioned to the hospital account. 
      
      Users may cancel their recurring subscriptions at any time through the billing dashboard, which will terminate renewals starting from the next billing cycle. For complete details, please refer to our dedicated Refund and Cancellation Policy page.`,
    },
    {
      id: 'data-protection',
      title: '6. Data Protection & Privacy',
      icon: Globe,
      content: `The security and privacy of hospital operations and patient records are our utmost priority. The Company processes patient name, phone number, and queue status only for queue routing and real-time alerts. 
      
      All data is collected, stored, and handled in compliance with our Privacy Policy, which is incorporated into these Terms by reference. You warrant that you have obtained necessary consent from your patients to transmit their details for token processing.`,
    },
    {
      id: 'intellectual-property',
      title: '7. Intellectual Property & Prohibited Activities',
      icon: FileText,
      content: `All content, source code, logos, designs, visual assets, and technology associated with the Service are the exclusive intellectual property of Ratnam Solutions Private Limited. 
      
      You are granted a limited, non-exclusive, non-transferable license to access the platform for standard business operations. You must not attempt to reverse-engineer, exploit, scrape, or perform security vulnerability testing on our servers without prior written consent.`,
    },
    {
      id: 'limitation',
      title: '8. Limitation of Liability',
      icon: Shield,
      content: `To the maximum extent permitted by law, Ratnam Solutions Private Limited shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the Service, including but not limited to patient queue delays, technical downtimes, SMS gateway failures, or loss of medical records. 
      
      The Service is provided on an "AS IS" and "AS AVAILABLE" basis.`,
    },
    {
      id: 'governing-law',
      title: '9. Governing Law & Jurisdiction',
      icon: Globe,
      content: `These Terms and Conditions shall be governed by and construed in accordance with the laws of India. 
      
      Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad, Telangana, India.`,
    },
  ];

  const filteredSections = sections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // offset for fixed headers
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50/50 min-h-screen relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none animate-pulse duration-5000" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[130px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#101827] via-[#1E1B4B] to-[#0F172A] text-white py-20 border-b border-indigo-950/30">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs sm:text-sm backdrop-blur-md text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Terms &amp; Conditions
          </h1>
          <p className="mt-6 text-base text-slate-300 max-w-2xl mx-auto sm:text-lg leading-relaxed">
            Please read these terms carefully. By accessing or using our Hospital Token Management platform, you agree to comply with our billing, operational, and data service terms.
          </p>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Last Updated: May 19, 2026</span>
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-400" />
              <span>Version: 2.1 (Production)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH AND CONTROLS */}
      <div className="sticky top-[64px] z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Live Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search legal clauses & keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Print Agreement</span>
            </button>
            <a
              href="mailto:info@ratnamsolutions.com"
              className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold transition-all shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 active:scale-95"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Legal</span>
            </a>
          </div>
        </div>
      </div>

      {/* DUAL COLUMN MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: TABLE OF CONTENTS (STICKY ON DESKTOP) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-[150px] space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span>Table of Contents</span>
                </h3>
                <nav className="space-y-1">
                  {sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all flex items-center gap-2.5 group"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />
                      <span className="truncate">{sec.title}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* QUICK ASSISTANCE WIDGET */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-100">
                <h4 className="font-bold text-lg">Need Assistance?</h4>
                <p className="mt-2 text-xs text-blue-100 leading-relaxed">
                  Our operational and administrative teams are available to clarify custom SLAs or clarify platform pricing details.
                </p>
                <div className="mt-5 space-y-3">
                  <a href="tel:+918790523012" className="flex items-center gap-3 text-xs bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>+91 8790523012</span>
                  </a>
                  <a href="mailto:info@ratnamsolutions.com" className="flex items-center gap-3 text-xs bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span>info@ratnamsolutions.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DOCUMENT BODY */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8 print:col-span-12">
            
            {/* SEARCH STATS */}
            {searchQuery && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-5 py-3 rounded-2xl text-sm flex items-center justify-between">
                <span>Found <strong>{filteredSections.length}</strong> matching sections for "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="font-bold hover:underline">Clear</button>
              </div>
            )}

            {/* EMPTY STATE */}
            {filteredSections.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-16 text-center">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-slate-800">No results found</h3>
                <p className="mt-2 text-slate-500 text-sm max-w-sm mx-auto">
                  We couldn't find any matches for "{searchQuery}". Please check your spelling or search for alternative keywords.
                </p>
              </div>
            )}

            {/* SECTIONS LIST */}
            <div className="space-y-6">
              {filteredSections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <div
                    key={sec.id}
                    id={sec.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100/50 hover:shadow-xl hover:border-slate-300/80 transition-all duration-300 p-6 sm:p-8 relative group"
                  >
                    {/* Anchor tag for direct link sharing */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/terms-and-conditions#${sec.id}`);
                        }}
                        className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
                      >
                        Copy Link
                      </button>
                    </div>

                    <div className="flex gap-5 sm:gap-6 items-start">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-100">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-4 w-full">
                        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl pt-1">
                          {sec.title}
                        </h2>
                        <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                          {sec.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BOTTOM ADDRESS CARD */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl text-slate-300 p-6 sm:p-10 border border-indigo-950 shadow-xl mt-12 flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Ratnam Solutions Private Limited</span>
                </h3>
                <p className="mt-2 text-sm text-slate-400 max-w-md">
                  Flat 302, Ratnam Solutions, Madhapur, Hyderabad, Telangana - 500081, India
                </p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-indigo-300">
                  <div>CIN: U72900TG2026PTC123456</div>
                  <div>GSTIN: 36AABCR1234F1Z5</div>
                </div>
              </div>
              <div className="flex gap-4 shrink-0 w-full md:w-auto">
                <a
                  href="/contact"
                  className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold transition-all w-full md:w-auto shadow-lg shadow-black/10"
                >
                  <span>Go to Support Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
