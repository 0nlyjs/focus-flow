"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
  RotateCcw,
  Play,
  Trash2,
  BellRing,
  Clock,
  LayoutDashboard,
  CheckCircle2
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  allocatedTime: number;
  spentTime: number;
  isCompleted: boolean;
  createdAt: string;
}

interface DashboardLayoutProps {
  user: {
    name: string | null;
    email: string;
  };
  tasks: Task[];
  isGuest?: boolean;
  activeTask?: Task | null;
  onDeleteTask?: (id: string) => Promise<void> | void;
  onSignOut?: () => void;
  children: React.ReactNode;
}

export default function DashboardLayout({
  user,
  tasks,
  isGuest = false,
  activeTask = null,
  onDeleteTask,
  onSignOut,
  children
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const handleStartReminder = (task: Task) => {
    // Navigate to dashboard and pre-populate the task description input
    router.push(`/dashboard?title=${encodeURIComponent(task.title)}&reminderId=${task.id}`);
  };

  const handleLeaveSession = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      // Fallback
      if (isGuest) {
        document.cookie = "guest-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/";
      }
    }
  };

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    const base = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all";
    if (isActive) {
      return `${base} bg-[#7B52AB]/15 text-[#3E2361] shadow-sm`;
    }
    return `${base} text-slate-700 hover:text-slate-900 hover:bg-[#7B52AB]/5`;
  };

  return (
    <div className="h-screen flex flex-col justify-between bg-transparent overflow-hidden">

      {/* Header Top Bar */}
      <header className="bg-[#8869AA]/85 backdrop-blur-lg sticky top-0 z-40 shadow-sm animate-navbar-wave relative shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="font-sans font-semibold text-2xl tracking-tight text-[#F7F1D9]/90 hover:text-[#F7F1D9] transition-colors inline-flex items-center leading-none"
            >
              FocusFlow
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Minimal indicator */}
            <span className="hidden sm:inline text-xs font-extrabold uppercase tracking-wider text-[#B88D15]">
              {isGuest ? "Sandbox Mode" : "Registered Member"}
            </span>
          </div>
        </div>
        {/* Purple stripebar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5C4578]" />
      </header>

      {/* Sidebar Menu Drawer (Left Sliding Card Design) */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-80 border-r border-[#7B52AB]/20 bg-[#7B52AB]/10 shadow-2xl pt-24 pb-6 px-6 backdrop-blur-lg fixed inset-y-0 left-0 z-30 h-full transition-all duration-300 shrink-0 flex flex-col`}
      >
        {/* Sliding MENU Tab Button (connected with no gap) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-1/3 right-0 translate-x-full z-40 flex flex-col items-center gap-2 py-5 px-2.5 bg-[#7B52AB]/15 hover:bg-[#7B52AB]/25 border-y border-r border-[#7B52AB]/20 text-[#3E2361] font-extrabold rounded-r-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer select-none backdrop-blur-md"
          title={isSidebarOpen ? "Close Menu" : "Open Menu"}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-[#B88D15]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#B88D15] animate-pulse" />
          )}
          <span className="[writing-mode:vertical-lr] rotate-180 uppercase tracking-widest text-[9px] text-[#7B52AB] mt-1">
            MENU
          </span>
        </button>

        <div
          className="flex flex-col h-full overflow-hidden"
          inert={!isSidebarOpen}
        >
          <div className="flex flex-col gap-6 h-full overflow-hidden">
            {/* Sidebar Top: Title */}
            <div className="flex items-center justify-between pb-4 border-b border-[#7B52AB]/20 shrink-0 mb-4">
              <h3 className="font-black text-slate-900 text-sm tracking-widest uppercase">
                Menu
              </h3>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1 shrink-0">
              <Link href="/dashboard" className={getLinkClasses("/dashboard")}>
                <LayoutDashboard className="w-4 h-4 text-[#B88D15]" />
                Focus Dashboard
              </Link>
              <Link href="/reminders" className={getLinkClasses("/reminders")}>
                <BellRing className="w-4 h-4 text-[#7B52AB]" />
                My Reminders
              </Link>
              <Link href="/global-stats" className={getLinkClasses("/global-stats")}>
                <BarChart3 className="w-4 h-4 text-[#B88D15]" />
                Global Stats
              </Link>
            </nav>

            {/* Active Reminders List (Active Task Queue) */}
            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="text-xs font-black text-[#3E2361] uppercase tracking-wider mt-4 shrink-0 flex items-center gap-1.5 px-1">
                <BellRing className="w-3.5 h-3.5 text-[#B88D15]" />
                Active Reminders ({activeTasks.length})
              </h4>

              <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1">
                {activeTasks.length === 0 ? (
                  <div className="p-5 rounded-2xl border border-[#B88D15]/20 bg-[#B88D15]/5 text-center flex flex-col items-center gap-2">
                    <p className="text-[11px] text-slate-500 font-bold">
                      No active reminders. Go to My Reminders to add some!
                    </p>
                  </div>
                ) : (
                  activeTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-[#B88D15]/20 bg-[#FAF6E3]/40 backdrop-blur-md hover:bg-[#FAF6E3]/60 hover:border-[#7B52AB]/35 transition-all flex items-center justify-between gap-3 group shadow-sm"
                    >
                      <span className="font-bold text-slate-800 text-xs truncate flex-1 leading-snug">
                        {t.title}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => handleStartReminder(t)}
                          className="p-1.5 rounded-lg bg-[#7B52AB]/15 text-[#3E2361] hover:bg-[#7B52AB] hover:text-white transition-all border border-[#7B52AB]/20 cursor-pointer"
                          title="Start Focus Session"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                        {onDeleteTask && (
                          <button
                            onClick={() => onDeleteTask(t.id)}
                            className="p-1.5 rounded-lg bg-[#FAF6E3]/60 text-slate-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all border border-[#B88D15]/10 cursor-pointer"
                            title="Delete Reminder"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Bottom: Profile & Leave Session */}
          <div className="pt-4 border-t border-[#7B52AB]/20 shrink-0 flex flex-col gap-4 mt-auto">
            <div className="flex flex-col px-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#B88D15]">
                {isGuest ? "Sandbox Profile" : "Registered Focuser"}
              </span>
              <span className="text-xs font-bold text-slate-700 truncate block mt-0.5" title={user.email}>
                {user.email}
              </span>
            </div>
            <button
              onClick={handleLeaveSession}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#7B52AB]/20 bg-[#FAF6E3]/40 backdrop-blur-md hover:bg-[#FAF6E3]/60 hover:border-[#7B52AB]/35 text-xs text-[#3E2361] font-extrabold transition-all shadow-sm cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#B88D15]" />
              <span>Leave Session</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`flex-1 flex overflow-hidden w-full px-4 sm:px-6 py-6 sm:py-8 gap-8 relative z-10 items-stretch transition-all duration-300
          ${isSidebarOpen ? "lg:pl-80" : "lg:pl-0"}
          ${isHistoryOpen ? "lg:pr-80" : "lg:pr-0"}
        `}
      >
        {children}

        {/* Sidebar History Drawer (Cozy Card Design) */}
        <div
          className={`${
            isHistoryOpen ? "translate-x-0" : "translate-x-full"
          } w-80 border-l border-[#7B52AB]/20 bg-[#7B52AB]/10 shadow-2xl pt-24 pb-6 px-6 backdrop-blur-lg fixed inset-y-0 right-0 z-30 h-full transition-all duration-300 shrink-0 flex flex-col`}
        >
          {/* Sliding Task History Tab Button (connected with no gap) */}
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="absolute top-1/3 left-0 -translate-x-full z-40 flex flex-col items-center gap-2 py-5 px-2.5 bg-[#7B52AB]/15 hover:bg-[#7B52AB]/25 border-y border-l border-[#7B52AB]/20 text-[#3E2361] font-extrabold rounded-l-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer select-none backdrop-blur-md"
            title={isHistoryOpen ? "Close Task History" : "Open Task History"}
          >
            {isHistoryOpen ? (
              <ChevronRight className="w-4 h-4 text-[#B88D15]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#B88D15] animate-pulse" />
            )}
            <span className="[writing-mode:vertical-lr] rotate-180 uppercase tracking-widest text-[9px] text-[#7B52AB] mt-1">
              Task History
            </span>
          </button>

          <div
            className="flex flex-col h-full overflow-hidden"
            inert={!isHistoryOpen}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#7B52AB]/20 shrink-0 mb-4">
              <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-[#B88D15]" />
                Focus History
              </h3>
              <span className="text-xs bg-[#7B52AB]/15 text-[#3E2361] font-extrabold px-2.5 py-1 rounded-full border border-[#7B52AB]/30 shadow-sm">
                {completedTasks.length} Done
              </span>
            </div>

            {/* Completed list */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {completedTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-450 text-xs font-semibold">
                  No completed focus logs yet.
                </div>
              ) : (
                completedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-[#B88D15]/20 bg-[#FAF6E3]/40 backdrop-blur-md hover:bg-[#FAF6E3]/60 hover:border-[#7B52AB]/35 transition-all flex items-start justify-between gap-3 group shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-600 text-sm line-through decoration-slate-350 truncate">
                        {t.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-600 font-extrabold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Done
                        </span>
                        <span>•</span>
                        <span>Logged: {t.spentTime}m</span>
                      </div>
                    </div>
                    {onDeleteTask && (
                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-650 cursor-pointer transition-all"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#B88D15]/20 py-4 text-center text-xs text-slate-500 shrink-0 bg-[#FAF6E3]/20 relative z-10">
        <p>© {new Date().getFullYear()} FocusFlow. Productivity Study Corner.</p>
      </footer>
    </div>
  );
}
