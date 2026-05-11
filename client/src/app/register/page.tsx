// app/(auth)/signup/page.tsx

import SignupForm from "@/modules/register/components/signup-form";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Branding & Value Prop */}
        <div className="hidden md:flex flex-col space-y-8 p-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            SPECIAL OFFER: 25-DAY FREE PRO TRIAL
          </div>

          <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
            Scale Your Hospital <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Operations Effortlessly
            </span>
          </h1>

          <p className="text-slate-400 text-xl leading-relaxed">
            Join 500+ healthcare providers using our precision queue management system to improve patient satisfaction.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <h3 className="text-white font-bold mb-1">Pro Features</h3>
              <p className="text-slate-500 text-sm">Get all enterprise features unlocked during your trial.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <h3 className="text-white font-bold mb-1">Admin Setup</h3>
              <p className="text-slate-500 text-sm">Initialize your entire hospital infrastructure in minutes.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphism Form Card */}
        <div className="w-full">
          <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-800 p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Get Started
              </h2>
              <p className="text-slate-400">
                Create your hospital administrator account
              </p>
            </div>

            <SignupForm />

            <div className="mt-8 text-center text-slate-400 text-sm">
              Already managed by us?{" "}
              <a
                href="/login"
                className="text-white font-bold hover:text-blue-400 transition-colors"
              >
                Sign In here
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}