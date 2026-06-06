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
  CheckCircle2,
  Sun,
  Moon,
  UserCog,
  X,
  AlertTriangle
} from "lucide-react";

import { syncGuestTasks } from "@/app/actions/task-actions";
import { updateNameAction, deleteAccountAction, signOutAction } from "@/app/actions/auth-actions";
import { useTimer } from "@/components/timer-context";

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
    image?: string | null;
  };
  tasks: Task[];
  isGuest?: boolean;
  activeTask?: Task | null;
  onDeleteTask?: (id: string) => Promise<void> | void;
  onSignOut?: () => void;
  isDeletingTaskId?: string | null;
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function DashboardLayout({
  user,
  tasks: propTasks,
  isGuest = false,
  activeTask: propActiveTask = null,
  onDeleteTask: propOnDeleteTask,
  onSignOut,
  isDeletingTaskId: propIsDeletingTaskId = null,
  isLoading: propIsLoading = false,
  children
}: DashboardLayoutProps) {
  const {
    tasks,
    isLoading,
    activeTask,
    timerState,
    timeMode,
    secondsRemaining,
    secondsElapsed,
    isDeletingTaskId,
    handleDeleteTask: onDeleteTask
  } = useTimer();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Profile modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(user.name || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Sync profileName state if user.name changes
  useEffect(() => {
    setProfileName(user.name || "");
  }, [user.name]);

  // Set default sidebar state based on screen size on mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileError("Name cannot be empty");
      return;
    }
    setIsSavingName(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const res = await updateNameAction(profileName);
      if (res?.error) {
        setProfileError(res.error);
      } else {
        setProfileSuccess("Name updated successfully!");
        router.refresh();
      }
    } catch (err: any) {
      setProfileError("Failed to update name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isGuest) {
      if (confirm("Are you sure you want to delete your guest session and clear all local tasks? This action cannot be undone.")) {
        localStorage.removeItem("focusflow_guest_tasks");
        document.cookie = "guest-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/";
      }
      return;
    }

    if (
      confirm(
        "WARNING: Are you sure you want to permanently delete your account? All your tasks, settings, and account details will be deleted forever. This action cannot be undone."
      )
    ) {
      setIsDeletingAccount(true);
      try {
        const res = await deleteAccountAction();
        if (res?.error) {
          alert(res.error);
          setIsDeletingAccount(false);
        } else {
          if (onSignOut) {
            onSignOut();
          } else {
            window.location.href = "/";
          }
        }
      } catch (err: any) {
        alert("Failed to delete account. Please try again.");
        setIsDeletingAccount(false);
      }
    }
  };

  // Synchronize guest tasks to database if user is logged in
  useEffect(() => {
    if (!isGuest) {
      const stored = localStorage.getItem("focusflow_guest_tasks");
      if (stored) {
        try {
          const guestTasks = JSON.parse(stored);
          if (Array.isArray(guestTasks) && guestTasks.length > 0) {
            const performSync = async () => {
              const res = await syncGuestTasks(guestTasks);
              if (res.success) {
                localStorage.removeItem("focusflow_guest_tasks");
                router.refresh();
              } else if (res.error) {
                console.error("Failed to sync guest tasks:", res.error);
              }
            };
            performSync();
          } else {
            localStorage.removeItem("focusflow_guest_tasks");
          }
        } catch (e) {
          console.error("Error parsing guest tasks for sync:", e);
        }
      }
    }
  }, [isGuest, router]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const handleStartReminder = (task: Task) => {
    // Navigate to dashboard and pre-populate the task description input
    router.push(`/dashboard?title=${encodeURIComponent(task.title)}&reminderId=${task.id}`);
  };

  const handleLeaveSession = async () => {
    // 1. Clear cookies client-side immediately
    document.cookie = "guest-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "authjs.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "__Secure-authjs.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; path=/;";
    document.cookie = "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // 2. Redirect client-side for guests, or call Server Action to sign out for authenticated users
    if (isGuest) {
      window.location.href = "/";
    } else {
      await signOutAction();
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
      {/* Backdrop overlay on mobile when sidebar or history is open */}
      {(isSidebarOpen || isHistoryOpen) && (
        <button
          type="button"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsHistoryOpen(false);
          }}
          className="fixed inset-0 bg-[#0A0614]/30 backdrop-blur-[2px] xl:hidden cursor-default w-full h-full border-none outline-none"
          style={{ zIndex: 25 }}
          aria-label="Close drawers"
        />
      )}

      {/* Header Top Bar */}
      <header className="lp-header bg-[#8869AA]/85 backdrop-blur-lg sticky top-0 z-40 shadow-sm animate-navbar-wave relative shrink-0">
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
            {/* Top Bar Timer Widget */}
            {activeTask && timerState !== "idle" && pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/35 text-[#F7F1D9] hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-sm shrink-0 cursor-pointer text-xs"
                title="Active Session - Click to view dashboard"
              >
                <span className="relative flex h-2 w-2">
                  {timerState === "running" && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${timerState === "running" ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                </span>
                <span className="font-extrabold max-w-[80px] sm:max-w-[150px] truncate leading-none">
                  {activeTask.title}
                </span>
                <span className="font-mono font-black bg-[#5C4578]/40 px-2 py-0.5 rounded text-[11px] sm:text-xs">
                  {formatTime(timeMode === "countdown" ? secondsRemaining : secondsElapsed)}
                </span>
              </Link>
            )}

            {/* Dark / Light toggle */}
            <button
              id="theme-toggle"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              onClick={() => setIsDark((d) => !d)}
              className={`w-12 h-7 rounded-full border transition-all duration-300 flex items-center p-0.5 shadow-inner backdrop-blur-md cursor-pointer shrink-0 ${
                isDark
                  ? "border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_12px_rgba(34,211,238,0.07)]"
                  : "border-amber-400/30 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.05)]"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 bg-white shadow-[0_0_8px_rgba(255,255,255,0.17)] ${
                  isDark ? "translate-x-5" : "translate-x-0"
                }`}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500/10" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                )}
              </span>
            </button>

            {/* Minimal indicator */}
          </div>
        </div>
        {/* Purple stripebar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5C4578]" />
      </header>

      {/* Sidebar Menu Drawer (Left Sliding Card Design) */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-80 border-r border-[#7B52AB]/20 bg-[#7B52AB]/10 shadow-2xl pt-24 pb-6 px-6 backdrop-blur-lg fixed inset-y-0 left-0 z-30 h-full ${
          isMounted ? "transition-all duration-300" : ""
        } shrink-0 flex flex-col`}
      >
        {/* Sliding MENU Tab Button (connected with no gap) */}
        <button
          onClick={() => {
            setIsSidebarOpen((prev) => {
              const nextVal = !prev;
              if (nextVal && typeof window !== "undefined" && window.innerWidth < 1280) {
                setIsHistoryOpen(false);
              }
              return nextVal;
            });
          }}
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
              <Link href="/analytics" className={getLinkClasses("/analytics")}>
                <BarChart3 className="w-4 h-4 text-[#B88D15]" />
                Analytics
              </Link>
              {user.email === "mistjs20@gmail.com" && (
                <Link href="/admin" className={getLinkClasses("/admin")}>
                  <UserCog className="w-4 h-4 text-[#7B52AB]" />
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Active Reminders List (Active Task Queue) */}
            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="text-xs font-black text-[#3E2361] uppercase tracking-wider mt-4 shrink-0 flex items-center gap-1.5 px-1">
                <BellRing className="w-3.5 h-3.5 text-[#B88D15]" />
                Active Reminders ({activeTasks.length})
              </h4>

              <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1">
                {isLoading ? (
                  /* Pulsing reminders skeleton list */
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-[#B88D15]/10 bg-[#FAF6E3]/20 dark:bg-white/5 backdrop-blur-md flex items-center justify-between gap-3 animate-pulse"
                    >
                      <div className="h-3 bg-slate-400/30 dark:bg-slate-700/50 rounded w-2/3" />
                      <div className="w-6 h-6 rounded bg-slate-400/30 dark:bg-slate-700/50" />
                    </div>
                  ))
                ) : activeTasks.length === 0 ? (
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
                            disabled={isDeletingTaskId === t.id}
                            onClick={() => onDeleteTask(t.id)}
                            className="p-1.5 rounded-lg bg-[#FAF6E3]/60 text-slate-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all border border-[#B88D15]/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Reminder"
                          >
                            {isDeletingTaskId === t.id ? (
                              <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Bottom: Profile & Sign Out */}
          <div className="pt-4 border-t border-[#7B52AB]/20 shrink-0 flex flex-col gap-4 mt-auto">
            {isGuest ? (
              <div className="flex flex-col gap-3.5">
                {/* Guest Alert Card */}
                <div className="glass-tray border-amber-500/30 bg-amber-500/5 p-4 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Unsaved Session</span>
                  </div>
                  <p className="text-[10px] font-bold leading-normal text-slate-600 dark:text-slate-400">
                    You are playing as a Guest. Your logs are saved only locally. Sign in to back up your data.
                  </p>
                  <button
                    onClick={() => window.location.href = "/?login=true"}
                    className="mt-1 w-full flex items-center justify-center gap-1.5 glass-pill-orange text-[9px] font-extrabold uppercase tracking-wider py-2 px-3 cursor-pointer"
                  >
                    Sign In / Register
                  </button>
                </div>

                {/* Leave Session Button */}
                <button
                  type="button"
                  onClick={handleLeaveSession}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#7B52AB]/20 bg-[#FAF6E3]/40 backdrop-blur-md hover:bg-[#FAF6E3]/60 hover:border-[#7B52AB]/35 text-xs text-[#3E2361] font-extrabold transition-all shadow-sm cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#B88D15]" />
                  <span>Leave Guest Session</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-1">
                  {/* User Photo */}
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="w-10 h-10 rounded-full border border-[#7B52AB]/20 object-cover shadow-sm shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    /* Cute Smiley Person Avatar */
                    <div className="w-10 h-10 rounded-full bg-[#7B52AB]/15 flex items-center justify-center border border-[#7B52AB]/25 shrink-0 shadow-inner">
                      <svg className="w-6 h-6 text-[#7B52AB]/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 14s1.5 2.5 4 2.5 4-2.5 4-2.5" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-black text-slate-800 truncate block leading-tight">
                      {user.name ? user.name.split(" ")[0] : "User"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 truncate block mt-0.5" title={user.email}>
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Profile Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileError("");
                      setProfileSuccess("");
                      setIsProfileOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#7B52AB]/20 bg-[#FAF6E3]/40 backdrop-blur-md hover:bg-[#FAF6E3]/60 hover:border-[#7B52AB]/35 text-xs text-[#3E2361] font-extrabold transition-all shadow-sm cursor-pointer"
                  >
                    <UserCog className="w-3.5 h-3.5 text-[#B88D15]" />
                    <span>Profile Settings</span>
                  </button>

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={handleLeaveSession}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#7B52AB]/20 bg-[#FAF6E3]/40 backdrop-blur-md hover:bg-[#FAF6E3]/60 hover:border-[#7B52AB]/35 text-xs text-[#3E2361] font-extrabold transition-all shadow-sm cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#B88D15]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar History Drawer (Cozy Card Design) */}
      <div
        className={`${
          isHistoryOpen ? "translate-x-0" : "translate-x-full"
        } w-80 border-l border-[#7B52AB]/20 bg-[#7B52AB]/10 shadow-2xl pt-24 pb-6 px-6 backdrop-blur-lg fixed inset-y-0 right-0 z-30 h-full transition-all duration-300 shrink-0 flex flex-col`}
      >
        {/* Sliding Task History Tab Button (connected with no gap) */}
        <button
          onClick={() => {
            setIsHistoryOpen((prev) => {
              const nextVal = !prev;
              if (nextVal && typeof window !== "undefined" && window.innerWidth < 1280) {
                setIsSidebarOpen(false);
              }
              return nextVal;
            });
          }}
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
            {isLoading ? (
              <span className="h-5 w-12 bg-[#7B52AB]/10 rounded-full animate-pulse border border-[#7B52AB]/20" />
            ) : (
              <span className="text-xs bg-[#7B52AB]/15 text-[#3E2361] font-extrabold px-2.5 py-1 rounded-full border border-[#7B52AB]/30 shadow-sm">
                {completedTasks.length} Done
              </span>
            )}
          </div>

          {/* Completed list */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {isLoading ? (
              /* Pulsing history skeleton list */
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-[#B88D15]/10 bg-[#FAF6E3]/20 dark:bg-white/5 backdrop-blur-md flex flex-col gap-2.5 animate-pulse"
                >
                  <div className="h-4 bg-slate-400/30 dark:bg-slate-700/50 rounded w-5/6" />
                  <div className="h-3 bg-slate-400/20 dark:bg-slate-700/40 rounded w-1/2" />
                </div>
              ))
            ) : completedTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-450 text-xs font-semibold">
                No completed focus logs yet.
              </div>
            ) : (
              completedTasks.map((t) => {
                const isInterval = /\[(chunk|interval):[^\]]+\]$/.test(t.title);
                const cleanTitle = t.title.replace(/\s\[(chunk|interval):[^\]]+\]$/, "");
                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-[#B88D15]/20 bg-[#FAF6E3]/40 backdrop-blur-md hover:bg-[#FAF6E3]/60 hover:border-[#7B52AB]/35 transition-all flex items-start justify-between gap-3 group shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-600 text-sm flex items-center flex-wrap gap-1.5">
                        <span>{cleanTitle}</span>
                        {isInterval && (
                          <span className="text-[8px] bg-amber-100/70 dark:bg-amber-500/20 text-[#B88D15] dark:text-[#D4A82A] border border-[#B88D15]/30 dark:border-amber-500/35 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 leading-none">
                            Interval
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-600 font-extrabold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {isInterval ? "Logged" : "Done"}
                        </span>
                        <span>•</span>
                        <span>Logged: {t.spentTime}m</span>
                      </div>
                    </div>
                    {onDeleteTask && (
                      <button
                        disabled={isDeletingTaskId === t.id}
                        onClick={() => onDeleteTask(t.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-450 hover:bg-rose-50 hover:text-rose-650 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete permanently"
                      >
                        {isDeletingTaskId === t.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div
        className={`flex-1 flex overflow-hidden w-full px-4 sm:px-6 gap-8 relative z-20 items-stretch transition-all duration-300
          ${isSidebarOpen ? "xl:pl-80" : "xl:pl-0"}
          ${isHistoryOpen ? "xl:pr-80" : "xl:pr-0"}
        `}
      >
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#B88D15]/20 py-4 text-center text-xs text-slate-500 shrink-0 bg-[#FAF6E3]/20 relative z-0">
        <p>© {new Date().getFullYear()} FocusFlow. Productivity Study Corner.</p>
      </footer>

      {/* Profile Modal Overlay */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0614]/85 backdrop-blur-md animate-login-backdrop">
          <div className={`rounded-[2rem] border shadow-2xl max-w-md w-full relative p-8 animate-modal-scale-up backdrop-blur-md transition-all duration-300 ${isDark ? "bg-[#150D24]/95 border-[rgba(123,82,171,0.25)] text-[#EDE8F5]" : "bg-[#FFFDF5]/95 border-[#B88D15]/20 text-slate-900"}`}>
            
            {/* Close button */}
            <button
              onClick={() => setIsProfileOpen(false)}
              className={`absolute top-5 right-5 p-2 rounded-full transition-all border cursor-pointer z-20 ${isDark ? "text-[#6B6080] border-transparent hover:text-[#A89FC0] hover:bg-[rgba(123,82,171,0.15)]" : "text-slate-400 border-transparent hover:text-slate-855 hover:bg-slate-100"}`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-5">
              <div className="text-center">
                <h3 className="font-sans font-black text-2xl tracking-tight text-[#7B52AB]">Profile Settings</h3>
                <p className={`text-xs mt-1.5 ${isDark ? "text-[#A89FC0]" : "text-slate-500"}`}>
                  Update your display name or manage your account.
                </p>
              </div>

              {profileError && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold animate-pulse">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateName} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold shadow-sm opacity-60 cursor-not-allowed ${
                      isDark
                        ? "bg-[rgba(123,82,171,0.08)] border-[rgba(123,82,171,0.25)] text-[#EDE8F5]/70"
                        : "border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-500"
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 px-1 italic">Email address cannot be changed</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profileName" className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="profileName"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your name"
                    className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold shadow-sm ${
                      isDark
                        ? "bg-[rgba(123,82,171,0.08)] border-[rgba(123,82,171,0.25)] text-[#EDE8F5]"
                        : "border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-900"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingName}
                  className="w-full flex items-center justify-center bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold py-3 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-md hover:shadow-lg disabled:opacity-75 cursor-pointer"
                >
                  {isSavingName ? "Saving..." : "Save Name Changes"}
                </button>
              </form>

              {/* Danger Zone */}
              <div className={`mt-2 border-t pt-4 flex flex-col gap-3 ${isDark ? "border-[rgba(123,82,171,0.18)]" : "border-slate-100"}`}>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-red-500 px-1">
                  Danger Zone
                </h4>
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-center gap-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold py-3 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingAccount ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete My Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
