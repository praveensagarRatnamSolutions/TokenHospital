'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const slides = [
  {
    title: 'Smart Queue Management',
    highlight: 'Reduce Waiting Time',
    desc: 'Real-time doctor token system to streamline hospital operations.',
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1600',
    layout: 'left',
    overlay: 'bg-gradient-to-r from-white via-white/80 to-transparent'
  },
  {
    title: 'Advanced Doctor Dashboard',
    highlight: 'Manage Patients Effortlessly',
    desc: 'Empowering healthcare professionals with real-time data and patient flow control.',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600',
    layout: 'center',
    overlay: 'bg-black/40' // Darker for centered white text
  },
  {
    title: 'Self-Service Kiosks',
    highlight: 'Instant Token Generation',
    desc: 'Enable patients to check-in and receive updates via SMS and live displays.',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1600',
    layout: 'right',
    overlay: 'bg-gradient-to-l from-white via-white/80 to-transparent'
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[index];

  return (
    <section className="relative w-full h-[90vh] min-h-[700px] overflow-hidden flex items-center">
      
      {/* BACKGROUND IMAGE LAYER */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.img}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative w-full h-full"
          >
            <Image
              src={slide.img}
              alt="Background"
              fill
              priority
              className="object-cover"
            />
            {/* Dynamic Overlay based on slide settings */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${slide.overlay}`} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className={`flex flex-col ${
              slide.layout === 'center' ? 'items-center text-center' : 
              slide.layout === 'right' ? 'items-end text-right' : 'items-start text-left'
            }`}
          >
            <div className="max-w-2xl">
              <h1 className={`text-4xl sm:text-6xl font-semibold leading-tight ${
                slide.layout === 'center' ? 'text-white' : 'text-[#131793]'
              }`}>
                {slide.title}
                <br />
                <span className={`bg-gradient-to-r ${
                  slide.layout === 'center' ? 'from-blue-200 to-white' : 'from-[#131793] to-[#0091DD]'
                } bg-clip-text text-transparent font-bold`}>
                  {slide.highlight}
                </span>
              </h1>

              <p className={`mt-6 text-lg font-medium leading-relaxed ${
                slide.layout === 'center' ? 'text-white/90' : 'text-gray-600'
              }`}>
                {slide.desc}
              </p>

              <div className={`mt-10 flex flex-col sm:flex-row gap-4 ${
                slide.layout === 'center' ? 'justify-center' : 
                slide.layout === 'right' ? 'justify-end' : 'justify-start'
              }`}>
                <button className="relative px-8 py-3.5 bg-gradient-to-r from-[#131793] via-[#0091DD] to-[#131793] bg-[length:200%_auto] text-white font-medium rounded-xl shadow-lg hover:bg-right transition-all duration-500 active:scale-95">
                  Get Started
                </button>
                <button className={`px-8 py-3.5 backdrop-blur-md border font-medium rounded-xl transition ${
                  slide.layout === 'center' 
                    ? 'bg-white/20 border-white/40 text-white hover:bg-white/40' 
                    : 'bg-white/50 border-gray-300 text-[#131793] hover:bg-white'
                }`}>
                  Live Demo
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* DOTS NAVIGATION */}
      <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`transition-all duration-300 rounded-full h-2 ${
              i === index ? 'w-10 bg-[#0091DD]' : 'w-2 bg-gray-400/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
}