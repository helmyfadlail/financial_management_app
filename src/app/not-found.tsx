import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <h1 className="text-6xl font-bold text-slate-800">404</h1>
      <h2 className="text-xl font-medium text-slate-600">Page not found</h2>
      <p className="text-slate-500">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="px-4 py-2 mt-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600">
        Go home
      </Link>
    </div>
  );
}
