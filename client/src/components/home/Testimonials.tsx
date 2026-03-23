'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    quote:
      'The token system reduced our patient wait times by 40%. The dashboard is incredibly intuitive for our staff.',
    author: 'Dr. Sarah Chen',
    role: 'Chief of Medicine, City General',
    img: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?w=150&h=150&fit=crop',
  },
  {
    quote:
      'Finally, a solution that handles multi-department queues without crashing. The SMS alerts are a game changer.',
    author: 'James Wilson',
    role: 'Hospital Administrator',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  },
  {
    quote:
      'Patient satisfaction has soared since we implemented the kiosk. No more crowded waiting rooms.',
    author: 'Dr. Robert Fox',
    role: 'Clinic Director',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-[#F5F9FF] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#0091DD] font-bold">
              User Feedback
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#131793]">
              Trusted by Leading Healthcare Providers
            </h2>
          </motion.div>
        </div>

        {/* TESTIMONIAL GRID */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500"
            >
              {/* QUOTE ICON */}
              <div className="absolute top-6 right-8 text-[#0091DD]/10 group-hover:text-[#0091DD]/20 transition-colors">
                <Quote size={40} fill="currentColor" />
              </div>

              {/* RATING */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-[#0091DD] text-[#0091DD]" />
                ))}
              </div>

              {/* CONTENT */}
              <p className="text-sm md:text-base text-gray-600 italic leading-relaxed mb-8 relative z-10">
                "{item.quote}"
              </p>

              {/* AUTHOR */}
              <div className="flex items-center gap-4 border-t border-gray-50 pt-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#0091DD]/20">
                  <Image src={item.img} alt={item.author} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#131793]">{item.author}</h4>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                    {item.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* LOGO BAR (OPTIONAL) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700"
        >
          {/* Replace these with hospital/partner logos */}
          <div className="font-black text-xl text-[#131793]">HOSPITAL.CO</div>
          <div className="font-black text-xl text-[#131793]">MEDICARE</div>
          <div className="font-black text-xl text-[#131793]">HEALTHFLOW</div>
          <div className="font-black text-xl text-[#131793]">CLINIC-PRO</div>
        </motion.div>
      </div>
    </section>
  );
}
