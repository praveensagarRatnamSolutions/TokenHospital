export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <span className="text-4xl">🚫</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <div className="space-x-4">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Home
          </a>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
