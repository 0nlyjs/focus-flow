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
  Trophy,
} from "lucide-react";
import { createTask, logTaskInterval } from "@/app/actions/task-actions";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";

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

  const searchParams = useSearchParams();
  const router = useRouter();
  const queryTitle = searchParams.get("title");
  const queryReminderId = searchParams.get("reminderId");

  const [taskTitle, setTaskTitle] = useState("");

  useEffect(() => {
    if (queryTitle) {
      setTaskTitle(queryTitle);
    }
  }, [queryTitle]);

  // Timer values in seconds
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const [showLogIntervalConfirm, setShowLogIntervalConfirm] = useState(false);
  const [showFinishSuccess, setShowFinishSuccess] = useState(false);
  const [loggedMinutes, setLoggedMinutes] = useState(0);

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
        id: queryReminderId || crypto.randomUUID(),
        title,
        allocatedTime: timeMode === "countup" ? 0 : allocatedTime,
        spentTime: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };

      const remainingTasks = queryReminderId
        ? tasks.filter((t) => t.id !== queryReminderId)
        : tasks;
      const updated = [guestTask, ...remainingTasks];
      saveGuestTasks(updated);
      setIsSubmitting(false);

      const form = e.target as HTMLFormElement;
      form.reset();
      setTaskTitle("");

      startFocus(guestTask);
    } else {
      const res = await createTask(null, formData);
      setIsSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else if (res.success && res.task) {
        const form = e.target as HTMLFormElement;
        form.reset();
        setTaskTitle("");

        const newTask: Task = res.task;
        if (queryReminderId) {
          // Delete old reminder
          await fetch(`/api/tasks/${queryReminderId}`, { method: "DELETE" });
          setTasks((prev) => prev.filter((t) => t.id !== queryReminderId).concat(newTask));
        } else {
          setTasks((prev) => [newTask, ...prev]);
        }
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
      setLoggedMinutes(spentTimeMinutes);
      setShowFinishSuccess(true);
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
        setLoggedMinutes(spentTimeMinutes);
        setShowFinishSuccess(true);
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

  const handleLogProgressActive = () => {
    setShowLogIntervalConfirm(true);
  };

  const confirmLogProgressActive = async () => {
    setShowLogIntervalConfirm(false);
    if (!activeTask) return;
    const finalSpent = Math.max(1, Math.round(secondsElapsed / 60));

    const intervalTitle = `${activeTask.title} [interval:${activeTask.id}]`;

    if (isGuest) {
      const guestInterval: Task = {
        id: crypto.randomUUID(),
        title: intervalTitle,
        allocatedTime: activeTask.allocatedTime,
        spentTime: finalSpent,
        isCompleted: true,
        createdAt: new Date().toISOString(),
      };

      const updated = [guestInterval, ...tasks];
      saveGuestTasks(updated);

      // Reset timer state and exit UI
      setActiveTask(null);
      setTimerState("idle");
      setSecondsElapsed(0);
      setSecondsRemaining(0);
      router.push("/dashboard");
      return;
    }

    try {
      const res = await logTaskInterval(activeTask.id, intervalTitle, finalSpent, activeTask.allocatedTime);
      if (res.error) {
        throw new Error(res.error);
      }
      if (res.success && res.task) {
        setTasks((prev) => [res.task as Task, ...prev]);

        // Reset timer state and exit UI
        setActiveTask(null);
        setTimerState("idle");
        setSecondsElapsed(0);
        setSecondsRemaining(0);
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error logging task progress.");
    }
  };

  const handleExitToDashboard = () => {
    setShowFinishSuccess(false);
    setActiveTask(null);
    setTimerState("idle");
    setSecondsRemaining(0);
    setSecondsElapsed(0);
    router.push("/dashboard");
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

  const strokeDashoffset = 502 - (502 * progressPercent) / 100;

  return (
    <DashboardLayout
      user={user}
      tasks={tasks}
      isGuest={isGuest}
      activeTask={activeTask}
      onDeleteTask={handleDeleteTask}
      onSignOut={handleSignOut}
    >
      {/* Main Workspace with local scroll protection */}
      <div className="flex-1 flex flex-col gap-8 pr-1 transition-all duration-300 overflow-y-auto">
        {activeTask ? (
          /* Active Focus Timer State (Aesthetic Music Player Dial Style) */
          <div className="w-[min(640px,100%,calc(100vh-180px))] aspect-square mx-auto my-auto self-center flex flex-col items-center justify-center p-6 sm:p-8 glass-tray relative overflow-hidden shrink-0">
            
            <div className="z-10 flex flex-col items-center gap-4 sm:gap-5 text-center max-w-lg w-full">
              
              {/* Handwritten Cozy Encouragement Text */}
              <div className="font-caveat text-4xl text-[#7B52AB] animate-pulse py-0.5">
                {currentQuote}
              </div>
 
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {activeTask.title}
                </h2>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed max-w-sm mx-auto">
                  Cozy session in progress. Quiet the noise, take slow breaths, and sink into your flow.
                </p>
              </div>
 
              {/* Animated Clock Circle Dial */}
              <div className="relative w-48 h-48 flex items-center justify-center bg-white/20 rounded-full border border-white/40 shadow-inner backdrop-blur-md shrink-0">
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 192 192">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    className="stroke-slate-200/40 fill-none"
                    strokeWidth="5"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    className="stroke-[#7B52AB] fill-none transition-all duration-1000 ease-linear"
                    strokeWidth="5"
                    strokeDasharray="502"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Digital Clock reading */}
                <div className="flex flex-col items-center z-10">
                  <span className="text-4xl font-black tracking-tight text-slate-900 font-mono">
                    {formatTime(displayTime)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    Elapsed: {formatTime(secondsElapsed)}
                  </span>
                </div>
              </div>
 
              {/* Cozy Play/Pause button wrapper */}
              <div className="p-2 flex items-center justify-center bg-white/20 rounded-full border border-white/40 shadow-inner backdrop-blur-md shrink-0">
                {timerState === "running" ? (
                  <button
                    onClick={() => setTimerState("paused")}
                    className="p-3.5 rounded-full bg-[#7B52AB]/70 hover:bg-[#7B52AB]/85 text-white shadow-md transition-all border border-[#7B52AB]/20 cursor-pointer"
                    title="Pause Timer"
                  >
                    <Pause className="w-5 h-5 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={() => setTimerState("running")}
                    className="p-3.5 rounded-full bg-[#7B52AB]/75 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/30 text-white shadow-md transition-all cursor-pointer"
                    title="Resume Timer"
                  >
                    <Play className="w-5 h-5 fill-current" />
                  </button>
                )}
              </div>
 
              {/* Main Action Buttons */}
              <div className="grid grid-cols-2 gap-3.5 w-full mt-0.5 shrink-0">
                <button
                  onClick={handleLogProgressActive}
                  className="flex items-center justify-center gap-1.5 glass-pill-white font-extrabold py-3 px-2 text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
                  title="Log progress but keep this task active"
                >
                  <History className="w-3.5 h-3.5 text-[#B88D15]" />
                  Log Interval
                </button>
                <button
                  onClick={handleFinishActive}
                  className="flex items-center justify-center gap-1.5 glass-pill-orange font-extrabold py-3 px-2 text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
                  title="Complete the entire task"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Finish Task
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Config & Form Centered State */
          <div className="flex justify-center items-center w-full my-auto">
            <div className="w-[min(640px,100%,calc(100vh-180px))] aspect-square p-8 sm:p-12 glass-tray flex flex-col justify-center gap-10">
              <div className="flex flex-col text-left gap-2">
                <h2 className="text-xl font-extrabold text-[#7B52AB] tracking-tight">Create Focus Block</h2>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  Designate a window of distraction-free work. Name your focus goal, configure your timer parameters, and dive in.
                </p>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 text-sm font-bold shadow-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleStartFormSubmit} className="space-y-8">
                <div className="flex flex-col gap-2">
                  <label htmlFor="title" className="text-xs font-bold text-slate-700 uppercase tracking-wide px-2">
                    What are you working on?
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Designing mockup, Writing docs..."
                    className="px-6 py-3.5 glass-pill-white text-slate-900 placeholder-slate-400 focus:outline-none transition-all text-sm font-bold shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="timeMode" className="text-xs font-bold text-slate-700 uppercase tracking-wide px-2">
                      Timer Mode
                    </label>
                    <div className="relative">
                      <select
                        id="timeMode"
                        value={timeMode}
                        onChange={(e) => setTimeMode(e.target.value as "countdown" | "countup")}
                        className="w-full px-6 py-3.5 glass-pill-white text-slate-900 focus:outline-none transition-all text-sm font-bold appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="countdown">Countdown Mode</option>
                        <option value="countup">Count Up Mode</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-500 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="allocatedTime" className="text-xs font-bold text-slate-700 uppercase tracking-wide px-2">
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
                      className="px-6 py-3.5 glass-pill-white text-slate-900 disabled:opacity-55 disabled:cursor-not-allowed focus:outline-none transition-all text-sm font-bold shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 glass-pill-orange font-extrabold py-4 px-4 text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Start Focus Session"}
                  <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-105" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Log Interval Confirmation Modal */}
      {showLogIntervalConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3E2361]/25 backdrop-blur-md animate-backdrop-fade">
          <div className="w-[min(420px,100%)] p-8 glass-tray flex flex-col items-center text-center gap-6 animate-modal-scale-up relative">
            <div className="p-4 rounded-full bg-white/20 border border-white/45 shadow-inner backdrop-blur-md text-[#7B52AB] shrink-0">
              <History className="w-8 h-8 text-[#B88D15]" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Log Focus Interval?
              </h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed max-w-sm">
                This will save your current focus session of <strong className="text-[#7B52AB]">{Math.max(1, Math.round(secondsElapsed / 60))} {Math.max(1, Math.round(secondsElapsed / 60)) === 1 ? 'minute' : 'minutes'}</strong> to history, but keep this task open so you can continue it later.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <button
                onClick={() => setShowLogIntervalConfirm(false)}
                className="flex-1 flex items-center justify-center glass-pill-white font-extrabold py-3.5 px-4 text-[10px] uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogProgressActive}
                className="flex-1 flex items-center justify-center glass-pill-orange font-extrabold py-3.5 px-4 text-[10px] uppercase tracking-wider cursor-pointer"
              >
                Yes, Log Interval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Task Success Congratulation Modal */}
      {showFinishSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3E2361]/25 backdrop-blur-md animate-backdrop-fade">
          <div className="w-[min(440px,100%)] p-8 glass-tray flex flex-col items-center text-center gap-6 animate-modal-scale-up relative">
            <div className="relative p-5 rounded-full bg-white/25 border border-white/50 shadow-inner backdrop-blur-md text-amber-500 shrink-0">
              <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full" />
              <Trophy className="w-10 h-10 fill-amber-300/40 text-amber-500 relative z-10 animate-bounce" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-caveat text-4xl text-[#7B52AB] animate-pulse py-0.5">
                Incredible Job!
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Focus Block Completed
              </h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed max-w-sm">
                You logged <strong className="text-[#7B52AB]">{loggedMinutes} {loggedMinutes === 1 ? 'minute' : 'minutes'}</strong> of uninterrupted flow. Celebrate your progress and take a cozy breath!
              </p>
            </div>

            <button
              onClick={handleExitToDashboard}
              className="w-full flex items-center justify-center gap-2 glass-pill-orange font-extrabold py-4 px-4 text-xs uppercase tracking-wider cursor-pointer mt-2"
            >
              Back to Focus Dashboard
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
