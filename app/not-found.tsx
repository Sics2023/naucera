import Link from "next/link";
export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div><h1 className="text-xl font-semibold">Page not found</h1><Link href="/admin" className="mt-3 inline-block text-brand-700 underline">Back to dashboard</Link></div>
    </div>
  );
}
