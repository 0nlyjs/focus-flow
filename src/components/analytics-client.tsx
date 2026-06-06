"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { BarChart3, Clock, Trophy, Users, Star, History, AlertTriangle, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useTimer } from "@/components/timer-context";

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
  };
}

function filterTasksByTimeframe(tasksList: Task[], range: string) {
  const now = new Date();
  
  // Set start of today: 00:00:00.000 local time
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Start of week: 7 days ago (including today) at 00:00:00.000 local time
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  
  // Start of month: 30 days ago at 00:00:00.000 local time
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  
  // Start of year: 365 days ago at 00:00:00.000 local time
  const startOfYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1);

  return tasksList.filter((task) => {
    if (!task.createdAt) return false;
    const taskDate = new Date(task.createdAt);

    switch (range) {
      case "today":
        return taskDate >= startOfToday;
      case "week":
        return taskDate >= startOfWeek;
      case "month":
        return taskDate >= startOfMonth;
      case "year":
        return taskDate >= startOfYear;
      case "all":
      default:
        return true;
    }
  });
}

export default function AnalyticsClient({
  user,
  initialTasks,
  isGuest = false,
  metrics,
}: AnalyticsClientProps) {
  const {
    tasks,
    isLoading,
    isDeletingTaskId,
    handleDeleteTask,
  } = useTimer();

  const [timeframe, setTimeframe] = useState<string>("week");
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);
  const timeframeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        timeframeRef.current &&
        !timeframeRef.current.contains(event.target as Node)
      ) {
        setIsTimeframeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter tasks based on selected timeframe
  const filteredTasks = useMemo(() => {
    return filterTasksByTimeframe(tasks, timeframe);
  }, [tasks, timeframe]);

  // Compute user's personal analytics dynamically from filteredTasks state
  const userCompletedTasksCount = filteredTasks.filter((t) => t.isCompleted).length;
  const userTotalSpentMinutes = filteredTasks.filter((t) => t.isCompleted).reduce((sum, t) => sum + t.spentTime, 0);

  // Group tasks by original task identity to calculate interval statistics
  const taskGroups: { [key: string]: Task[] } = {};
  filteredTasks.forEach((t) => {
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

  const formatSpentTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
    return `${mins}m`;
  };

  return (
    <DashboardLayout
      user={user}
      tasks={tasks}
      isGuest={isGuest}
      onDeleteTask={handleDeleteTask}
      isDeletingTaskId={isDeletingTaskId}
      isLoading={isLoading}
    >
      {/* Centered Main Workspace Container */}
      <div className="flex-1 flex justify-center overflow-y-auto w-full transition-all duration-300 py-6 sm:py-8">
        <div className="w-full max-w-3xl flex flex-col gap-8 px-2 py-4">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 w-full">
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
                Analyze your personal focus sessions, intervals logged, and productivity trends.
              </p>
            </div>

            {/* Guest Warning Card */}
            {isGuest && (
              <div className="glass-tray border-amber-500/30 bg-amber-500/5 p-5 flex flex-col gap-2.5 max-w-sm w-full md:w-auto shadow-md">
                <div className="flex items-center gap-2 unsaved-session-alert">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Unsaved Session</span>
                </div>
                <p className="text-[11px] font-bold leading-normal unsaved-session-body">
                  You are playing as a Guest. Your focus logs are saved only on this device. Sign in to back up your data so it is never lost.
                </p>
                <button
                  onClick={() => window.location.href = "/?login=true"}
                  className="mt-1 w-full flex items-center justify-center gap-1.5 glass-pill-orange text-[10px] font-extrabold uppercase tracking-wider py-2 px-4 cursor-pointer"
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>

          {/* Section Header with Select Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full bg-[#FAF6E3]/40 dark:bg-[#7B52AB]/10 p-4 rounded-2xl border border-[#7B52AB]/20 shadow-sm transition-all duration-300 relative z-10">
            <div className="flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-[#B88D15]" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Productivity Overview
              </span>
            </div>
            
            <div className="flex items-center gap-2.5 self-end sm:self-auto relative" ref={timeframeRef}>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                Timeframe:
              </span>
              <div className="relative w-40">
                <button
                  type="button"
                  onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
                  className="w-full text-left px-4 py-2 glass-pill-white text-[#3E2361] focus:outline-none transition-all text-xs font-bold flex items-center justify-between cursor-pointer shadow-sm border border-[#7B52AB]/20 animate-fade-in"
                >
                  <span>
                    {timeframe === "today" && "Today"}
                    {timeframe === "week" && "This Week"}
                    {timeframe === "month" && "This Month"}
                    {timeframe === "year" && "This Year"}
                    {timeframe === "all" && "All Time"}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isTimeframeOpen ? "-rotate-90" : "rotate-90"}`}
                  />
                </button>

                {isTimeframeOpen && (
                  <div className="absolute right-0 left-0 mt-2 z-50 bg-[#FAF6E3]/75 dark:bg-[#3E2361]/85 backdrop-blur-xl border border-[#7B52AB]/30 rounded-2xl py-1.5 overflow-hidden shadow-xl animate-modal-scale-up">
                    {[
                      { label: "Today", value: "today" },
                      { label: "This Week", value: "week" },
                      { label: "This Month", value: "month" },
                      { label: "This Year", value: "year" },
                      { label: "All Time", value: "all" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setTimeframe(opt.value);
                          setIsTimeframeOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                          timeframe === opt.value
                            ? "bg-[#7B52AB]/15 text-[#3E2361]"
                            : "text-slate-700 hover:text-slate-900 hover:bg-[#7B52AB]/5"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {isLoading ? (
            /* Pulsing Stats Skeleton Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="glass-tray h-32 p-6 flex flex-col justify-between">
                  <div className="h-3 w-24 bg-slate-400/25 dark:bg-slate-700/50 rounded" />
                  <div className="h-8 w-28 bg-slate-400/20 dark:bg-slate-700/40 rounded" />
                  <div className="h-3 w-40 bg-slate-400/15 dark:bg-slate-700/30 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-slide-fade-in">
              {/* Card 1: Total Minutes */}
              <div className="glass-tray relative p-6 group overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Clock className="w-20 h-20 text-[#7B52AB]" />
                </div>
                <p className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">Total Focus Time</p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight font-mono mb-2">
                  {formatSpentTime(userTotalSpentMinutes)}
                </h2>
                <p className="text-[10px] text-slate-500 font-bold">Total minutes spent completing tasks.</p>
              </div>

              {/* Card 2: Completed Tasks */}
              <div className="glass-tray relative p-6 group overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Trophy className="w-20 h-20 text-[#7B52AB]" />
                </div>
                <p className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">Tasks Completed</p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight font-mono mb-2">
                  {userCompletedTasksCount.toLocaleString()}
                </h2>
                <p className="text-[10px] text-slate-500 font-bold">Fully resolved focus blocks logged.</p>
              </div>
            </div>
          )}

          {/* Your Focus Style Analytics */}
          {isLoading ? (
            /* Focus style rhythm card skeleton */
            <div className="glass-tray p-6 sm:p-8 flex flex-col gap-6 animate-pulse w-full">
              <div className="h-5 w-40 bg-slate-400/25 dark:bg-slate-700/50 rounded" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-2xl" />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full p-6 sm:p-8 glass-tray flex flex-col gap-6 text-left shrink-0 shadow-md animate-slide-fade-in">
            <div className="flex items-center gap-2.5 text-slate-700">
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
          )}
          {/* Explicit spacer to prevent clipping/margin collapsing on scroll container's last child */}
          <div className="h-8 shrink-0" />
        </div>
      </div>
    </DashboardLayout>
  );
}
