"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Trash2,
  Play,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { createTask } from "@/app/actions/task-actions";
import DashboardLayout from "@/components/dashboard-layout";

interface Task {
  id: string;
  title: string;
  allocatedTime: number;
  spentTime: number;
  isCompleted: boolean;
  createdAt: string;
}

interface RemindersClientProps {
  user: {
    name: string | null;
    email: string;
  };
  initialTasks: Task[];
  isGuest?: boolean;
}

export default function RemindersClient({
  user,
  initialTasks,
  isGuest = false,
}: RemindersClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const activeTasks = tasks.filter((t) => !t.isCompleted);

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

  // Helper to save guest tasks
  const saveGuestTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("focusflow_guest_tasks", JSON.stringify(newTasks));
  };

  const handleAddReminder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title")?.toString() || "";

    if (!title.trim()) {
      setFormError("Reminder description cannot be empty");
      setIsSubmitting(false);
      return;
    }

    if (isGuest) {
      const guestTask: Task = {
        id: crypto.randomUUID(),
        title,
        allocatedTime: 25, // default pre-fill minutes
        spentTime: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };

      const updated = [guestTask, ...tasks];
      saveGuestTasks(updated);
      setIsSubmitting(false);

      const form = e.target as HTMLFormElement;
      form.reset();
    } else {
      // Append default allocated time to satisfy database validation schema
      formData.append("allocatedTime", "25");
      const res = await createTask(null, formData);
      setIsSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else if (res.success && res.task) {
        const form = e.target as HTMLFormElement;
        form.reset();

        const newTask: Task = res.task;
        setTasks((prev) => [newTask, ...prev]);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;

    if (isGuest) {
      const updated = tasks.filter((t) => t.id !== taskId);
      saveGuestTasks(updated);
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
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting reminder.");
    }
  };

  const handleStartReminder = (task: Task) => {
    router.push(`/dashboard?title=${encodeURIComponent(task.title)}&reminderId=${task.id}`);
  };

  return (
    <DashboardLayout
      user={user}
      tasks={tasks}
      isGuest={isGuest}
      onDeleteTask={handleDeleteTask}
    >
      {/* Centered Main Workspace Container */}
      <div className="flex-1 flex justify-center overflow-y-auto w-full transition-all duration-300 py-6 sm:py-8">
        <div className="w-full max-w-3xl flex flex-col gap-8 px-2 py-4">
          
          {/* Main Banner Heading */}
          <div className="flex flex-col gap-2 text-left shrink-0">
            <div className="font-caveat text-4xl text-[#7B52AB] py-0.5">
              My Study Corner
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              My Focus Reminders
            </h1>
            <p className="text-xs text-slate-500 font-bold max-w-xl leading-relaxed">
              Keep track of items you want to focus on. When you're ready, click <span className="text-[#7B52AB]">Start Focus</span> to load them into the timer and begin your session.
            </p>
          </div>

          {/* Add Reminder Card Form */}
          <div className="w-full p-6 sm:p-8 glass-tray flex flex-col gap-6 shrink-0">
            <div className="flex items-center gap-2 text-[#7B52AB]">
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Create a Reminder</h2>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 text-sm font-bold shadow-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddReminder} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Finish landing page copywriting, Refactor auth routes..."
                className="flex-1 px-5 py-4 glass-pill-white text-slate-900 placeholder-slate-400 focus:outline-none transition-all text-sm font-bold shadow-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="glass-pill-orange font-extrabold py-4 px-8 text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
              >
                {isSubmitting ? "Adding..." : "Add to Queue"}
              </button>
            </form>
          </div>

          {/* Active Reminders List / Grid */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide px-1 flex items-center gap-2 shrink-0">
              <BellRing className="w-4.5 h-4.5 text-[#7B52AB]" />
              Reminders Queue ({activeTasks.length})
            </h3>

            <div className="pb-4">
              {activeTasks.length === 0 ? (
                <div className="p-10 glass-tray text-center flex flex-col items-center justify-center gap-4 py-16">
                  <div className="p-4 rounded-full bg-white/20 dark:bg-[#7B52AB]/15 border border-[#7B52AB]/20 shadow-inner backdrop-blur-md text-[#7B52AB] shrink-0">
                    <BellRing className="w-8 h-8 text-[#7B52AB]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-extrabold text-slate-800 text-sm">No Reminders Found</h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-xs mx-auto">
                      Your queue is empty. Add a reminder using the form above to save it! It will stay here until you start focus or delete it.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTasks.map((t) => (
                    <div
                      key={t.id}
                      className="glass-tray h-48 p-6 hover:scale-[1.02] hover:border-[#7B52AB]/50 transition-all duration-300 flex flex-col justify-between gap-5 text-left relative overflow-hidden group shadow-md"
                    >
                      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                        <span className="text-[10px] text-slate-700 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-2.5 shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                          Focus Reminder
                        </span>
                        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
                          <h4 className="font-black text-slate-900 text-sm leading-snug break-words group-hover:text-[#7B52AB] transition-colors">
                            {t.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#7B52AB]/20 pt-4 shrink-0">
                        <button
                          onClick={() => handleStartReminder(t)}
                          className="glass-pill-orange font-extrabold py-2.5 px-4 text-[10px] uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Start Focus
                        </button>
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-2.5 rounded-full bg-[#FAF6E3]/60 dark:bg-[#7B52AB]/15 text-slate-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all border border-[#7B52AB]/20 cursor-pointer"
                          title="Delete Reminder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Explicit spacer to prevent clipping/margin collapsing on scroll container's last child */}
          <div className="h-8 shrink-0" />
        </div>
      </div>
    </DashboardLayout>
  );
}
