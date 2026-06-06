"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { logTaskInterval } from "@/app/actions/task-actions";

export interface Task {
  id: string;
  title: string;
  allocatedTime: number; // in minutes
  spentTime: number; // in minutes
  isCompleted: boolean;
  createdAt: string;
}

interface TimerContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  isLoading: boolean;
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
  timerState: "idle" | "running" | "paused";
  setTimerState: (state: "idle" | "running" | "paused") => void;
  timeMode: "countdown" | "countup";
  setTimeMode: (mode: "countdown" | "countup") => void;
  secondsRemaining: number;
  setSecondsRemaining: React.Dispatch<React.SetStateAction<number>>;
  secondsElapsed: number;
  setSecondsElapsed: React.Dispatch<React.SetStateAction<number>>;
  showFinishSuccess: boolean;
  setShowFinishSuccess: (show: boolean) => void;
  showLogIntervalConfirm: boolean;
  setShowLogIntervalConfirm: (show: boolean) => void;
  loggedMinutes: number;
  setLoggedMinutes: (minutes: number) => void;
  isFinishing: boolean;
  isLoggingInterval: boolean;
  isDeletingTaskId: string | null;
  setIsDeletingTaskId: (id: string | null) => void;
  startFocus: (task: Task, mode: "countdown" | "countup") => void;
  finishTaskRequest: (taskId: string, spentTimeMinutes: number) => Promise<void>;
  confirmLogProgressActive: () => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  saveGuestTasks: (newTasks: Task[]) => void;
  handleExitToDashboard: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({
  children,
  isGuest,
}: {
  children: React.ReactNode;
  isGuest: boolean;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [timerState, setTimerState] = useState<"idle" | "running" | "paused">("idle");
  const [timeMode, setTimeMode] = useState<"countdown" | "countup">("countdown");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showFinishSuccess, setShowFinishSuccess] = useState(false);
  const [showLogIntervalConfirm, setShowLogIntervalConfirm] = useState(false);
  const [loggedMinutes, setLoggedMinutes] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isLoggingInterval, setIsLoggingInterval] = useState(false);
  const [isDeletingTaskId, setIsDeletingTaskId] = useState<string | null>(null);

  const secondsElapsedRef = useRef(0);
  const activeTaskRef = useRef<Task | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync refs to avoid stale closures in setInterval
  useEffect(() => {
    secondsElapsedRef.current = secondsElapsed;
  }, [secondsElapsed]);

  useEffect(() => {
    activeTaskRef.current = activeTask;
  }, [activeTask]);

  // Load tasks on mount
  useEffect(() => {
    if (isGuest) {
      const stored = localStorage.getItem("focusflow_guest_tasks");
      if (stored) {
        try {
          setTasks(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse guest tasks in context:", e);
        }
      } else {
        setTasks([]);
      }
      setIsLoading(false);
    } else {
      async function fetchTasks() {
        try {
          const res = await fetch("/api/tasks");
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.tasks) {
              setTasks(data.tasks);
            }
          }
        } catch (error) {
          console.error("Failed to fetch tasks in context:", error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchTasks();
    }
  }, [isGuest]);

  // Helper to save guest tasks
  const saveGuestTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("focusflow_guest_tasks", JSON.stringify(newTasks));
  };

  // Timer tick interval logic running globally
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
    const currentActive = activeTaskRef.current;
    if (currentActive) {
      const finalSpent = Math.max(1, Math.ceil(secondsElapsedRef.current / 60));
      finishTaskRequest(currentActive.id, finalSpent);
    }
  };

  const startFocus = (task: Task, mode: "countdown" | "countup") => {
    setActiveTask(task);
    setTimeMode(mode);
    setTimerState("running");
    setSecondsElapsed(0);
    secondsElapsedRef.current = 0;
    if (mode === "countdown") {
      setSecondsRemaining(task.allocatedTime * 60);
    } else {
      setSecondsRemaining(0);
    }
  };

  const finishTaskRequest = async (taskId: string, spentTimeMinutes: number) => {
    setIsFinishing(true);
    if (isGuest) {
      const updated = tasks.map((t) =>
        t.id === taskId
          ? { ...t, isCompleted: true, spentTime: spentTimeMinutes }
          : t
      );
      saveGuestTasks(updated);
      setLoggedMinutes(spentTimeMinutes);
      setShowFinishSuccess(true);
      setIsFinishing(false);
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
            t.id === taskId
              ? { ...t, isCompleted: true, spentTime: spentTimeMinutes }
              : t
          )
        );
        setLoggedMinutes(spentTimeMinutes);
        setShowFinishSuccess(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error finishing task. Please try again.");
    } finally {
      setIsFinishing(false);
    }
  };

  const confirmLogProgressActive = async () => {
    const currentActive = activeTaskRef.current;
    if (!currentActive) return;
    setIsLoggingInterval(true);
    const finalSpent = Math.max(1, Math.ceil(secondsElapsed / 60));
    const intervalTitle = `${currentActive.title} [interval:${currentActive.id}]`;

    if (isGuest) {
      const guestInterval: Task = {
        id: crypto.randomUUID(),
        title: intervalTitle,
        allocatedTime: currentActive.allocatedTime,
        spentTime: finalSpent,
        isCompleted: true,
        createdAt: new Date().toISOString(),
      };

      const updated = [guestInterval, ...tasks];
      saveGuestTasks(updated);

      // Reset timer state
      setActiveTask(null);
      setTimerState("idle");
      setSecondsElapsed(0);
      setSecondsRemaining(0);
      setIsLoggingInterval(false);
      setShowLogIntervalConfirm(false);
      return;
    }

    try {
      const res = await logTaskInterval(
        currentActive.id,
        intervalTitle,
        finalSpent,
        currentActive.allocatedTime
      );
      if (res.error) {
        throw new Error(res.error);
      }
      if (res.success && res.task) {
        setTasks((prev) => [res.task as Task, ...prev]);

        // Reset timer state
        setActiveTask(null);
        setTimerState("idle");
        setSecondsElapsed(0);
        setSecondsRemaining(0);
        setShowLogIntervalConfirm(false);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error logging task progress.");
    } finally {
      setIsLoggingInterval(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setIsDeletingTaskId(taskId);

    if (isGuest) {
      const updated = tasks.filter((t) => t.id !== taskId);
      saveGuestTasks(updated);
      if (activeTask?.id === taskId) {
        setActiveTask(null);
        setTimerState("idle");
        setSecondsRemaining(0);
        setSecondsElapsed(0);
      }
      setIsDeletingTaskId(null);
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
    } finally {
      setIsDeletingTaskId(null);
    }
  };

  const handleExitToDashboard = () => {
    setShowFinishSuccess(false);
    setActiveTask(null);
    setTimerState("idle");
    setSecondsRemaining(0);
    setSecondsElapsed(0);
  };

  // Restore running focus session on mount once tasks are loaded
  const [hasRestoredActiveTask, setHasRestoredActiveTask] = useState(false);

  useEffect(() => {
    // Only attempt restoration once tasks list is loaded
    if (tasks.length === 0 || hasRestoredActiveTask) return;

    const savedSessionStr = localStorage.getItem("focusflow_active_session");
    if (savedSessionStr) {
      try {
        const savedSession = JSON.parse(savedSessionStr);
        const {
          activeTaskId,
          timerState: savedTimerState,
          timeMode: savedTimeMode,
          secondsRemaining: savedSecondsRemaining,
          secondsElapsed: savedSecondsElapsed,
          savedAt,
        } = savedSession;

        // Find the task in the loaded tasks list
        const foundTask = tasks.find((t) => t.id === activeTaskId);
        if (foundTask && !foundTask.isCompleted) {
          const elapsedSeconds = Math.floor((Date.now() - savedAt) / 1000);

          if (savedTimerState === "running") {
            if (savedTimeMode === "countdown") {
              const newRemaining = savedSecondsRemaining - elapsedSeconds;
              if (newRemaining <= 0) {
                // Task finished in background while tab was closed/refreshing
                const finalSpent = Math.max(
                  1,
                  Math.ceil((savedSecondsElapsed + savedSecondsRemaining) / 60)
                );
                finishTaskRequest(foundTask.id, finalSpent);
              } else {
                setActiveTask(foundTask);
                setTimeMode(savedTimeMode);
                setTimerState("running");
                setSecondsRemaining(newRemaining);
                setSecondsElapsed(savedSecondsElapsed + elapsedSeconds);
              }
            } else {
              // Countup mode
              setActiveTask(foundTask);
              setTimeMode(savedTimeMode);
              setTimerState("running");
              setSecondsRemaining(0);
              setSecondsElapsed(savedSecondsElapsed + elapsedSeconds);
            }
          } else if (savedTimerState === "paused") {
            setActiveTask(foundTask);
            setTimeMode(savedTimeMode);
            setTimerState("paused");
            setSecondsRemaining(savedSecondsRemaining);
            setSecondsElapsed(savedSecondsElapsed);
          }
        }
      } catch (e) {
        console.error("Failed to restore active focus session:", e);
      }
    }
    setHasRestoredActiveTask(true);
  }, [tasks, hasRestoredActiveTask]);

  // Persist running focus session state to localStorage
  useEffect(() => {
    if (activeTask) {
      const sessionData = {
        activeTaskId: activeTask.id,
        timerState,
        timeMode,
        secondsRemaining,
        secondsElapsed,
        savedAt: Date.now(),
      };
      localStorage.setItem("focusflow_active_session", JSON.stringify(sessionData));
    } else {
      localStorage.removeItem("focusflow_active_session");
    }
  }, [activeTask, timerState, timeMode, secondsRemaining, secondsElapsed]);

  return (
    <TimerContext.Provider
      value={{
        tasks,
        setTasks,
        isLoading,
        activeTask,
        setActiveTask,
        timerState,
        setTimerState,
        timeMode,
        setTimeMode,
        secondsRemaining,
        setSecondsRemaining,
        secondsElapsed,
        setSecondsElapsed,
        showFinishSuccess,
        setShowFinishSuccess,
        showLogIntervalConfirm,
        setShowLogIntervalConfirm,
        loggedMinutes,
        setLoggedMinutes,
        isFinishing,
        isLoggingInterval,
        isDeletingTaskId,
        setIsDeletingTaskId,
        startFocus,
        finishTaskRequest,
        confirmLogProgressActive,
        handleDeleteTask,
        saveGuestTasks,
        handleExitToDashboard,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
