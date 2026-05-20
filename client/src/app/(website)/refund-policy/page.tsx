'use client';

import { useState } from 'react';
import { 
  ShieldAlert, 
  HelpCircle, 
  XCircle, 
  CreditCard, 
  RefreshCw, 
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

export default function RefundPolicyPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'cancellation',
      title: '1. Subscription Cancellation',
      icon: XCircle,
      content: `You may cancel your recurring SaaS subscription (monthly or annual plan) at any time.
      
      • Graceful Access: Upon cancellation, your access to the Hospital Token Management dashboard, doctor queues, and kiosk modules remains fully active until the end of your current paid billing period.
      • No Auto-Renewals: Once canceled, your card or bank account will not be charged automatically for any subsequent renewal cycles.
      • Process: You can cancel directly via the billing section in your Admin dashboard or by sending an official email request to billing@ratnamsolutions.com.`,
    },
    {
      id: 'wallet',
      title: '2. Wallet Top-Up Packages',
      icon: CreditCard,
      content: `Wallet top-ups (such as dedicated standalone SMS packages, email delivery bundles, or extra token slot credits) are consumed dynamically based on utility.
      
      • Strict Non-Refundability: Once a wallet top-up package is purchased and the communication credits are provisioned to your hospital node, they are completely non-refundable.
      • No Expiry Option: Standard SMS/email packages purchased as standalone top-ups do not expire as long as your base SaaS account remains in good standing.`,
    },
    {
      id: 'saas-refunds',
      title: '3. Standard SaaS Refund Rules',
      icon: RefreshCw,
      content: `As our system provisions dedicated database shards, customized hospital token subdomains, and instant API gateways immediately upon payment confirmation, we enforce a standard "No Refund" policy on active subscription terms.
      
      • Exceptional Cases: A refund may be considered only if there is a verified platform-wide technical failure or bug that prevents your hospital from generating tokens, and our development team fails to resolve the issue within seven (7) business days of written escalation.
      • Trial Recommendation: We highly encourage hospitals to request a live demo or utilize free trials before subscribing to standard premium plans.`,
    },
    {
      id: 'timeline',
      title: '4. Refund Processing Timeline',
      icon: Clock,
      content: `In the rare event that a refund is approved by our management team:
      
      • Settlement: The refund will be settled back to your original source of payment (credit card, debit card, UPI, or net banking account) used during checkout.
      • Channel: All transactions are securely reversed through our gateway partner (Razorpay).
      • Timeframe: Approved refunds will be initiated within three (3) business days, and typically reflect in your bank account or card statement within five to seven (5-7) business days, subject to standard banking settlement cycles.`,
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
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs sm:text-sm backdrop-blur-md text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Billing Guard</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Refund &amp; Cancellation
          </h1>
          <p className="mt-6 text-base text-slate-300 max-w-2xl mx-auto sm:text-lg leading-relaxed">
            Transparent billing details. Read our rules on SaaS cancellations, transaction refunds, and Razorpay settlement cycles.
          </p>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Last Updated: May 19, 2026</span>
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-400" />
              <span>Gateway: Razorpay Settled</span>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH AND CONTROLS */}
      <div className="sticky top-[64px] z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search refund clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Print Policy</span>
            </button>
            <a
              href="mailto:info@ratnamsolutions.com"
              className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold transition-all shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 active:scale-95"
            >
              <Mail className="h-4 w-4" />
              <span>Billing Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* DUAL COLUMN MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: TABLE OF CONTENTS */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-[150px] space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span>Sections</span>
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

              {/* STATS WIDGET */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Settlement</span>
                </h4>
                <p className="mt-2 text-xs text-indigo-100 leading-relaxed">
                  Refund actions approved by the billing desk are settled through Razorpay back to your original paying node.
                </p>
                <div className="mt-5 border-t border-white/20 pt-4 text-[11px] text-indigo-200 space-y-1">
                  <div>• Processing Time: 3 Days</div>
                  <div>• Banking Delay: 5-7 Days</div>
                  <div>• Platform Currency: INR</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DOCUMENT BODY */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8 print:col-span-12">
            
            {searchQuery && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-5 py-3 rounded-2xl text-sm flex items-center justify-between">
                <span>Found <strong>{filteredSections.length}</strong> matching sections for "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="font-bold hover:underline">Clear</button>
              </div>
            )}

            {filteredSections.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-16 text-center">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-slate-800">No results found</h3>
                <p className="mt-2 text-slate-500 text-sm max-w-sm mx-auto">
                  We couldn't find any matches for "{searchQuery}". Try searching for alternative keywords.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {filteredSections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <div
                    key={sec.id}
                    id={sec.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100/50 hover:shadow-xl hover:border-slate-300/80 transition-all duration-300 p-6 sm:p-8 relative group"
                  >
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/refund-policy#${sec.id}`);
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
                <h3 className="text-xl font-bold text-white">Ratnam Solutions Private Limited</h3>
                <p className="mt-2 text-sm text-slate-400 max-w-md">
                  Flat 302, Ratnam Solutions, Madhapur, Hyderabad, Telangana - 500081, India
                </p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-indigo-300">
                  <div>Billing Support: billing@ratnamsolutions.com</div>
                  <div>Phone support: +91 8790523012</div>
                </div>
              </div>
              <div className="flex gap-4 shrink-0 w-full md:w-auto">
                <a
                  href="/contact"
                  className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold transition-all w-full md:w-auto shadow-lg shadow-black/10"
                >
                  <span>Support Center</span>
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
