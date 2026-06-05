"use client";

import React, { useState } from "react";
import { Users, FileText, CheckCircle2, Clock, Search, Shield, Calendar, Mail, UserCheck } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

interface Task {
  id: string;
  title: string;
  allocatedTime: number;
  spentTime: number;
  isCompleted: boolean;
  createdAt: string;
}

interface UserStat {
  totalTasks: number;
  completedTasks: number;
  totalSpentMinutes: number;
}

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  stats: UserStat;
}

interface AdminClientProps {
  user: {
    name: string | null;
    email: string;
    image?: string | null;
  };
  tasks: Task[];
  metrics: {
    totalUsers: number;
    totalTasks: number;
    totalCompletedTasks: number;
    totalSpentMinutes: number;
  };
  usersList: UserItem[];
}

export default function AdminClient({
  user,
  tasks,
  metrics,
  usersList = [],
}: AdminClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = usersList.filter((u) => {
    const nameMatch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const emailMatch = u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch;
  });

  const formatJoinDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatHours = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <DashboardLayout user={user} tasks={tasks}>
      <div className="flex-1 flex justify-center overflow-y-auto w-full transition-all duration-300 py-6 sm:py-8">
        <div className="w-full max-w-4xl flex flex-col gap-8 px-4 py-4">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex flex-col gap-2 text-left">
              <div className="font-caveat text-4xl text-[#7B52AB] animate-pulse py-0.5">
                Admin Control Center
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 dark:bg-[#7B52AB]/15 rounded-xl border border-[#7B52AB]/20 text-[#7B52AB]">
                  <Shield className="w-5 h-5 fill-current opacity-80" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                  System Administration
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-bold max-w-xl leading-relaxed">
                Review platform usage, user counts, completed focus tasks, and overall focus duration metrics.
              </p>
            </div>
            
            <div className="shrink-0 bg-emerald-550/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Admin Access Active</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {/* Stat: Total Users */}
            <div className="glass-tray relative p-5 group overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-16 h-16 text-[#7B52AB]" />
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Total Focusers</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {metrics.totalUsers.toLocaleString()}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Registered email accounts.</p>
            </div>

            {/* Stat: Total Tasks Logged */}
            <div className="glass-tray relative p-5 group overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText className="w-16 h-16 text-[#7B52AB]" />
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tasks Created</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {metrics.totalTasks.toLocaleString()}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Total focus sessions logged.</p>
            </div>

            {/* Stat: Completed Tasks */}
            <div className="glass-tray relative p-5 group overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle2 className="w-16 h-16 text-[#7B52AB]" />
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tasks Completed</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {metrics.totalCompletedTasks.toLocaleString()}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Fully finished focus intervals.</p>
            </div>

            {/* Stat: Global Focus Time */}
            <div className="glass-tray relative p-5 group overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="w-16 h-16 text-[#7B52AB]" />
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Global Focus Time</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {formatHours(metrics.totalSpentMinutes)}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Total focus hours logged.</p>
            </div>
          </div>

          {/* User Directory Control Header */}
          <div className="glass-tray p-6 flex flex-col gap-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-left">
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Focuser Directory</h3>
                <p className="text-xs text-slate-500 font-bold">Search and monitor user engagement statistics across the app.</p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/20 dark:bg-black/5 border border-[#7B52AB]/20 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* User List Directory */}
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="py-12 border border-dashed border-[#B88D15]/20 rounded-2xl text-center bg-[#FAF6E3]/5">
                  <p className="text-xs text-slate-500 font-bold">No users match your search criteria.</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl border border-[#7B52AB]/15 bg-[#FAF6E3]/40 dark:bg-[#7B52AB]/5 hover:bg-[#FAF6E3]/60 dark:hover:bg-[#7B52AB]/10 hover:border-[#7B52AB]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                  >
                    {/* User Profile */}
                    <div className="flex items-center gap-3.5 text-left min-w-0">
                      {u.image ? (
                        <img
                          src={u.image}
                          alt={u.name || "User Avatar"}
                          className="w-11 h-11 rounded-full border border-[#7B52AB]/20 object-cover shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#7B52AB]/15 flex items-center justify-center border border-[#7B52AB]/25 shrink-0 shadow-inner">
                          <span className="text-sm font-black text-[#7B52AB] uppercase">
                            {u.name ? u.name.substring(0, 2) : "U"}
                          </span>
                        </div>
                      )}
                      
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate leading-snug">
                          {u.name || "Unnamed User"}
                        </h4>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-[11px] text-slate-500 font-bold mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#B88D15]" />
                            <span className="truncate max-w-[150px] sm:max-w-xs">{u.email}</span>
                          </span>
                          <span className="hidden sm:inline text-slate-400">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#7B52AB]" />
                            <span>Joined: {formatJoinDate(u.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Badges */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
                      <div className="px-3 py-2 rounded-xl bg-white/40 dark:bg-[#7B52AB]/10 border border-[#7B52AB]/10 text-center flex flex-col min-w-[70px]">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Tasks</span>
                        <span className="text-sm font-black text-slate-800 mt-0.5">{u.stats.totalTasks}</span>
                      </div>
                      
                      <div className="px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center flex flex-col min-w-[70px]">
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Done</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{u.stats.completedTasks}</span>
                      </div>

                      <div className="px-3 py-2 rounded-xl bg-[#7B52AB]/5 border border-[#7B52AB]/10 text-center flex flex-col min-w-[70px]">
                        <span className="text-[8px] text-[#7B52AB] font-bold uppercase tracking-wider">Focused</span>
                        <span className="text-xs font-black text-[#7B52AB] mt-1 whitespace-nowrap">{formatHours(u.stats.totalSpentMinutes)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="h-8 shrink-0" />
        </div>
      </div>
    </DashboardLayout>
  );
}
