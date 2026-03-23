'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white backdrop-blur-xl border-b shadow-sm' : 'bg-transparent border-b'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="text-lg sm:text-xl font-bold">
            <img
              src="/logo.png" // 👉 replace with your real logo
              className="h-15 w-25"
              alt="Ratnam Solutions"
            />
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#" className="hover:text-blue-600 transition">
              Features
            </Link>
            <Link href="#" className="hover:text-blue-600 transition">
              How it Works
            </Link>
            <Link href="#" className="hover:text-blue-600 transition">
              Pricing
            </Link>
            <Link href="#" className="hover:text-blue-600 transition">
              Contact
            </Link>
          </nav>

          {/* RIGHT SIDE (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm hover:text-blue-600">
              Login
            </Link>

            <button className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 hover:scale-105 transition">
              Get Started
            </button>
          </div>

          {/* MOBILE BUTTON */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 w-full bg-white border-b shadow-md z-40 md:hidden"
          >
            <div className="px-6 py-6 space-y-5">
              <Link href="#" className="block text-lg font-medium">
                Features
              </Link>
              <Link href="#" className="block text-lg font-medium">
                How it Works
              </Link>
              <Link href="#" className="block text-lg font-medium">
                Pricing
              </Link>
              <Link href="#" className="block text-lg font-medium">
                Contact
              </Link>

              <div className="pt-4 border-t space-y-3">
                <Link href="/login" className="block text-gray-700">
                  Login
                </Link>

                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
