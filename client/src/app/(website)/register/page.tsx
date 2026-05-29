import SignupForm from '@/modules/register/components/signup-form';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Section */}
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 px-16 py-14 text-white xl:px-24">
          {/* Blur Effects */}
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 my-auto space-y-6">
            {/* Logo */}

            {/* Heading */}
            <div className="max-w-xl space-y-6">
              <h2 className="text-5xl font-bold leading-tight xl:text-6xl text-white">
                Create Your Hospital System
              </h2>

              <p className="text-lg leading-8 text-blue-100">
                Manage appointments, token queues, billing, doctor schedules and patient
                flow seamlessly using a modern hospital management platform.
              </p>
            </div>

            {/* Features */}
            <div className="mt-16 space-y-5">
              {[
                'Admin + Hospital setup in one step',
                'Real-time Token Management',
                'Secure & Scalable Architecture',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg">
                    ✓
                  </div>

                  <span className="text-base text-blue-50">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex min-h-screen items-center justify-center bg-white px-6 py-25 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mx-auto mb-8 flex items-center justify-center rounded-2xl border border-white/20 bg-white p-2 ">
              <Link href="/" className="text-lg sm:text-xl font-bold ">
                <img
                  src="/logo.png" // 👉 replace with your real logo
                  className="h-20 w-25"
                  alt="Ratnam Solutions"
                />
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                Create Account
              </h2>

              <p className="mt-3 text-base leading-7 text-slate-500">
                Get started and manage your hospital system in minutes.
              </p>
            </div>

            {/* Form */}
            <SignupForm />

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
