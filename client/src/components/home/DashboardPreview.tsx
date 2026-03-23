'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle2, LayoutDashboard, Zap, ShieldCheck } from 'lucide-react';

const sections = [
  {
    title: 'Comprehensive Doctor Dashboard',
    highlight: 'Manage with Ease',
    desc: 'Empower healthcare professionals with a streamlined interface to call tokens, view patient history, and manage multiple department queues from a single screen.',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=800&fit=crop', // Replace with your Dashboard Image
    features: ['One-click token calling', 'Real-time status updates', 'Patient history access'],
    reverse: false,
  },
  {
    title: 'Intuitive Kiosk Interface',
    highlight: 'Self-Service Reimagined',
    desc: 'Reduce front-desk workload with our touch-optimized kiosk system. Patients can register, select departments, and print tokens in under 30 seconds.',
    img: 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=1200&h=800&fit=crop', // Replace with your Kiosk Image
    features: ['Multi-language support', 'Instant thermal printing', 'QR code check-ins'],
    reverse: true, // This swaps the image to the left
  },
];

export default function DashboardShowcase() {
  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {sections.map((section, i) => (
          <div 
            key={i} 
            className={`flex flex-col lg:items-center gap-12 mb-32 last:mb-0 ${
              section.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
            }`}
          >
            {/* TEXT CONTENT */}
            <motion.div 
              initial={{ opacity: 0, x: section.reverse ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex-1"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-8 bg-[#0091DD]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#0091DD]">
                  {section.highlight}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-[#131793] leading-tight">
                {section.title}
              </h2>
              
              <p className="mt-6 text-gray-500 text-base leading-relaxed max-w-lg">
                {section.desc}
              </p>

              <ul className="mt-8 space-y-3">
                {section.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <CheckCircle2 size={18} className="text-[#0091DD]" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button className="mt-10 text-sm font-bold text-[#131793] flex items-center gap-2 group">
                Explore Module 
                <div className="w-8 h-8 rounded-full bg-[#F5F9FF] flex items-center justify-center group-hover:bg-[#131793] group-hover:text-white transition-all">
                   →
                </div>
              </button>
            </motion.div>

            {/* IMAGE / DASHBOARD PREVIEW */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex-1 relative"
            >
              {/* Decorative Background Element */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#131793]/10 to-[#0091DD]/5 rounded-[2rem] blur-2xl -z-10" />
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white p-2">
                <Image 
                  src={section.img}
                  alt={section.title}
                  width={1200}
                  height={800}
                  className="rounded-xl object-cover"
                />
              </div>

              {/* Small floating "Feature Card" for extra detail */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`hidden md:flex absolute ${section.reverse ? '-right-6' : '-left-6'} bottom-10 bg-white p-4 rounded-xl shadow-xl border border-gray-50 items-center gap-4`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#0091DD] flex items-center justify-center text-white">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Response Time</p>
                  <p className="text-sm font-bold text-[#131793]">{"< 100ms"}</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        ))}

      </div>
    </section>
  );
}