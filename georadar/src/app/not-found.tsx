import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6 text-2xl font-bold font-mono text-cyan-400">
        404
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-3">Page not found</h1>
      <p className="text-zinc-400 max-w-md mb-8 text-sm leading-relaxed">
        The page you are looking for doesn't exist or has been moved. Check the URL or return back to the QuerySonar platform.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
}
