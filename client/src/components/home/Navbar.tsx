'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    {
      name: 'Features',
      href: '/#features',
    },
    {
      name: 'How it Works',
      href: '/#workflow',
    },
    {
      name: 'Pricing',
      href: '/#pricing',
    },
    {
      name: 'Contact',
      href: '/contact',
    },
  ];

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 shadow-md backdrop-blur-xl border-b border-slate-200'
            : 'bg-white'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Hospital Token"
              className="h-15 w-auto object-contain"
            />
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* DESKTOP RIGHT */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Login
            </Link>

            <Link href="/register">
              <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                Get Started
              </button>
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 transition hover:bg-slate-100 md:hidden"
          >
            {open ? (
              <X className="h-6 w-6 text-slate-700" />
            ) : (
              <Menu className="h-6 w-6 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
            />

            {/* MENU */}
            <motion.div
              initial={{
                opacity: 0,
                y: -15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -15,
              }}
              transition={{
                duration: 0.2,
              }}
              className="fixed left-4 right-4 top-20 z-50 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl md:hidden"
            >
              {/* LINKS */}
              <div className="space-y-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Login
                </Link>

                <Link href="/register" onClick={() => setOpen(false)}>
                  <button className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                    Get Started
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
