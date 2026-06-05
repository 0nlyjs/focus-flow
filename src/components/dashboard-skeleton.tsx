import React from "react";
import { LayoutDashboard, BellRing, BarChart3, Clock, Moon } from "lucide-react";

interface DashboardSkeletonLayoutProps {
  children: React.ReactNode;
}

export function DashboardSkeletonLayout({ children }: DashboardSkeletonLayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="h-screen flex flex-col justify-between bg-transparent overflow-hidden">
      {/* Header Top Bar Skeleton */}
      <header className="lp-header bg-[#8869AA]/85 backdrop-blur-lg sticky top-0 z-40 shadow-sm relative shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-sans font-semibold text-2xl tracking-tight text-[#F7F1D9]/90 inline-flex items-center leading-none select-none">
              FocusFlow
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Placeholder */}
            <div className="w-12 h-7 rounded-full border border-cyan-400/20 bg-cyan-500/5 flex items-center p-0.5 shadow-inner shrink-0 opacity-60">
              <span className="w-6 h-6 rounded-full bg-white/40 shadow flex items-center justify-center">
                <Moon className="w-3.5 h-3.5 text-cyan-550/40" />
              </span>
            </div>
          </div>
        </div>
        {/* Purple stripebar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5C4578]" />
      </header>

      {/* Sidebar Menu Drawer Skeleton (Left Side) */}
      <div className="w-80 border-r border-[#7B52AB]/20 bg-[#7B52AB]/10 shadow-2xl pt-24 pb-6 px-6 backdrop-blur-lg fixed inset-y-0 left-0 z-30 h-full shrink-0 hidden lg:flex flex-col">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex flex-col gap-6 h-full overflow-hidden">
            {/* Sidebar Top: Title */}
            <div className="flex items-center justify-between pb-4 border-b border-[#7B52AB]/20 shrink-0 mb-4">
              <h3 className="font-black text-slate-900 text-sm tracking-widest uppercase opacity-40">
                Menu
              </h3>
            </div>

            {/* Navigation Links Skeleton */}
            <nav className="flex flex-col gap-1 shrink-0">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700/60 bg-[#7B52AB]/5">
                <LayoutDashboard className="w-4 h-4 text-[#B88D15]/60" />
                <div className="h-3 w-28 bg-slate-305/40 dark:bg-slate-700/40 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700/40">
                <BellRing className="w-4 h-4 text-[#7B52AB]/40" />
                <div className="h-3 w-24 bg-slate-300/30 dark:bg-slate-700/30 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700/40">
                <BarChart3 className="w-4 h-4 text-[#B88D15]/40" />
                <div className="h-3 w-20 bg-slate-300/30 dark:bg-slate-700/30 rounded animate-pulse" />
              </div>
            </nav>

            {/* Active Reminders List Skeleton */}
            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="text-xs font-black text-[#3E2361]/60 uppercase tracking-wider mt-4 shrink-0 flex items-center gap-1.5 px-1">
                <BellRing className="w-3.5 h-3.5 text-[#B88D15]/60" />
                Active Reminders
              </h4>

              <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-[#B88D15]/10 bg-[#FAF6E3]/20 dark:bg-white/5 backdrop-blur-md flex items-center justify-between gap-3 animate-pulse"
                  >
                    <div className="h-3 bg-slate-300/40 dark:bg-slate-700/40 rounded w-2/3" />
                    <div className="w-6 h-6 rounded bg-slate-300/40 dark:bg-slate-700/40" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Bottom: Profile Skeleton */}
          <div className="pt-4 border-t border-[#7B52AB]/20 shrink-0 flex flex-col gap-4 mt-auto">
            <div className="flex items-center gap-3 px-1">
              <div className="w-10 h-10 rounded-full bg-[#7B52AB]/10 flex items-center justify-center border border-[#7B52AB]/15 shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="h-3.5 w-16 bg-slate-300/40 dark:bg-slate-700/40 rounded animate-pulse" />
                <div className="h-2.5 w-28 bg-slate-300/30 dark:bg-slate-700/30 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Workspace Layout */}
      <div className="flex-1 flex overflow-hidden w-full px-4 sm:px-6 gap-8 relative z-20 items-stretch transition-all duration-300 lg:pl-80">
        {children}
      </div>

      {/* Footer Skeleton */}
      <footer className="border-t border-[#B88D15]/20 py-4 text-center text-xs text-slate-500 shrink-0 bg-[#FAF6E3]/20 relative z-0">
        <p>© {currentYear} FocusFlow. Productivity Study Corner.</p>
      </footer>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Individual Page Skeletons
// ────────────────────────────────────────────────────────────────────────────────

// 1. Dashboard Page Content Skeleton
export function DashboardSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-6 pr-1 transition-all duration-300 overflow-y-auto py-6 sm:py-8 max-w-3xl mx-auto w-full items-stretch">
      <div className="w-full p-8 sm:p-10 glass-tray flex flex-col justify-center gap-6 shrink-0 animate-pulse">
        {/* Greetings Skeleton */}
        <div className="flex flex-col text-left gap-3">
          <div className="h-9 w-48 bg-slate-300/40 dark:bg-slate-700/40 rounded" />
          <div className="h-5 w-72 bg-slate-300/30 dark:bg-slate-700/30 rounded italic" />
        </div>

        {/* Form Input Skeleton */}
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-36 bg-slate-300/30 dark:bg-slate-700/30 rounded px-2" />
            <div className="w-full h-12 bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 bg-slate-300/30 dark:bg-slate-700/30 rounded px-2" />
              <div className="w-full h-12 bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-3 w-36 bg-slate-300/30 dark:bg-slate-700/30 rounded px-2" />
              <div className="w-full h-12 bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-full" />
            </div>
          </div>

          {/* Button Skeleton */}
          <div className="w-full h-14 bg-slate-400/25 dark:bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Focus Calendar Skeleton */}
      <div className="w-full glass-tray p-4 sm:p-5 flex flex-col gap-3.5 shrink-0 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-slate-300/40 dark:bg-slate-700/40 rounded" />
          <div className="h-7 w-28 bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-lg" />
        </div>
        <div className="grid grid-cols-7 gap-1.5 h-28 bg-white/20 dark:bg-white/5 rounded-xl p-2" />
        <div className="h-4 w-full bg-slate-300/20 dark:bg-slate-700/20 rounded-md mt-2" />
      </div>
    </div>
  );
}

// 2. Reminders Page Content Skeleton
export function RemindersSkeleton() {
  return (
    <div className="flex-1 flex justify-center overflow-y-auto w-full transition-all duration-300 py-6 sm:py-8">
      <div className="w-full max-w-3xl flex flex-col gap-8 px-2 py-4">
        {/* Banner Heading Skeleton */}
        <div className="flex flex-col gap-2.5 text-left shrink-0 animate-pulse">
          <div className="h-7 w-36 bg-slate-300/30 dark:bg-slate-700/30 rounded" />
          <div className="h-9 w-64 bg-slate-300/40 dark:bg-slate-700/40 rounded" />
          <div className="h-4 w-full bg-slate-300/20 dark:bg-slate-700/20 rounded" />
        </div>

        {/* Add Reminder Card Skeleton */}
        <div className="w-full p-6 sm:p-8 glass-tray flex flex-col gap-6 shrink-0 animate-pulse">
          <div className="h-5 w-40 bg-slate-300/40 dark:bg-slate-700/40 rounded" />
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="flex-1 h-12 bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-full" />
            <div className="w-32 h-12 bg-slate-400/25 dark:bg-white/10 rounded-full" />
          </div>
        </div>

        {/* Reminders Queue Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="h-4 w-44 bg-slate-300/30 dark:bg-slate-700/30 rounded px-1 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-tray h-48 p-6 flex flex-col justify-between gap-5 animate-pulse">
                <div className="flex flex-col gap-2.5">
                  <div className="h-3.5 w-24 bg-slate-300/30 dark:bg-slate-700/30 rounded" />
                  <div className="h-4 w-full bg-slate-300/40 dark:bg-slate-700/40 rounded" />
                  <div className="h-4 w-2/3 bg-slate-300/40 dark:bg-slate-700/40 rounded" />
                </div>
                <div className="flex justify-between border-t border-slate-200/20 pt-4">
                  <div className="w-24 h-8 bg-slate-400/25 dark:bg-white/10 rounded-full" />
                  <div className="w-8 h-8 rounded-full bg-slate-400/25 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Analytics Page Content Skeleton
export function AnalyticsSkeleton() {
  return (
    <div className="flex-1 flex justify-center overflow-y-auto w-full transition-all duration-300 py-6 sm:py-8">
      <div className="w-full max-w-3xl flex flex-col gap-8 px-2 py-4">
        {/* Header Section Skeleton */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 w-full animate-pulse">
          <div className="flex flex-col gap-3 text-left">
            <div className="h-7 w-36 bg-slate-300/30 dark:bg-slate-700/30 rounded" />
            <div className="h-9 w-48 bg-slate-300/40 dark:bg-slate-700/40 rounded" />
            <div className="h-4 w-96 bg-slate-300/20 dark:bg-slate-700/20 rounded" />
          </div>
        </div>

        {/* Timeframe selector header skeleton */}
        <div className="h-14 w-full bg-[#FAF6E3]/20 dark:bg-[#7B52AB]/5 border border-[#7B52AB]/10 rounded-2xl animate-pulse" />

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="glass-tray h-32 p-6 flex flex-col justify-between">
              <div className="h-3 w-24 bg-slate-300/30 dark:bg-slate-700/30 rounded" />
              <div className="h-8 w-28 bg-slate-300/40 dark:bg-slate-700/40 rounded" />
              <div className="h-3 w-40 bg-slate-300/20 dark:bg-slate-700/20 rounded" />
            </div>
          ))}
        </div>

        {/* Focus style rhythm card skeleton */}
        <div className="glass-tray p-6 sm:p-8 flex flex-col gap-6 animate-pulse">
          <div className="h-5 w-40 bg-slate-300/40 dark:bg-slate-700/40 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Admin Page Content Skeleton
export function AdminSkeleton() {
  return (
    <div className="flex-1 flex justify-center overflow-y-auto w-full transition-all duration-300 py-6 sm:py-8">
      <div className="w-full max-w-4xl flex flex-col gap-8 px-4 py-4">
        {/* Admin Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full animate-pulse">
          <div className="flex flex-col gap-3 text-left">
            <div className="h-7 w-40 bg-slate-300/30 dark:bg-slate-700/30 rounded" />
            <div className="h-9 w-56 bg-slate-300/40 dark:bg-slate-700/40 rounded" />
            <div className="h-4 w-96 bg-slate-300/20 dark:bg-slate-700/20 rounded" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-tray h-28 p-5 flex flex-col justify-between">
              <div className="h-2.5 w-20 bg-slate-300/30 dark:bg-slate-700/30 rounded" />
              <div className="h-7 w-20 bg-slate-300/40 dark:bg-slate-700/40 rounded" />
              <div className="h-2.5 w-24 bg-slate-300/20 dark:bg-slate-700/20 rounded" />
            </div>
          ))}
        </div>

        {/* User list block skeleton */}
        <div className="glass-tray p-6 flex flex-col gap-6 animate-pulse">
          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-36 bg-slate-300/40 dark:bg-slate-700/40 rounded" />
              <div className="h-3 w-56 bg-slate-300/30 dark:bg-slate-700/30 rounded" />
            </div>
            <div className="w-48 h-8 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-xl" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
