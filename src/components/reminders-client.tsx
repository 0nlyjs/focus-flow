"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Trash2,
  Play,
  Sparkles,
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
      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-1 transition-all duration-300">
        
        {/* Main Banner Heading */}
        <div className="flex flex-col gap-2 text-left">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            My Focus Reminders
          </h1>
          <p className="text-sm text-slate-500 font-bold max-w-xl">
            Keep track of items you want to focus on. When you're ready, press the Start icon to load it into the timer and begin your session.
          </p>
        </div>

        {/* Add Reminder Card Form */}
        <div className="w-full p-6 sm:p-8 rounded-3xl border border-[#B88D15]/20 bg-[#B88D15]/10 shadow-xl backdrop-blur-lg flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#B88D15]">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Add New Reminder</h2>
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
              className="flex-1 px-4 py-3.5 rounded-2xl border border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold shadow-sm"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg transition-all backdrop-blur-md disabled:opacity-70 text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer"
            >
              {isSubmitting ? "Adding..." : "Add to Queue"}
            </button>
          </form>
        </div>

        {/* Active Reminders List / Grid */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-650 uppercase tracking-wide px-1 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#B88D15]" />
            Reminders Queue ({activeTasks.length})
          </h3>

          {activeTasks.length === 0 ? (
            <div className="p-10 rounded-3xl border border-[#B88D15]/20 bg-[#B88D15]/5 text-center flex flex-col items-center gap-3">
              <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-sm">
                Your queue is empty. Add a reminder above to save it! It will stay here until you start focus or delete it.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#B88D15]/10 p-6 rounded-3xl border border-[#B88D15]/20 shadow-md backdrop-blur-lg hover:bg-[#B88D15]/15 transition-all flex flex-col justify-between gap-6 text-left relative overflow-hidden"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-[#B88D15] font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Saved Reminder
                    </span>
                    <h4 className="font-black text-slate-800 text-sm leading-snug break-words">
                      {t.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#B88D15]/10 pt-4 shrink-0">
                    <button
                      onClick={() => handleStartReminder(t)}
                      className="flex items-center gap-2 bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold py-2 px-4 rounded-xl text-[11px] uppercase tracking-wider shadow-sm transition-all backdrop-blur-md cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Start Focus
                    </button>
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-2 rounded-xl bg-[#FAF6E3]/60 text-slate-500 hover:bg-rose-500/10 hover:text-rose-650 transition-all border border-[#B88D15]/20 cursor-pointer"
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
    </DashboardLayout>
  );
}
