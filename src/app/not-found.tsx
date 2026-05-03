import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-slate-800">404</h1>
      <h2 className="text-xl font-medium text-slate-600">Page not found</h2>
      <p className="text-slate-500">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600">
        Go home
      </Link>
    </div>
  );
}
