'use client';

import { motion } from 'framer-motion';
import { Activity, Monitor, Users, Bell, Building2, Layers } from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Real-Time Queue',
    desc: 'Track patient tokens live and manage queues efficiently.',
  },
  {
    icon: Monitor,
    title: 'Doctor Dashboard',
    desc: 'Doctors can call next patients and control the queue.',
  },
  {
    icon: Users,
    title: 'Patient Registration',
    desc: 'Quick patient onboarding via web or kiosk.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    desc: 'SMS & display alerts for upcoming tokens.',
  },
  {
    icon: Building2,
    title: 'Multi Department',
    desc: 'Handle OPD, labs, pharmacy with separate queues.',
  },
  {
    icon: Layers,
    title: 'Centralized Control',
    desc: 'Admin dashboard to manage everything in one place.',
  },
];

export default function Features() {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-white">
      {/* --- ENHANCED BACKGROUND LAYER --- */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Main Light Blue Slope */}
        <div
          className="absolute top-0 left-0 w-full h-[70%] bg-[#F5F9FF]"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)',
          }}
        />

        {/* Decorative Mesh/Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23131793' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating Gradient Orbs for Depth */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0091DD]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-[#131793]/5 blur-[100px] rounded-full" />
      </div>
      {/* --- END BACKGROUND LAYER --- */}

      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* SUBTITLE TAG */}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-[#0091DD] font-bold tracking-widest text-xs uppercase bg-[#0091DD]/10 px-4 py-1.5 rounded-full"
        >
          Our Capabilities
        </motion.span>

        {/* TITLE */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#131793]"
        >
          Powerful Features for <span className="text-[#0091DD]">Modern Hospitals</span>
        </motion.h2>

        <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
          Everything you need to manage patient flow efficiently and improve hospital
          operations.
        </p>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-[#0091DD]/15 shadow-sm hover:shadow-2xl hover:shadow-[#0091DD]/15 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Subtle Background Glow on Hover
                <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-[#0091DD]/5 rounded-full blur-2xl group-hover:bg-[#0091DD]/20 transition-colors" /> */}

                {/* ICON CONTAINER */}
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#0091DD]/10 to-[#131793]/5 text-[#0091DD] group-hover:scale-110 group-hover:from-[#0091DD] group-hover:to-[#131793] group-hover:text-white transition-all duration-500 shadow-inner mx-auto">
                  <Icon size={28} />
                </div>

                {/* TITLE */}
                <h3 className="mt-6 text-xl font-bold text-[#131793] group-hover:text-[#0091DD] transition-colors">
                  {feature.title}
                </h3>

                {/* DESC */}
                <p className="mt-3 text-gray-500 text-base leading-relaxed">
                  {feature.desc}
                </p>

                {/* DECORATIVE CORNER ELEMENT */}
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 border-t-2 border-r-2 border-[#0091DD]/20 rounded-tr-xl" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
