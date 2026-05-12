'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How does the hospital token system work?',
    answer:
      'Patients can generate tokens digitally through kiosk, QR code, receptionist or online booking. Hospitals can manage queues in real-time from the admin dashboard.',
  },
  {
    question: 'Can multiple hospital branches use the same system?',
    answer:
      'Yes. Our platform supports multi-branch hospital management with separate doctors, departments and token queues for each branch.',
  },
  {
    question: 'Does it support QR & POS payments?',
    answer:
      'Absolutely. You can integrate QR payments, Razorpay, POS machines and kiosk payments directly into the token workflow.',
  },
  {
    question: 'Can doctors view live patient queues?',
    answer:
      'Yes. Doctors and staff can monitor live queues, upcoming patients and token status from their dashboards.',
  },
  {
    question: 'Is patient data secure?',
    answer:
      'We follow modern security practices with encrypted APIs, role-based access control and secure authentication systems.',
  },
  {
    question: 'Can hospitals customize departments and timings?',
    answer:
      'Yes. Hospitals can configure departments, timings, doctors, token limits and schedules dynamically.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center">
          <div className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-xs font-medium text-blue-700 sm:text-sm">
            FAQ
          </div>

          <h2 className="mt-5 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Everything you need to know about our hospital token management platform.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 sm:rounded-3xl ${
                  isOpen ? 'border-blue-200 shadow-md' : 'border-slate-200'
                }`}
              >
                {/* Question */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                >
                  <h3 className="pr-2 text-base font-semibold leading-7 text-slate-900 sm:text-lg">
                    {faq.question}
                  </h3>

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 transition-transform duration-300 sm:h-10 sm:w-10 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <ChevronDown className="h-5 w-5 text-blue-600" />
                  </div>
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                      <p className="text-sm leading-7 text-slate-600 sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
