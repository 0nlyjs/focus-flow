"use client";

import React, { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  LogOut,
  BarChart3,
  Flame,
  RotateCcw,
  History,
  Sparkles,
  Music,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { createTask } from "@/app/actions/task-actions";
import InteractiveParticles from "@/components/interactive-particles";

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

const INSPIRATIONAL_QUOTES = [
  "One step at a time, you've got this!",
  "Keep growing, keep focusing.",
  "Take a deep breath, you've got this!",
  "Focus flows naturally.",
  "Make today cozy and focused.",
];

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
  const [currentQuote, setCurrentQuote] = useState(INSPIRATIONAL_QUOTES[0]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Rotate quotes every focus session
  useEffect(() => {
    if (activeTask) {
      const randomIndex = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
      setCurrentQuote(INSPIRATIONAL_QUOTES[randomIndex]);
    }
  }, [activeTask]);

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

      const form = e.target as HTMLFormElement;
      form.reset();

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
    <div className="relative h-screen max-h-screen w-screen overflow-hidden bg-[#FAF6E3] text-slate-800 font-sans flex flex-col justify-between selection:bg-[#7B52AB]/20 selection:text-[#3E2361]">
      <InteractiveParticles />
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#EADBF7]/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#FAF6E3]/40 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="bg-[#8869AA]/85 backdrop-blur-lg sticky top-0 z-40 shadow-sm animate-navbar-wave relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="font-sans font-semibold text-2xl tracking-tight text-[#F7F1D9]/90 hover:text-[#F7F1D9] transition-colors inline-flex items-center leading-none"
            >
              FocusFlow
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/global-stats"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm text-[#F7F1D9]/80 hover:text-[#F7F1D9] hover:bg-[#FAF6E3]/10 transition-colors font-bold"
              >
                <BarChart3 className="w-4 h-4 text-[#F7F1D9]" />
                Global Stats
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B88D15]">
                {isGuest ? "Sandbox Mode" : "Registered Member"}
              </span>
              <span className="text-sm font-bold text-[#F7F1D9] truncate max-w-[200px]">
                {user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-[#F7F1D9] hover:bg-[#F7F1D9]/90 text-[#3E2361] font-extrabold px-5 py-2 rounded-full text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#3E2361]" />
              <span>Leave Session</span>
            </button>
          </div>
        </div>
        {/* Purple stripebar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5C4578]" />
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 gap-8 relative z-10 items-stretch">
        
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-1 transition-all duration-300">
          {activeTask ? (
            /* Active Focus Timer State (Aesthetic Music Player Dial Style) */
            <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-3xl border border-[#B88D15]/20 bg-[#FAF6E3]/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
              <div className="absolute top-[-30%] left-[-20%] h-[400px] w-[400px] rounded-full bg-[#EADBF7]/50 blur-[100px]" />
              
              <div className="z-10 flex flex-col items-center gap-5 text-center max-w-lg">
                
                {/* Handwritten Cozy Encouragement Text */}
                <div className="font-caveat text-4xl text-[#B88D15] animate-pulse py-1">
                  {currentQuote}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {activeTask.title}
                </h2>

                {/* Animated Clock Circle Dial */}
                <div className="relative w-60 h-60 flex items-center justify-center bg-[#FAF6E3]/60 rounded-full border border-[#B88D15]/20 shadow-inner">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle
                      cx="120"
                      cy="120"
                      r="102"
                      className="stroke-slate-200/50 fill-none"
                      strokeWidth="6"
                      transform="translate(8, 8)"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="102"
                      className="stroke-[#B88D15] fill-none transition-all duration-1000 ease-linear"
                      strokeWidth="6"
                      strokeDasharray="640"
                      strokeDashoffset={timeMode === "countdown" ? 640 - (640 * progressPercent) / 100 : strokeDashoffset}
                      strokeLinecap="round"
                      transform="translate(8, 8)"
                    />
                  </svg>
                  
                  {/* Digital Clock reading */}
                  <div className="flex flex-col items-center z-10">
                    <span className="text-5xl font-black tracking-tight text-slate-900 font-mono">
                      {formatTime(displayTime)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                      Elapsed: {formatTime(secondsElapsed)}
                    </span>
                  </div>
                </div>

                {/* Cute music Lo-fi controls bar */}
                <div className="p-3 w-64 rounded-full bg-[#FAF6E3]/60 backdrop-blur-md border border-[#B88D15]/20 flex items-center justify-between shadow-inner">
                  <button
                    onClick={() => {
                      if (confirm("Cancel session? Focus progress will not be saved.")) {
                        setActiveTask(null);
                        setTimerState("idle");
                        setSecondsRemaining(0);
                        setSecondsElapsed(0);
                      }
                    }}
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                    title="Cancel Focus"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </button>

                  <div className="flex items-center gap-3">
                    {timerState === "running" ? (
                      <button
                        onClick={() => setTimerState("paused")}
                        className="p-2.5 rounded-full bg-[#7B52AB]/60 hover:bg-[#7B52AB]/80 text-white shadow-sm transition-all border border-[#7B52AB]/30"
                        title="Pause Timer"
                      >
                        <Pause className="w-5 h-5 fill-current" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setTimerState("running")}
                        className="p-2.5 rounded-full bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white shadow-sm transition-all animate-bounce"
                        title="Resume Timer"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleFinishActive}
                    className="p-1.5 rounded-full text-emerald-600 hover:text-emerald-700 transition-colors"
                    title="Finish Task"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Main Action Button */}
                <button
                  onClick={handleFinishActive}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg transition-all backdrop-blur-md cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Finish Focus Block
                </button>
              </div>
            </div>
          ) : (
            /* Config & Form Creation State */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-[#B88D15]/20 bg-[#B88D15]/10 shadow-xl backdrop-blur-lg flex flex-col gap-6">
                <div className="flex items-center gap-2 text-[#B88D15]">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Create Focus Block</h2>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 text-sm font-bold shadow-sm">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleStartFormSubmit} className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="title" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      What are you working on?
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      placeholder="e.g. Designing mockup, Writing docs..."
                      className="px-4 py-3 rounded-2xl border border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="timeMode" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Timer Mode
                      </label>
                      <div className="relative">
                        <select
                          id="timeMode"
                          value={timeMode}
                          onChange={(e) => setTimeMode(e.target.value as "countdown" | "countup")}
                          className="w-full px-4 py-3 rounded-2xl border border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold appearance-none cursor-pointer shadow-sm"
                        >
                          <option value="countdown">Countdown Mode</option>
                          <option value="countup">Count Up Mode</option>
                        </select>
                        <ChevronRight className="w-4 h-4 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="allocatedTime" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
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
                        className="px-4 py-3 rounded-2xl border border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition-all backdrop-blur-md disabled:opacity-70 group text-sm uppercase tracking-wider cursor-pointer"
                  >
                    {isSubmitting ? "Creating..." : "Start Focus Session"}
                    <Play className="w-4 h-4 fill-white transition-transform group-hover:scale-105" />
                  </button>
                </form>
              </div>

              {/* In-progress Queue (Empty state cute vector cat) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-slate-650 uppercase tracking-wide px-1">
                  Active Task Queue ({activeTasks.length})
                </h3>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {activeTasks.length === 0 ? (
                    <div className="p-6 rounded-3xl border border-[#B88D15]/20 bg-[#B88D15]/10 backdrop-blur-lg text-center shadow-md flex flex-col items-center gap-3">
                      <Image
                        src="/cat_sleeping.png"
                        alt="Cute grey cat sleeping curled up next to yarn"
                        width={130}
                        height={130}
                        className="object-contain animate-pulse"
                      />
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                        Your queue is resting... Form a new focus block to get going!
                      </p>
                    </div>
                  ) : (
                    activeTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl border border-[#B88D15]/20 bg-[#FAF6E3]/40 backdrop-blur-md hover:bg-[#FAF6E3]/60 hover:border-[#7B52AB]/50 transition-all flex items-center justify-between gap-4 group shadow-sm hover:shadow"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{t.title}</p>
                          <p className="text-xs text-slate-500 font-bold mt-1">
                            Target: {t.allocatedTime || "∞"} mins
                          </p>
                        </div>
                        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startFocus(t)}
                            className="p-2 rounded-lg bg-[#7B52AB]/15 text-[#3E2361] hover:bg-[#7B52AB] hover:text-white transition-all shadow-sm border border-[#7B52AB]/30 cursor-pointer"
                            title="Start Focus"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="p-2 rounded-lg bg-[#FAF6E3]/60 text-slate-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all shadow-sm border border-[#B88D15]/20 cursor-pointer"
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
        {/* Sidebar History Drawer (Cozy Card Design) */}
        <div
          className={`${
            isHistoryOpen
              ? "translate-x-0 w-80 border-l border-[#7B52AB]/20 bg-[#7B52AB]/10 shadow-2xl pt-24 pb-6 px-6 backdrop-blur-lg"
              : "translate-x-full border-none p-0"
          } fixed inset-y-0 right-0 z-30 h-full transition-all duration-300 shrink-0 flex flex-col`}
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

          {isHistoryOpen && (
            <div className="flex flex-col h-full overflow-hidden">
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
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-650 cursor-pointer transition-all"
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



      <div className="md:hidden border-t border-[#B88D15]/20 bg-[#FAF6E3]/40 backdrop-blur-md p-4 text-center shrink-0">
        <Link
          href="/global-stats"
          className="inline-flex items-center gap-2 text-sm text-[#B88D15] font-bold"
        >
          <BarChart3 className="w-4 h-4" />
          View Global Stats
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#B88D15]/20 py-4 text-center text-xs text-slate-500 shrink-0 bg-[#FAF6E3]/20">
        <p>© {new Date().getFullYear()} FocusFlow. Productivity Study Corner.</p>
      </footer>
    </div>
  );
}
