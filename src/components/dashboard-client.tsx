"use client";

import React, { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Clock,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
  Plus,
  ChevronRight,
  ChevronLeft,
  LogOut,
  BarChart3,
  Flame,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { createTask } from "@/app/actions/task-actions";

interface Task {
  id: string;
  title: string;
  allocatedTime: number; // in minutes
  spentTime: number; // in minutes
  isCompleted: boolean;
  createdAt: string;
}

interface DashboardClientProps {
  user: {
    name: string | null;
    email: string;
  };
  initialTasks: Task[];
  isGuest?: boolean;
}

export default function DashboardClient({
  user,
  initialTasks,
  isGuest = false,
}: DashboardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [timeMode, setTimeMode] = useState<"countdown" | "countup">("countdown");
  const [timerState, setTimerState] = useState<"idle" | "running" | "paused">("idle");

  // Timer values in seconds
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync tasks when initialTasks changes (only for authenticated users)
  useEffect(() => {
    if (!isGuest) {
      setTasks(initialTasks);
    }
  }, [initialTasks, isGuest]);

  // Guest Mode: Load tasks from localStorage on client mount
  useEffect(() => {
    if (isGuest) {
      const stored = localStorage.getItem("focusflow_guest_tasks");
      if (stored) {
        try {
          setTasks(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse guest tasks:", e);
        }
      } else {
        setTasks([]);
      }
    }
  }, [isGuest]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        if (timeMode === "countdown") {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              handleAutoFinish();
              return 0;
            }
            return prev - 1;
          });
          setSecondsElapsed((prev) => prev + 1);
        } else {
          setSecondsElapsed((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, timeMode]);

  const handleAutoFinish = () => {
    setTimerState("idle");
    if (activeTask) {
      const finalSpent = Math.max(1, Math.round((secondsElapsed + 1) / 60));
      finishTaskRequest(activeTask.id, finalSpent);
    }
  };

  const startFocus = (task: Task) => {
    setActiveTask(task);
    setTimerState("running");
    setSecondsElapsed(0);
    if (timeMode === "countdown") {
      setSecondsRemaining(task.allocatedTime * 60);
    } else {
      setSecondsRemaining(0);
    }
  };

  // Helper to save guest tasks
  const saveGuestTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("focusflow_guest_tasks", JSON.stringify(newTasks));
  };

  // Handle form submission (Server Action or local storage)
  const handleStartFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title")?.toString() || "";
    const allocatedTimeStr = formData.get("allocatedTime")?.toString() || "25";
    const allocatedTime = parseInt(allocatedTimeStr, 10);

    if (!title.trim()) {
      setFormError("Task description cannot be empty");
      setIsSubmitting(false);
      return;
    }

    if (isGuest) {
      // Create guest task locally
      const guestTask: Task = {
        id: crypto.randomUUID(),
        title,
        allocatedTime: timeMode === "countup" ? 0 : allocatedTime,
        spentTime: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };

      const updated = [guestTask, ...tasks];
      saveGuestTasks(updated);
      setIsSubmitting(false);

      // Reset form
      const form = e.target as HTMLFormElement;
      form.reset();

      // Start focus immediately
      startFocus(guestTask);
    } else {
      const res = await createTask(null, formData);
      setIsSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else if (res.success && res.task) {
        const form = e.target as HTMLFormElement;
        form.reset();

        const newTask: Task = res.task;
        setTasks((prev) => [newTask, ...prev]);
        startFocus(newTask);
      }
    }
  };

  // API Request or local complete: Finish Task
  const finishTaskRequest = async (taskId: string, spentTimeMinutes: number) => {
    if (isGuest) {
      const updated = tasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: true, spentTime: spentTimeMinutes } : t
      );
      saveGuestTasks(updated);
      setActiveTask(null);
      setTimerState("idle");
      setSecondsRemaining(0);
      setSecondsElapsed(0);
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spentTime: spentTimeMinutes }),
      });

      if (!res.ok) {
        throw new Error("Failed to complete task");
      }

      const json = await res.json();
      if (json.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, isCompleted: true, spentTime: spentTimeMinutes } : t
          )
        );
        setActiveTask(null);
        setTimerState("idle");
        setSecondsRemaining(0);
        setSecondsElapsed(0);
      }
    } catch (err) {
      console.error(err);
      alert("Error finishing task. Please try again.");
    }
  };

  const handleFinishActive = () => {
    if (!activeTask) return;
    const finalSpent = Math.max(1, Math.round(secondsElapsed / 60));
    finishTaskRequest(activeTask.id, finalSpent);
  };

  // API Request or local delete: Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    if (isGuest) {
      const updated = tasks.filter((t) => t.id !== taskId);
      saveGuestTasks(updated);
      if (activeTask?.id === taskId) {
        setActiveTask(null);
        setTimerState("idle");
        setSecondsRemaining(0);
        setSecondsElapsed(0);
      }
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      const json = await res.json();
      if (json.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        if (activeTask?.id === taskId) {
          setActiveTask(null);
          setTimerState("idle");
          setSecondsRemaining(0);
          setSecondsElapsed(0);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting task.");
    }
  };

  const handleSignOut = () => {
    if (isGuest) {
      // Clear guest session cookie client side
      document.cookie = "guest-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      window.location.href = "/";
    } else {
      signOut({ callbackUrl: "/" });
    }
  };

  // Display helpers
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const displayTime = timeMode === "countdown" ? secondsRemaining : secondsElapsed;

  const totalDuration = activeTask ? activeTask.allocatedTime * 60 : 1;
  const progressPercent =
    timeMode === "countdown"
      ? (secondsRemaining / totalDuration) * 100
      : Math.min((secondsElapsed / totalDuration) * 100, 100);

  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg shadow-md shadow-indigo-500/20">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                FocusFlow
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/global-stats"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-550 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Global Stats
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isGuest ? "Sandbox Mode" : "Registered Member"}
              </span>
              <span className="text-sm font-semibold text-slate-650 truncate max-w-[180px]">
                {user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm text-slate-600 font-bold transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Leave Session</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 gap-8 relative">
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col gap-8 transition-all duration-300">
          {activeTask ? (
            /* Active Focus Timer state */
            <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-200/85 bg-white shadow-xl relative overflow-hidden">
              <div className="absolute top-[-30%] left-[-20%] h-[400px] w-[400px] rounded-full bg-indigo-100/40 blur-[100px]" />
              <div className="absolute bottom-[-30%] right-[-20%] h-[400px] w-[400px] rounded-full bg-violet-100/40 blur-[100px]" />

              <div className="z-10 flex flex-col items-center gap-6 text-center max-w-lg">
                <div className="px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-650 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />
                  Focusing: {timeMode === "countdown" ? "Countdown" : "Count Up"}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {activeTask.title}
                </h2>

                {/* Animated Circular Timer */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="110"
                      className="stroke-slate-100 fill-none"
                      strokeWidth="8"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="110"
                      className="stroke-indigo-600 fill-none transition-all duration-1000 ease-linear"
                      strokeWidth="8"
                      strokeDasharray="691"
                      strokeDashoffset={timeMode === "countdown" ? 691 - (691 * progressPercent) / 100 : strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex flex-col items-center z-10">
                    <span className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-slate-900 font-mono">
                      {formatTime(displayTime)}
                    </span>
                    <span className="text-xs text-slate-450 mt-2 font-bold tracking-wide">
                      Target: {activeTask.allocatedTime || "∞"}m | Elapsed: {formatTime(secondsElapsed)}
                    </span>
                  </div>
                </div>

                {/* Timer Actions */}
                <div className="flex items-center gap-4 mt-4 w-full">
                  {timerState === "running" ? (
                    <button
                      onClick={() => setTimerState("paused")}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all shadow-sm"
                    >
                      <Pause className="w-5 h-5 text-slate-450" />
                      Pause Timer
                    </button>
                  ) : (
                    <button
                      onClick={() => setTimerState("running")}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/15 transition-all"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Resume Focus
                    </button>
                  )}
                  <button
                    onClick={handleFinishActive}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/10 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Finish Task
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (confirm("Cancel session? Focus progress will not be saved.")) {
                      setActiveTask(null);
                      setTimerState("idle");
                      setSecondsRemaining(0);
                      setSecondsElapsed(0);
                    }
                  }}
                  className="text-xs text-slate-450 hover:text-rose-500 font-bold transition-colors mt-2"
                >
                  Cancel Focus Session
                </button>
              </div>
            </div>
          ) : (
            /* Config & Form Creation State */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Card */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-slate-200/80 bg-white shadow-lg flex flex-col gap-6">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Create Focus Block</h2>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl border border-rose-250 bg-rose-50 text-rose-600 text-sm font-semibold">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleStartFormSubmit} className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="title" className="text-xs font-bold text-slate-450 uppercase tracking-wide">
                      What are you working on?
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      placeholder="e.g. Designing mockup, Writing docs..."
                      className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="timeMode" className="text-xs font-bold text-slate-450 uppercase tracking-wide">
                        Timer Mode
                      </label>
                      <div className="relative">
                        <select
                          id="timeMode"
                          value={timeMode}
                          onChange={(e) => setTimeMode(e.target.value as "countdown" | "countup")}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm font-semibold appearance-none cursor-pointer"
                        >
                          <option value="countdown">Countdown Mode</option>
                          <option value="countup">Count Up Mode</option>
                        </select>
                        <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="allocatedTime" className="text-xs font-bold text-slate-450 uppercase tracking-wide">
                        Allocated Time (Minutes)
                      </label>
                      <input
                        type="number"
                        name="allocatedTime"
                        id="allocatedTime"
                        required={timeMode === "countdown"}
                        min="1"
                        max="180"
                        defaultValue="25"
                        disabled={timeMode === "countup"}
                        className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all disabled:opacity-70 group"
                  >
                    {isSubmitting ? "Creating..." : "Start Focus Session"}
                    <Play className="w-4 h-4 fill-white transition-transform group-hover:scale-105" />
                  </button>
                </form>
              </div>

              {/* In-progress Queue */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide px-1">
                  Active Task Queue ({activeTasks.length})
                </h3>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {activeTasks.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm font-semibold bg-white/50">
                      No active tasks. Create a focus block to get started!
                    </div>
                  ) : (
                    activeTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-4 group shadow-sm hover:shadow"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{t.title}</p>
                          <p className="text-xs text-slate-400 font-bold mt-1">
                            Target: {t.allocatedTime || "∞"} mins
                          </p>
                        </div>
                        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startFocus(t)}
                            className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            title="Start Focus"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar History Drawer */}
        <div
          className={`${
            isHistoryOpen ? "w-80" : "w-0"
          } transition-all duration-300 shrink-0 border-l border-slate-200/80 flex flex-col relative h-[calc(100vh-140px)]`}
        >
          {/* Toggle */}
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="absolute top-1/2 -left-3.5 -translate-y-1/2 p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-450 transition-all z-10 shadow-sm"
            title={isHistoryOpen ? "Close Task History" : "Open Task History"}
          >
            {isHistoryOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {isHistoryOpen && (
            <div className="flex flex-col h-full pl-6 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 shrink-0">
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  Task History
                </h3>
                <span className="text-xs bg-slate-100 text-slate-650 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {completedTasks.length} Completed
                </span>
              </div>

              {/* Completed list */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                {completedTasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm font-semibold">
                    No completed focus logs.
                  </div>
                ) : (
                  completedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-3 group shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-700 text-sm line-through decoration-slate-400 truncate">
                          {t.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Done
                          </span>
                          <span>•</span>
                          <span>Spent: {t.spentTime}m</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden border-t border-slate-200 bg-white p-4 text-center shrink-0">
        <Link
          href="/global-stats"
          className="inline-flex items-center gap-2 text-sm text-indigo-650 font-bold"
        >
          <BarChart3 className="w-4 h-4" />
          View Global Stats
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 shrink-0 bg-white/40">
        <p>© {new Date().getFullYear()} FocusFlow. Productivity Dashboard.</p>
      </footer>
    </div>
  );
}
