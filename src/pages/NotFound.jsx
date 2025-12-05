export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-gray-800 mb-4">404</h1>

        <p className="text-lg text-gray-600 mb-2">
          Oops! The page you’re looking for doesn’t exist.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          It may have been moved, deleted, or you typed the wrong URL.
        </p>

        <a
          href="/"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}
