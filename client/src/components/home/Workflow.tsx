'use client';

import { motion } from 'framer-motion';
import { UserPlus, Ticket, Monitor, Bell } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Patient Registers',
    desc: 'Register via kiosk or online and receive token instantly.',
  },
  {
    icon: Ticket,
    title: 'Token Generated',
    desc: 'Token is added to real-time queue system.',
  },
  {
    icon: Monitor,
    title: 'Doctor Calls',
    desc: 'Doctor calls next patient from dashboard.',
  },
  {
    icon: Bell,
    title: 'Patient Notified',
    desc: 'Patient receives alert via display or SMS.',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 px-6 bg-[#131793] overflow-hidden">
      
      {/* BACKGROUND GRADIENT LAYER */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#131793] via-[#0b0e63] to-[#0091DD]" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        
        {/* SMALLER TITLE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-blue-100/60 max-w-lg mx-auto text-sm leading-relaxed">
            A streamlined workflow designed to reduce waiting time and improve hospital efficiency.
          </p>
        </motion.div>

        {/* STEPS GRID */}
        
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          
          {steps.map((step, i) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative"
              >
                {/* SMALLER NUMBER BADGE */}
                <div className="mb-4 mx-auto w-8 h-8 bg-white text-[#131793] rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                  0{i + 1}
                </div>

                {/* CARD CONTENT - Compact version */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center hover:bg-white/10 transition-all duration-300">
                  
                  <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center rounded-xl bg-white/10 text-white">
                    <Icon size={18} strokeWidth={2} />
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 tracking-wide">
                    {step.title}
                  </h3>

                  <p className="text-blue-100/60 text-xs leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}