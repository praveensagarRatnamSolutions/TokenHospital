'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, ArrowRight } from 'lucide-react';
import FAQ from './FAQ';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    hospital: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const subject = encodeURIComponent(`Hospital Inquiry from ${formData.hospital}`);

    const body = encodeURIComponent(`
Full Name: ${formData.firstName} ${formData.lastName}

Email: ${formData.email}

Hospital Name: ${formData.hospital}

Message:
${formData.message}
    `);

    window.location.href = `mailto:praveensagarbingi@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-12 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* LEFT */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs sm:text-sm backdrop-blur-md">
                Smart Hospital Management
              </div>

              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Let’s Build Smarter
                <span className="block text-cyan-300">Hospital Operations</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-blue-100 sm:text-lg sm:leading-8 lg:mx-0">
                Simplify patient queues, appointments, billing and hospital management
                with our modern token system platform.
              </p>

              {/* BUTTONS */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <button className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-white px-7 font-semibold text-slate-900 shadow-xl transition-all hover:scale-[1.02]">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button className="h-13 rounded-2xl border border-white/20 bg-white/10 px-7 font-semibold backdrop-blur-md transition-all hover:bg-white/20">
                  Book Demo
                </button>
              </div>

              {/* STATS */}
              <div className="mt-14 grid grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-white sm:text-3xl">120+</h3>

                  <p className="mt-1 text-xs text-blue-100 sm:text-sm">Hospitals</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white sm:text-3xl">50K+</h3>

                  <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                    Patients Managed
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white sm:text-3xl">99.9%</h3>

                  <p className="mt-1 text-xs text-blue-100 sm:text-sm">Uptime</p>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <img
                src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3"
                alt="hospital"
                className="h-[320px] w-full rounded-[2rem] object-cover shadow-2xl sm:h-[420px] lg:h-[520px]"
              />

              {/* FLOATING CARD */}
              <div className="absolute -bottom-6 left-1/2 w-[85%] -translate-x-1/2 rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl sm:-bottom-8 sm:left-auto sm:w-auto sm:translate-x-0 lg:-left-8">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef"
                  alt="doctor"
                  className="h-24 w-full rounded-2xl object-cover sm:h-28 sm:w-52"
                />

                <p className="mt-3 text-center text-sm font-medium">
                  Trusted by modern hospitals
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-12 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="mb-6 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              Contact Us
            </div>

            <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Have Questions?
              <span className="block text-blue-600">We’re Here To Help.</span>
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Our team helps hospitals automate patient flow, appointments and token
              management systems.
            </p>

            {/* CONTACT CARDS */}
            <div className="mt-12 space-y-4 sm:space-y-5">
              {[
                {
                  icon: Mail,
                  title: 'Email Support',
                  value: 'info@ratnamsolutions.com',
                },
                {
                  icon: Phone,
                  title: 'Phone Number',
                  value: '+91 8790523012',
                },
                {
                  icon: MapPin,
                  title: 'Location',
                  value: 'Flat 302, Ratnam Solutions, Madhapur, Hyderabad, TS, India - 500081',
                },
                {
                  icon: Clock,
                  title: 'Working Hours',
                  value: 'Mon - Sat : 9AM - 7PM',
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white sm:h-14 sm:w-14">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>

                      <p className="mt-1 text-sm text-slate-500 sm:text-base">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 lg:p-10">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Send a Message
              </h3>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Fill in the details and your mail app will open automatically.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className="h-13 rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:h-14 sm:text-base"
                />

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className="h-13 rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:h-14 sm:text-base"
                />
              </div>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="h-13 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:h-14 sm:text-base"
              />

              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                placeholder="Hospital Name"
                required
                className="h-13 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:h-14 sm:text-base"
              />

              <textarea
                rows={6}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your hospital requirements..."
                required
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:text-base"
              />

              <button
                type="submit"
                className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:from-blue-700 hover:to-indigo-700 sm:h-14 sm:text-base"
              >
                <Send className="h-5 w-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <FAQ />
    </div>
  );
}
