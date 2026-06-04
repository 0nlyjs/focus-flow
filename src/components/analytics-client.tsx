"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Clock, Trophy, Users, Star, History } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

interface Task {
  id: string;
  title: string;
  allocatedTime: number;
  spentTime: number;
  isCompleted: boolean;
  createdAt: string;
}

interface AnalyticsClientProps {
  user: {
    name: string | null;
    email: string;
  };
  initialTasks: Task[];
  isGuest?: boolean;
  metrics: {
    completedTasksCount: number;
    totalSpentMinutes: number;
    userCount: number;
  };
}

export default function AnalyticsClient({
  user,
  initialTasks,
  isGuest = false,
  metrics,
}: AnalyticsClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;

    if (isGuest) {
      const updated = tasks.filter((t) => t.id !== taskId);
      setTasks(updated);
      localStorage.setItem("focusflow_guest_tasks", JSON.stringify(updated));
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

  // Group tasks by original task identity to calculate interval statistics
  const taskGroups: { [key: string]: Task[] } = {};
  tasks.forEach((t) => {
    const match = t.title.match(/\[(chunk|interval):([^\]]+)\]$/);
    const parentId = match ? match[2] : t.id;
    if (!taskGroups[parentId]) {
      taskGroups[parentId] = [];
    }
    taskGroups[parentId].push(t);
  });

  let finishedInOneGo = 0;
  let finishedInIntervals = 0;
  let activeIntervalTasks = 0;
  let totalIntervalsLogged = 0;
  let maxIntervalsInATask = 0;
  let maxIntervalsTaskTitle = "";

  Object.entries(taskGroups).forEach(([parentId, groupTasks]) => {
    const parent = groupTasks.find((t) => t.id === parentId);
    const intervals = groupTasks.filter((t) => t.id !== parentId);

    totalIntervalsLogged += intervals.length;

    if (parent) {
      if (parent.isCompleted) {
        if (intervals.length > 0) {
          finishedInIntervals++;
          if (intervals.length > maxIntervalsInATask) {
            maxIntervalsInATask = intervals.length;
            maxIntervalsTaskTitle = parent.title;
          }
        } else {
          finishedInOneGo++;
        }
      } else {
        if (intervals.length > 0) {
          activeIntervalTasks++;
        }
      }
    } else {
      // If the parent task was deleted, but intervals exist
      if (intervals.length > 0) {
        finishedInIntervals++;
        const cleanTitle = intervals[0].title.replace(/\s\[(chunk|interval):[^\]]+\]$/, "");
        if (intervals.length > maxIntervalsInATask) {
          maxIntervalsInATask = intervals.length;
          maxIntervalsTaskTitle = cleanTitle;
        }
      }
    }
  });

  const cleanMaxTitle = maxIntervalsTaskTitle.replace(/\s\[(chunk|interval):[^\]]+\]$/, "");

  return (
    <DashboardLayout
      user={user}
      tasks={tasks}
      isGuest={isGuest}
      onDeleteTask={handleDeleteTask}
    >
      {/* Centered Main Workspace Container */}
      <div className="flex-1 flex justify-center overflow-y-auto w-full transition-all duration-300">
        <div className="w-full max-w-3xl flex flex-col gap-8 px-2 py-4">
          
          {/* Main Banner Heading */}
          <div className="flex flex-col gap-2 text-left">
            <div className="font-caveat text-4xl text-[#7B52AB] animate-pulse py-0.5">
              Focuser Analytics
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 dark:bg-[#7B52AB]/15 rounded-xl border border-[#7B52AB]/20 text-[#7B52AB]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Analytics
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-bold max-w-xl leading-relaxed">
              Aggregated stats of focus, grit, and productivity achieved by creators around the world. Updates live.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Card 1: Total Minutes */}
            <div className="glass-tray relative p-6 group overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="w-20 h-20 text-[#7B52AB]" />
              </div>
              <p className="text-[10px] font-extrabold text-[#7B52AB] uppercase tracking-wider mb-2">Total Focus Time</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight font-mono mb-2">
                {metrics.totalSpentMinutes.toLocaleString()}m
              </h2>
              <p className="text-[10px] text-slate-500 font-bold">Total minutes spent completing tasks.</p>
            </div>

            {/* Card 2: Completed Tasks */}
            <div className="glass-tray relative p-6 group overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="w-20 h-20 text-[#7B52AB]" />
              </div>
              <p className="text-[10px] font-extrabold text-[#7B52AB] uppercase tracking-wider mb-2">Tasks Completed</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight font-mono mb-2">
                {metrics.completedTasksCount.toLocaleString()}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold">Fully resolved focus blocks logged.</p>
            </div>

            {/* Card 3: Active Members */}
            <div className="glass-tray relative p-6 group overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-20 h-20 text-[#7B52AB]" />
              </div>
              <p className="text-[10px] font-extrabold text-[#7B52AB] uppercase tracking-wider mb-2">Total Creators</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight font-mono mb-2">
                {metrics.userCount.toLocaleString()}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold">Unique focusers registered via email.</p>
            </div>
          </div>

          {/* Your Focus Style Analytics */}
          <div className="w-full p-6 sm:p-8 glass-tray flex flex-col gap-6 text-left shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 text-[#7B52AB]">
              <History className="w-5 h-5" />
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Your Focus Rhythm</h2>
            </div>

            <p className="text-xs text-slate-500 font-bold -mt-3">
              Analyze whether you complete tasks in a single continuous session or build progress incrementally over multiple logged intervals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {/* Stat: One Go */}
              <div className="p-4 rounded-2xl bg-[#FAF6E3]/40 dark:bg-[#7B52AB]/10 border border-[#7B52AB]/20 flex flex-col justify-center shadow-sm">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Single Session Wins</span>
                <span className="text-2xl font-black text-slate-900 mt-1">{finishedInOneGo}</span>
                <span className="text-[9px] text-slate-400 font-bold mt-1">Finished in one go</span>
              </div>

              {/* Stat: Intervals */}
              <div className="p-4 rounded-2xl bg-[#FAF6E3]/40 dark:bg-[#7B52AB]/10 border border-[#7B52AB]/20 flex flex-col justify-center shadow-sm">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Incremental Builds</span>
                <span className="text-2xl font-black text-slate-900 mt-1">{finishedInIntervals}</span>
                <span className="text-[9px] text-slate-400 font-bold mt-1">Finished in intervals</span>
              </div>

              {/* Stat: Active Intervals */}
              <div className="p-4 rounded-2xl bg-[#FAF6E3]/40 dark:bg-[#7B52AB]/10 border border-[#7B52AB]/20 flex flex-col justify-center shadow-sm">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Progress Tasks</span>
                <span className="text-2xl font-black text-slate-900 mt-1">{activeIntervalTasks}</span>
                <span className="text-[9px] text-slate-400 font-bold mt-1">Still in progress</span>
              </div>

              {/* Stat: Total Intervals */}
              <div className="p-4 rounded-2xl bg-[#FAF6E3]/40 dark:bg-[#7B52AB]/10 border border-[#7B52AB]/20 flex flex-col justify-center shadow-sm">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Intervals Logged</span>
                <span className="text-2xl font-black text-slate-900 mt-1">{totalIntervalsLogged}</span>
                <span className="text-[9px] text-slate-400 font-bold mt-1">Accumulated sessions</span>
              </div>
            </div>

            {maxIntervalsInATask > 0 && (
              <div className="p-4 rounded-2xl border border-dashed border-[#7B52AB]/30 bg-[#7B52AB]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#7B52AB] font-extrabold uppercase tracking-wider block mb-1">Most Resilient Focus Milestone</span>
                  <p className="font-bold text-slate-800 text-sm truncate">{cleanMaxTitle}</p>
                </div>
                <div className="shrink-0 bg-[#7B52AB]/15 text-[#7B52AB] border border-[#7B52AB]/30 font-extrabold px-3 py-1.5 rounded-xl text-xs uppercase tracking-wide">
                  Took {maxIntervalsInATask} intervals to resolve
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
