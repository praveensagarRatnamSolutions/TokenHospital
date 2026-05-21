import { ArrowLeft, Calendar, Mail, Phone, Printer } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

interface PolicySection {
  id: string;
  title: string;
  content: string;
}

interface LegalPolicyPageProps {
  badge: string;
  title: string;
  description: string;
  versionText: string;
  contactLabel: string;
  contactEmail: string;
  supportText: string;
  sections: PolicySection[];
}

const LegalPolicyPage: React.FC<LegalPolicyPageProps> = ({
  badge,
  title,
  description,
  versionText,
  contactLabel,
  contactEmail,
  supportText,
  sections,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return sections;

    return sections.filter(
      (section) =>
        section.title.toLowerCase().includes(query) ||
        section.content.toLowerCase().includes(query),
    );
  }, [searchQuery, sections]);

  return (
    <div className="h-screen overflow-y-auto bg-slate-50 text-slate-900">
      <header className="border-b border-white/10 bg-slate-950 text-white">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400 transition hover:text-sky-300"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            <span className="flex items-center gap-2">
              <Calendar size={14} className="text-sky-400" />
              Last Updated: May 19, 2026
            </span>
            <span>{versionText}</span>
          </div>
        </div>
      </header>

      <section className="bg-slate-950 px-6 py-14 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
            {badge}
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            {description}
          </p>
        </div>
      </section>

      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search policy..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 sm:max-w-md"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Printer size={16} />
              Print
            </button>
            <a
              href={`mailto:${contactEmail}`}
              className="flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white transition hover:bg-sky-500"
            >
              <Mail size={16} />
              {contactLabel}
            </a>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Sections
            </p>
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="space-y-5">
          {searchQuery && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-800">
              Found {filteredSections.length} matching sections for "{searchQuery}".
            </div>
          )}

          {filteredSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                {section.content}
              </div>
            </section>
          ))}

          {filteredSections.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-black text-slate-950">No results found</h2>
              <p className="mt-2 text-sm text-slate-500">
                Try searching with a different keyword.
              </p>
            </div>
          )}

          <section className="rounded-3xl bg-slate-950 p-6 text-slate-300 sm:p-8">
            <h2 className="text-xl font-black text-white">
              Ratnam Solutions Private Limited
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Flat 302, Ratnam Solutions, Madhapur, Hyderabad, Telangana - 500081,
              India
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-[0.14em] text-sky-300">
              <span className="flex items-center gap-2">
                <Mail size={14} />
                {supportText}
              </span>
              <span className="flex items-center gap-2">
                <Phone size={14} />
                +91 8790523012
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LegalPolicyPage;
