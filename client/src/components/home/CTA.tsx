'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* BACKGROUND CONTAINER */}
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-[3rem] bg-[#131793] p-8 md:p-16 overflow-hidden shadow-2xl shadow-[#131793]/40">
          
          {/* DECORATIVE AMBIENCE */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0091DD]/30 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* LEFT SIDE: TEXT */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left flex-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6">
                <Sparkles size={14} className="text-blue-300" />
                <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Ready to transform?</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Streamline your hospital <br /> operations <span className="text-blue-300">today.</span>
              </h2>
              
              <p className="mt-6 text-blue-100/70 text-sm md:text-base max-w-xl leading-relaxed">
                Join 500+ healthcare facilities reducing wait times and improving patient 
                satisfaction with our intelligent token management system.
              </p>

              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 text-[11px] font-medium text-blue-200">
                  <CheckCircle size={14} /> 14-day free trial
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-blue-200">
                  <CheckCircle size={14} /> No credit card required
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-blue-200">
                  <CheckCircle size={14} /> Setup in 15 minutes
                </div>
              </div>
            </motion.div>

            {/* RIGHT SIDE: BUTTONS */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto"
            >
              <button className="px-10 py-5 bg-white text-[#131793] font-bold rounded-2xl shadow-xl hover:bg-blue-50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 text-sm md:text-base">
                Get Started Now
                <ArrowRight size={18} />
              </button>
              
              <button className="px-10 py-5 bg-[#131793] border border-white/30 text-white font-bold rounded-2xl hover:bg-white/5 transition-all duration-300 text-sm md:text-base">
                Book a Demo
              </button>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}