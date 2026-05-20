'use client';

import { useState } from 'react';
import { 
  ShieldAlert, 
  Eye, 
  Key, 
  Globe, 
  Database, 
  UserCheck, 
  Calendar, 
  Search, 
  Printer, 
  Mail, 
  Phone, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      icon: Database,
      content: `We collect information to provide a streamlined, high-quality queue routing and notification experience for hospital administrators, doctors, receptionists, and patients.
      
      • Hospital Profiles: When registering, we collect organization names, corporate addresses, contact numbers, email configurations, and taxation documents (GSTIN).
      • Healthcare Staff Accounts: Names, email logins, departments, schedules, and portal credentials of doctors and assistants created on your private hospital node.
      • Patient Queue Ticketing Data: For token generation and automated notifications, we process patient names, phone numbers, and department targets. We do NOT store electronic medical records (EHR) or complex diagnostic histories.
      • Secure Payment Transactions: Wallet top-up details and standard premium subscription fees are processed securely. All transactional values are routed via Razorpay under high-grade SSL encryption. We do not store credit card codes or banking passwords.`,
    },
    {
      id: 'usage',
      title: '2. How We Use Information',
      icon: Eye,
      content: `The details we collect are put to use solely to operate, improve, and secure hospital token dashboards:
      
      • To issue real-time token numbers and sync live queue displays on kiosks and clinic TVs.
      • To deliver instant SMS text alerts and email updates regarding waiting times to patients and staff.
      • To manage subscription package renewals, SMS wallet billing, and detailed transaction statements.
      • To run diagnostic tools, solve active kiosk bugs, and perform cybersecurity audits.
      • To file legal tax reports under GST and standard corporate financial regulations in India.`,
    },
    {
      id: 'security',
      title: '3. Data Security Measures',
      icon: Key,
      content: `We run enterprise-grade protective measures to ensure your hospital databases remain private and sealed:
      
      • Standard TLS/SSL: All network traffic moving between patient kiosks, staff panels, and cloud database instances is fully encrypted in transit.
      • Strong Hashing: All user accounts are secured with modern encryption (bcrypt) to avoid plaintext breaches.
      • Multi-Factor Access: Access to raw production database endpoints is sealed under strictly audited administrative access tokens.
      • Redundant Backups: Continuous data backups are safely housed in secure hosting centers with automated threat detection rules.`,
    },
    {
      id: 'sharing',
      title: '4. Information Sharing & Third-Parties',
      icon: Globe,
      content: `Ratnam Solutions Private Limited enforces a strict policy against trading or leasing user data to advertisers or third-party brokers. We disclose data solely to specialized services essential for executing platform utilities:
      
      • Secure Payment Gateways: Subscription processing is completed via Razorpay.
      • Communications Infrastructure: Mobile queue alerts are dispatched through reliable partner channels (like AWS SES and Msg91 SMS APIs).
      • Core Cloud Nodes: Databases are stored on highly compliant servers with strict NDA terms.
      • Legal Declarations: Data may be shared with judicial courts if formally mandated under law.`,
    },
    {
      id: 'consent',
      title: '5. Patient Consent & Hospital Role',
      icon: UserCheck,
      content: `Subscribing hospitals utilizing our platform act as the **Data Controller**, while the Company operates as the **Data Processor**. 
      
      The hospital warrants that it has collected necessary consent from patients before registering their contact numbers or department entries into the local kiosk for automated ticketing services.`,
    },
    {
      id: 'rights',
      title: '6. User Rights & Data Purging',
      icon: ShieldAlert,
      content: `SuperAdmins can access, modify, or correct their corporate profiles and doctor listings at any time through the live settings. 
      
      We retain hospital data as long as subscription accounts are maintained. In the event of subscription termination, hospital managers can request immediate, permanent deletion of their database sharding nodes by raising a support query.`,
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
            <span>Privacy Guard</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="mt-6 text-base text-slate-300 max-w-2xl mx-auto sm:text-lg leading-relaxed">
            We value your trust. Understand exactly how we collect, secure, shard, and process your institutional and patient information.
          </p>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Last Updated: May 19, 2026</span>
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-400" />
              <span>Version: 2.0 (Security Audited)</span>
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
              placeholder="Search privacy clauses..."
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
              <span>Data Officer</span>
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

              {/* SECURITY SHIELD WIDGET */}
              <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl shadow-teal-100">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  <span>Secure Node</span>
                </h4>
                <p className="mt-2 text-xs text-teal-500-100 leading-relaxed text-teal-50">
                  Our core databases utilize continuous encryptions, firewalled VPC grids, and automatic security patches.
                </p>
                <div className="mt-5 border-t border-white/20 pt-4 text-[11px] text-teal-200 space-y-1">
                  <div>• HIPAA Guidelines Compliant</div>
                  <div>• Indian DPDP Act Aligned</div>
                  <div>• ISO 27001 Datacenter Hosting</div>
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
                          navigator.clipboard.writeText(`${window.location.origin}/privacy-policy#${sec.id}`);
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
                  <div>Data Grievance: privacy@ratnamsolutions.com</div>
                  <div>Support: +91 8790523012</div>
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
