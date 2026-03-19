// app/(auth)/signup/page.tsx

import SignupForm from "@/modules/register/components/signup-form";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4">
      
      {/* Container */}
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 items-center">
        
        {/* Left Side (Branding / Info) */}
        <div className="hidden md:flex flex-col justify-center space-y-6 p-6">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Create Your <span className="text-blue-600">Hospital System</span>
          </h1>

          <p className="text-gray-600 text-lg">
            Manage tokens, doctors, and patient flow efficiently with a modern dashboard built for hospitals.
          </p>

          <div className="space-y-2 text-sm text-gray-600">
            <p>✔ Admin + Hospital setup in one step</p>
            <p>✔ Real-time token management</p>
            <p>✔ Secure & scalable system</p>
          </div>
        </div>

        {/* Right Side (Form Card) */}
        <div className="my-3">
          <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
            
            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Create Account
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Get started in seconds
              </p>
            </div>

            {/* Form */}
            <SignupForm />

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 font-semibold hover:underline"
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