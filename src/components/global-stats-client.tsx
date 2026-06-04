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

interface GlobalStatsClientProps {
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

export default function GlobalStatsClient({
  user,
  initialTasks,
  isGuest = false,
  metrics,
}: GlobalStatsClientProps) {
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

  // Group tasks by original task identity to calculate chunk statistics
  const taskGroups: { [key: string]: Task[] } = {};
  tasks.forEach((t) => {
    const match = t.title.match(/\[chunk:([^\]]+)\]$/);
    const parentId = match ? match[1] : t.id;
    if (!taskGroups[parentId]) {
      taskGroups[parentId] = [];
    }
    taskGroups[parentId].push(t);
  });

  let finishedInOneGo = 0;
  let finishedInChunks = 0;
  let activeChunkedTasks = 0;
  let totalChunksLogged = 0;
  let maxChunksInATask = 0;
  let maxChunksTaskTitle = "";

  Object.entries(taskGroups).forEach(([parentId, groupTasks]) => {
    const parent = groupTasks.find((t) => t.id === parentId);
    const chunks = groupTasks.filter((t) => t.id !== parentId);

    totalChunksLogged += chunks.length;

    if (parent) {
      if (parent.isCompleted) {
        if (chunks.length > 0) {
          finishedInChunks++;
          if (chunks.length > maxChunksInATask) {
            maxChunksInATask = chunks.length;
            maxChunksTaskTitle = parent.title;
          }
        } else {
          finishedInOneGo++;
        }
      } else {
        if (chunks.length > 0) {
          activeChunkedTasks++;
        }
      }
    } else {
      // If the parent task was deleted, but chunks exist
      if (chunks.length > 0) {
        finishedInChunks++;
        const cleanTitle = chunks[0].title.replace(/\s\[chunk:[^\]]+\]$/, "");
        if (chunks.length > maxChunksInATask) {
          maxChunksInATask = chunks.length;
          maxChunksTaskTitle = cleanTitle;
        }
      }
    }
  });

  const cleanMaxTitle = maxChunksTaskTitle.replace(/\s\[chunk:[^\]]+\]$/, "");

  return (
    <DashboardLayout
      user={user}
      tasks={tasks}
      isGuest={isGuest}
      onDeleteTask={handleDeleteTask}
    >
      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col gap-8 pr-1 transition-all duration-300 overflow-y-auto">
        
        {/* Main Banner Heading */}
        <div className="flex flex-col gap-2 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#7B52AB]/15 rounded-xl border border-[#7B52AB]/20 text-[#7B52AB]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Global Metrics
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-bold max-w-xl">
            Aggregated stats of focus, grit, and productivity achieved by creators around the world. Updates live.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Card 1: Total Minutes */}
          <div className="relative p-6 rounded-3xl border border-[#B88D15]/20 bg-[#B88D15]/10 shadow-xl backdrop-blur-lg group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-20 h-20 text-[#B88D15]" />
            </div>
            <p className="text-xs font-extrabold text-[#B88D15] uppercase tracking-wider mb-2">Total Focus Time</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight font-mono mb-2">
              {metrics.totalSpentMinutes.toLocaleString()}m
            </h2>
            <p className="text-xs text-slate-500 font-bold">Total minutes spent completing tasks.</p>
          </div>

          {/* Card 2: Completed Tasks */}
          <div className="relative p-6 rounded-3xl border border-[#7B52AB]/20 bg-[#7B52AB]/10 shadow-xl backdrop-blur-lg group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-20 h-20 text-[#7B52AB]" />
            </div>
            <p className="text-xs font-extrabold text-[#7B52AB] uppercase tracking-wider mb-2">Tasks Completed</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight font-mono mb-2">
              {metrics.completedTasksCount.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-500 font-bold">Fully resolved focus blocks logged.</p>
          </div>

          {/* Card 3: Active Members */}
          <div className="relative p-6 rounded-3xl border border-[#B88D15]/20 bg-[#B88D15]/10 shadow-xl backdrop-blur-lg group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-20 h-20 text-[#B88D15]" />
            </div>
            <p className="text-xs font-extrabold text-[#B88D15] uppercase tracking-wider mb-2">Total Creators</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight font-mono mb-2">
              {metrics.userCount.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-500 font-bold">Unique focusers registered via email.</p>
          </div>
        </div>

        {/* Your Focus Style Analytics */}
        <div className="w-full p-6 sm:p-8 rounded-3xl border border-[#7B52AB]/20 bg-[#7B52AB]/5 shadow-xl backdrop-blur-lg flex flex-col gap-6 text-left shrink-0">
          <div className="flex items-center gap-2.5 text-[#7B52AB]">
            <History className="w-5 h-5" />
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Your Focus Rhythm</h2>
          </div>

          <p className="text-xs text-slate-500 font-bold -mt-3">
            Analyze whether you complete tasks in a single continuous session or build progress incrementally over multiple logged chunks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {/* Stat: One Go */}
            <div className="p-4 rounded-2xl bg-[#FAF6E3]/60 border border-[#7B52AB]/15 flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Single Session Wins</span>
              <span className="text-2xl font-black text-slate-900 mt-1">{finishedInOneGo}</span>
              <span className="text-[10px] text-slate-400 font-bold mt-1">Finished in one go</span>
            </div>

            {/* Stat: Chunks */}
            <div className="p-4 rounded-2xl bg-[#FAF6E3]/60 border border-[#7B52AB]/15 flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Incremental Builds</span>
              <span className="text-2xl font-black text-slate-900 mt-1">{finishedInChunks}</span>
              <span className="text-[10px] text-slate-400 font-bold mt-1">Finished in chunks</span>
            </div>

            {/* Stat: Active Chunks */}
            <div className="p-4 rounded-2xl bg-[#FAF6E3]/60 border border-[#7B52AB]/15 flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Progress Tasks</span>
              <span className="text-2xl font-black text-slate-900 mt-1">{activeChunkedTasks}</span>
              <span className="text-[10px] text-slate-400 font-bold mt-1">Still in progress</span>
            </div>

            {/* Stat: Total Chunks */}
            <div className="p-4 rounded-2xl bg-[#FAF6E3]/60 border border-[#7B52AB]/15 flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Chunks Logged</span>
              <span className="text-2xl font-black text-slate-900 mt-1">{totalChunksLogged}</span>
              <span className="text-[10px] text-slate-400 font-bold mt-1">Accumulated sessions</span>
            </div>
          </div>

          {maxChunksInATask > 0 && (
            <div className="p-4 rounded-2xl border border-dashed border-[#B88D15]/30 bg-[#B88D15]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#B88D15] font-extrabold uppercase tracking-wider block mb-1">Most Resilient Focus Milestone</span>
                <p className="font-bold text-slate-800 text-sm truncate">{cleanMaxTitle}</p>
              </div>
              <div className="shrink-0 bg-[#B88D15]/15 text-[#B88D15] border border-[#B88D15]/30 font-extrabold px-3 py-1.5 rounded-xl text-xs uppercase tracking-wide">
                Took {maxChunksInATask} chunks to resolve
              </div>
            </div>
          )}
        </div>

        {/* Call to action Quote */}
        <div className="p-6 rounded-3xl border border-dashed border-[#B88D15]/30 bg-[#FAF6E3]/40 backdrop-blur-md text-center max-w-md w-full shadow-sm mx-auto mt-4">
          <div className="flex justify-center gap-1.5 text-amber-500 mb-2">
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
          </div>
          <p className="font-caveat text-3xl text-[#B88D15]">
            "One step at a time, you've got this!"
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
