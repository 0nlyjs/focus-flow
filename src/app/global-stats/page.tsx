import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BarChart3, Clock, ArrowLeft, Trophy, Users, Star } from "lucide-react";

export const revalidate = 60; // ISR: Revalidate page data every 60 seconds

export default async function GlobalStatsPage() {
  let completedTasksCount = 0;
  let totalSpentMinutes = 0;
  let userCount = 0;

  try {
    completedTasksCount = await prisma.task.count({
      where: { isCompleted: true },
    });

    const totalTimeAgg = await prisma.task.aggregate({
      where: { isCompleted: true },
      _sum: { spentTime: true },
    });

    totalSpentMinutes = totalTimeAgg._sum.spentTime || 0;
    userCount = await prisma.user.count();
  } catch (error) {
    console.warn("Database connection failed during build or request:", error);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#dce3f8] text-slate-800 font-sans flex flex-col justify-between selection:bg-[#CBBCB9] selection:text-white">
      {/* Background soft glows */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-100/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-sky-100/40 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition-colors group font-bold"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>
        <span className="text-xs text-[#B19B95] font-bold px-3 py-1 rounded-full border border-[#E6D0CB] bg-white/80 backdrop-blur-md shadow-sm">
          Live Stats (updates every 60s)
        </span>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center flex-1 z-10 max-w-4xl">
        <div className="text-center flex flex-col items-center gap-6 mb-12">
          <div className="p-3 bg-gradient-to-tr from-[#B19B95] to-[#CBBCB9] rounded-2xl shadow-md">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            FocusFlow Global Metrics
          </h1>
          <p className="max-w-xl text-base text-slate-650 font-bold leading-relaxed">
            Aggregated stats of focus, grit, and productivity achieved by developers and creators around the world.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          {/* Card 1: Total Minutes */}
          <div className="relative p-6 rounded-3xl border border-slate-100 bg-white shadow-xl group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock className="w-24 h-24 text-[#B19B95]" />
            </div>
            <p className="text-xs font-extrabold text-[#B19B95] uppercase tracking-wider mb-2">Total Focus Time</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight font-mono mb-2">
              {totalSpentMinutes.toLocaleString()}m
            </h2>
            <p className="text-xs text-slate-500 font-bold">Total minutes spent completing tasks.</p>
          </div>

          {/* Card 2: Completed Tasks */}
          <div className="relative p-6 rounded-3xl border border-slate-100 bg-white shadow-xl group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Trophy className="w-24 h-24 text-emerald-500" />
            </div>
            <p className="text-xs font-extrabold text-[#B19B95] uppercase tracking-wider mb-2">Tasks Completed</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight font-mono mb-2">
              {completedTasksCount.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-500 font-bold">Fully resolved focus blocks logged.</p>
          </div>

          {/* Card 3: Active Members */}
          <div className="relative p-6 rounded-3xl border border-slate-100 bg-white shadow-xl group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-24 h-24 text-pink-500" />
            </div>
            <p className="text-xs font-extrabold text-[#B19B95] uppercase tracking-wider mb-2">Total Creators</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight font-mono mb-2">
              {userCount.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-500 font-bold">Unique focusers registered via email.</p>
          </div>
        </div>

        {/* Call to action Quote */}
        <div className="p-6 rounded-3xl border border-dashed border-[#B19B95]/30 bg-[#FAF7F6] text-center max-w-md w-full shadow-sm">
          <div className="flex justify-center gap-1.5 text-amber-500 mb-2">
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
          </div>
          <p className="font-caveat text-3xl text-[#B19B95]">
            You can do it beautiful
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#c6cfed] py-6 text-center text-xs text-slate-500 font-semibold z-10 bg-white/10">
        <p>© {new Date().getFullYear()} FocusFlow. Incremental Static Regeneration active.</p>
      </footer>
    </div>
  );
}
