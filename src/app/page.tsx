"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
  Play,
  Music,
  Zap,
  Star,
  Check,
  X,
  Activity,
  Brain,
  Volume2,
  Sun,
  Moon,
  Mail,
  Lock,
  Compass,
  User,
} from "lucide-react";
import { handleLogin, handleGuestLogin, signUpAction } from "@/app/actions/auth-actions";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [height, setHeight] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hasSession, setHasSession] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      // 1. Check guest session cookie
      if (document.cookie.includes("guest-session=true")) {
        setHasSession(true);
        setLoadingSession(false);
        return;
      }

      // 2. Check NextAuth active session
      try {
        const res = await fetch(`/api/auth/session?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const session = await res.json();
          if (session && Object.keys(session).length > 0) {
            setHasSession(true);
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setLoadingSession(false);
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    if (isLoginOpen && containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setHeight(entry.target.scrollHeight);
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    } else if (!isLoginOpen) {
      setHeight(undefined);
    }
  }, [isLoginOpen]);

  useEffect(() => {
    document.documentElement.style.fontSize = "120%";
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("login") === "true") {
        setIsLoginOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    return () => {
      document.documentElement.removeAttribute("data-theme");
    };
  }, [isDark]);

  const handleCredentialsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (authMode === "signup") {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      try {
        const res = await signUpAction(name, email, password);
        if (res?.error) {
          setErrorMessage(res.error);
          setIsSubmitting(false);
          return;
        }

        // Auto login on successful signup
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginRes?.error) {
          setErrorMessage("Account created successfully, but automatic login failed. Please sign in manually.");
          setAuthMode("login");
        } else {
          router.push("/dashboard");
        }
      } catch (err: any) {
        setErrorMessage("An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginRes?.error) {
          setErrorMessage("Invalid email or password");
        } else {
          router.push("/dashboard");
        }
      } catch (err: any) {
        setErrorMessage("An unexpected error occurred during login. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="min-h-screen relative lp-page-bg transition-colors duration-400"
    >
      {/* Header / Navbar */}
      <header className="lp-header bg-[#8869AA]/85 backdrop-blur-lg sticky top-0 z-40 shadow-sm animate-navbar-wave relative">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-sans font-semibold text-2xl tracking-tight text-[#F7F1D9]/90 hover:text-[#F7F1D9] transition-colors inline-flex items-center leading-none"
          >
            FocusFlow
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-[#F7F1D9]/80 hover:text-[#F7F1D9] transition-colors">
              Features
            </a>
            <a href="#methodology" className="text-sm font-bold text-[#F7F1D9]/80 hover:text-[#F7F1D9] transition-colors">
              Methodology
            </a>
            <a href="#pricing" className="text-sm font-bold text-[#F7F1D9]/80 hover:text-[#F7F1D9] transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Dark / Light toggle */}
            <button
              id="theme-toggle"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              onClick={() => setIsDark((d) => !d)}
              className={`w-12 h-7 rounded-full border transition-all duration-300 flex items-center p-0.5 shadow-inner backdrop-blur-md cursor-pointer shrink-0 ${
                isDark
                  ? "border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_12px_rgba(34,211,238,0.07)]"
                  : "border-amber-400/30 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.05)]"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 bg-white shadow-[0_0_8px_rgba(255,255,255,0.17)] ${
                  isDark ? "translate-x-5" : "translate-x-0"
                }`}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500/10" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                )}
              </span>
            </button>

            {!hasSession && (
              <button
                onClick={() => {
                  setAuthMode("login");
                  setIsLoginOpen(true);
                }}
                className="text-sm font-extrabold text-[#F7F1D9]/80 hover:text-[#F7F1D9] transition-colors px-3 py-2 cursor-pointer"
              >
                Login
              </button>
            )}
            <button
              onClick={() => {
                if (hasSession) {
                  router.push("/dashboard");
                } else {
                  setAuthMode("signup");
                  setIsLoginOpen(true);
                }
              }}
              className="bg-[#F7F1D9] hover:bg-[#F7F1D9]/90 text-[#3E2361] font-extrabold px-5 py-2 rounded-full text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all backdrop-blur-md cursor-pointer"
            >
              {hasSession ? "Go to Dashboard" : "Get Started"}
            </button>
          </div>
        </div>
        {/* Purple stripebar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5C4578]" />
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div className="flex flex-col gap-6 text-left">
          <h1 className={`lp-h1 text-[3.25rem] md:text-[4.05rem] font-black tracking-tight leading-[1.06] ${isDark ? "text-[#EDE8F5]" : "text-slate-900"}`}>
            Define Your <br />
            <span className="lp-gold-text text-[#B88D15]">Focus</span>
          </h1>

          <p className={`lp-body-text text-[1.08rem] md:text-[1.2rem] leading-relaxed max-w-lg font-bold ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
            Step away from the hustle. FocusFlow helps you cultivate a serene state of productivity through gentle reminders and organic time management.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              onClick={() => {
                if (hasSession) {
                  router.push("/dashboard");
                } else {
                  setAuthMode("signup");
                  setIsLoginOpen(true);
                }
              }}
              className="bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold px-8 py-3.5 rounded-full text-[0.95rem] shadow-md hover:shadow-lg transition-all backdrop-blur-md cursor-pointer"
            >
              {hasSession ? "Go to Dashboard" : "Start Focusing"}
            </button>
          </div>

          <p className="font-caveat lp-gold-text text-[2.1rem] text-[#B88D15] mt-3 select-none">
            "One step at a time, you've got this!"
          </p>
        </div>

        {/* Right Column */}
        <div className="flex justify-center items-center relative group">
          {/* Ambient Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#B88D15]/25 to-[#7B52AB]/30 rounded-[3rem] blur-3xl opacity-75 group-hover:opacity-95 transition-opacity duration-500 -z-10" />

          <div className="animate-float w-full max-w-lg">
            <div className={`lp-image-frame p-3 rounded-[2.5rem] border border-[#B88D15]/20 shadow-2xl backdrop-blur-xl aspect-[4/3] w-full flex flex-col justify-center items-center relative transition-all duration-500 hover:shadow-[0_20px_50px_rgba(184,141,21,0.3)] ${isDark ? "" : "bg-[#FAF6E3]/40"}`}>
              <div className="w-full h-full relative overflow-hidden rounded-[1.8rem] shadow-inner">
                <Image
                  src="/hero_girl.png"
                  alt="Define your focus illustration"
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "Why FocusFlow?" Features Section */}
      <section id="features" className={`lp-section-border mx-auto max-w-7xl px-6 py-20 border-t ${isDark ? "border-[rgba(123,82,171,0.18)]" : "border-slate-200/40"}`}>
        <div className="text-center">
          <h2 className={`lp-h2 text-[2.05rem] md:text-[2.7rem] font-black ${isDark ? "text-[#EDE8F5]" : "text-slate-900"}`}>Why FocusFlow?</h2>
          <p className={`lp-body-text font-bold text-[0.95rem] mt-3 max-w-xl mx-auto ${isDark ? "text-[#A89FC0]" : "text-slate-500"}`}>
            Features that help you stay aligned and productive without the pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {/* Card 1 */}
          <div className={`lp-gold-card p-8 rounded-3xl border shadow-md backdrop-blur-lg hover:bg-[#B88D15]/15 transition-all flex flex-col items-start gap-4 text-left ${isDark ? "bg-[rgba(184,141,21,0.12)] border-[rgba(184,141,21,0.22)]" : "bg-[#B88D15]/10 border-[#B88D15]/20"}`}>
            <div className={`lp-icon-badge-purple p-3 w-fit rounded-full border ${isDark ? "bg-[rgba(123,82,171,0.2)] border-[rgba(123,82,171,0.35)] text-[#9B72CC]" : "bg-[#7B52AB]/15 text-[#3E2361] border-[#7B52AB]/20"}`}>
              <Clock className="w-5 h-5" />
            </div>
            <h3 className={`lp-h3 text-[1.2rem] font-black ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>Serene Focus</h3>
            <p className={`lp-body-text text-[0.82rem] leading-relaxed font-bold ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
              Set gentle timers and minimize visual clutter so you can focus on what truly matters to you.
            </p>
          </div>

          {/* Card 2 */}
          <div className={`lp-gold-card p-8 rounded-3xl border shadow-md backdrop-blur-lg hover:bg-[#B88D15]/15 transition-all flex flex-col items-start gap-4 text-left ${isDark ? "bg-[rgba(184,141,21,0.12)] border-[rgba(184,141,21,0.22)]" : "bg-[#B88D15]/10 border-[#B88D15]/20"}`}>
            <div className={`lp-icon-badge-gold p-3 w-fit rounded-full border ${isDark ? "bg-[rgba(184,141,21,0.2)] border-[rgba(184,141,21,0.35)] text-[#D4A82A]" : "bg-[#B88D15]/15 text-[#B88D15] border-[#B88D15]/20"}`}>
              <Activity className="w-5 h-5" />
            </div>
            <h3 className={`lp-h3 text-[1.2rem] font-black ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>Gentle Tracking</h3>
            <p className={`lp-body-text text-[0.82rem] leading-relaxed font-bold ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
              Watch your focus daily bloom. Our minimalist tracker keeps you continuing your growth.
            </p>
          </div>

          {/* Card 3 */}
          <div className={`lp-gold-card p-8 rounded-3xl border shadow-md backdrop-blur-lg hover:bg-[#B88D15]/15 transition-all flex flex-col items-start gap-4 text-left ${isDark ? "bg-[rgba(184,141,21,0.12)] border-[rgba(184,141,21,0.22)]" : "bg-[#B88D15]/10 border-[#B88D15]/20"}`}>
            <div className={`lp-icon-badge-purple p-3 w-fit rounded-full border ${isDark ? "bg-[rgba(123,82,171,0.2)] border-[rgba(123,82,171,0.35)] text-[#9B72CC]" : "bg-[#7B52AB]/15 text-[#7B52AB] border-[#7B52AB]/20"}`}>
              <Brain className="w-5 h-5" />
            </div>
            <h3 className={`lp-h3 text-[1.2rem] font-black ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>Mind Space</h3>
            <p className={`lp-body-text text-[0.82rem] leading-relaxed font-bold ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
              Reflect on your day, log your victory, and clear out thoughts that clutter your mindscape.
            </p>
          </div>
        </div>
      </section>

      {/* "Enter the Zone" Section */}
      <section id="methodology" className={`lp-section-alt py-20 border-y ${isDark ? "bg-[rgba(22,13,38,0.7)] border-[rgba(123,82,171,0.18)]" : "bg-[#B88D15]/5 border-slate-200/40"}`}>
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column (Image) */}
          <div className="flex justify-center items-center order-2 lg:order-1 relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#7B52AB]/25 to-[#B88D15]/30 rounded-[3rem] blur-3xl opacity-75 group-hover:opacity-95 transition-opacity duration-500 -z-10" />

          <div className="animate-float-delayed w-full max-w-md">
            <div className={`lp-image-frame p-3 rounded-[2.5rem] border border-[#B88D15]/20 shadow-2xl backdrop-blur-xl aspect-[4/3] w-full flex flex-col justify-center items-center relative transition-all duration-500 hover:shadow-[0_20px_50px_rgba(123,82,171,0.3)] ${isDark ? "" : "bg-[#FAF6E3]/40"}`}>
              <div className="w-full h-full relative overflow-hidden rounded-[1.8rem] shadow-inner">
                <Image
                  src="/cat_playing.png"
                  alt="Cute cat playing with yarn illustration"
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>

          {/* Right Column (Text) */}
          <div className="flex flex-col gap-5 text-left order-1 lg:order-2">
            <h2 className={`lp-h2 text-[2.45rem] font-black leading-tight ${isDark ? "text-[#EDE8F5]" : "text-slate-900"}`}>
              Enter the <span className="text-[#7B52AB]">Zone</span>
            </h2>
            <p className={`lp-body-text text-[0.95rem] md:text-[1.08rem] leading-relaxed font-bold ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
              Focus flows naturally when you're in the right environment. Our minimalist workspace keeps distractions out so you can focus on the work that matters most.
            </p>

            <ul className="space-y-4 mt-3">
              <li className={`flex items-center gap-3 font-bold text-[0.95rem] ${isDark ? "text-[#A89FC0]" : "text-slate-700"}`}>
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <Check className="w-4 h-4" />
                </div>
                Minimal background music controls
              </li>
              <li className={`flex items-center gap-3 font-bold text-[0.95rem] ${isDark ? "text-[#A89FC0]" : "text-slate-700"}`}>
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <Check className="w-4 h-4" />
                </div>
                Interactive session task manager
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* "Log Your Wins" Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column (Text) */}
          <div className="flex flex-col gap-5 text-left">
            <h2 className={`lp-h2 text-[2.45rem] font-black leading-tight ${isDark ? "text-[#EDE8F5]" : "text-slate-900"}`}>
              Log Your <span className="lp-gold-text text-[#B88D15]">Wins</span>
            </h2>
            <p className={`lp-body-text text-[0.95rem] md:text-[1.08rem] leading-relaxed font-bold ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
              Celebrate tiny victories. FocusFlow records completed tasks to keep you motivated and secure a record of productivity.
            </p>
            <button
              onClick={() => {
                if (hasSession) {
                  router.push("/dashboard");
                } else {
                  setAuthMode("signup");
                  setIsLoginOpen(true);
                }
              }}
              className="bg-[#B88D15]/78 hover:bg-[#B88D15]/90 border border-[#B88D15]/40 text-white font-extrabold px-8 py-3.5 rounded-full text-[0.95rem] shadow-md hover:shadow-lg transition-all backdrop-blur-md w-fit mt-3 cursor-pointer"
            >
              {hasSession ? "Go to Dashboard" : "Log your first win"}
            </button>
          </div>

          {/* Right Column (Image) */}
          <div className="flex justify-center items-center relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#B88D15]/25 to-[#7B52AB]/30 rounded-[3rem] blur-3xl opacity-75 group-hover:opacity-95 transition-opacity duration-500 -z-10" />

          <div className="animate-float w-full max-w-md">
            <div className={`lp-image-frame p-3 rounded-[2.5rem] border border-[#B88D15]/20 shadow-2xl backdrop-blur-xl aspect-[4/3] w-full flex flex-col justify-center items-center relative transition-all duration-500 hover:shadow-[0_20px_50px_rgba(184,141,21,0.3)] ${isDark ? "" : "bg-[#FAF6E3]/40"}`}>
              <div className="w-full h-full relative overflow-hidden rounded-[1.8rem] shadow-inner">
                <Image
                  src="/sitting_cat.png"
                  alt="Cozy cat with steam"
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Testimonials Section */}
      <section className={`lp-section-alt py-20 border-y ${isDark ? "bg-[rgba(22,13,38,0.7)] border-[rgba(123,82,171,0.18)]" : "bg-[#B88D15]/5 border-slate-200/40"}`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className={`lp-h2 text-3xl md:text-4xl font-black ${isDark ? "text-[#EDE8F5]" : "text-slate-900"}`}>What Our Users Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Review 1 */}
            <div className={`lp-card p-8 rounded-3xl border shadow-md backdrop-blur-lg transition-all text-left flex flex-col justify-between gap-6 ${isDark ? "bg-[rgba(123,82,171,0.12)] border-[rgba(123,82,171,0.22)] hover:bg-[rgba(123,82,171,0.2)]" : "bg-[#7B52AB]/10 border-[#7B52AB]/20 hover:bg-[#7B52AB]/15"}`}>
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className={`lp-review-text text-sm font-semibold italic leading-relaxed ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
                  "FocusFlow is exactly what I needed. It makes tracking time feel less like a chore and more like a gentle habit."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className={`lp-avatar w-9 h-9 rounded-full font-black text-xs flex items-center justify-center border ${isDark ? "bg-[rgba(123,82,171,0.2)] border-[rgba(123,82,171,0.35)] text-[#9B72CC]" : "bg-[#7B52AB]/15 text-[#3E2361] border-[#7B52AB]/30"}`}>
                  EJ
                </div>
                <div>
                  <h4 className={`lp-h4 text-xs font-black ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>Emma J.</h4>
                  <p className={`lp-muted-text text-[10px] font-bold ${isDark ? "text-[#6B6080]" : "text-slate-400"}`}>Freelance Designer</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className={`lp-card p-8 rounded-3xl border shadow-md backdrop-blur-lg transition-all text-left flex flex-col justify-between gap-6 ${isDark ? "bg-[rgba(123,82,171,0.12)] border-[rgba(123,82,171,0.22)] hover:bg-[rgba(123,82,171,0.2)]" : "bg-[#7B52AB]/10 border-[#7B52AB]/20 hover:bg-[#7B52AB]/15"}`}>
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className={`lp-review-text text-sm font-semibold italic leading-relaxed ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
                  "The sound of lo-fi music combined with simple tracking helps me stay in the zone for hours without burning out."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className={`lp-avatar w-9 h-9 rounded-full font-black text-xs flex items-center justify-center border ${isDark ? "bg-[rgba(123,82,171,0.2)] border-[rgba(123,82,171,0.35)] text-[#9B72CC]" : "bg-[#7B52AB]/15 text-[#3E2361] border-[#7B52AB]/20"}`}>
                  OS
                </div>
                <div>
                  <h4 className={`lp-h4 text-xs font-black ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>Olive S.</h4>
                  <p className={`lp-muted-text text-[10px] font-bold ${isDark ? "text-[#6B6080]" : "text-slate-400"}`}>Software Engineer</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className={`lp-card p-8 rounded-3xl border shadow-md backdrop-blur-lg transition-all text-left flex flex-col justify-between gap-6 ${isDark ? "bg-[rgba(123,82,171,0.12)] border-[rgba(123,82,171,0.22)] hover:bg-[rgba(123,82,171,0.2)]" : "bg-[#7B52AB]/10 border-[#7B52AB]/20 hover:bg-[#7B52AB]/15"}`}>
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className={`lp-review-text text-sm font-semibold italic leading-relaxed ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
                  "I love the guest mode! I can jump right into work on any machine without having to sign in or sign up first."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className={`lp-avatar w-9 h-9 rounded-full font-black text-xs flex items-center justify-center border ${isDark ? "bg-[rgba(123,82,171,0.2)] border-[rgba(123,82,171,0.35)] text-[#9B72CC]" : "bg-[#7B52AB]/15 text-[#7B52AB] border-[#7B52AB]/20"}`}>
                  SL
                </div>
                <div>
                  <h4 className={`lp-h4 text-xs font-black ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>Sarah L.</h4>
                  <p className={`lp-muted-text text-[10px] font-bold ${isDark ? "text-[#6B6080]" : "text-slate-400"}`}>Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className={`lp-h2 text-3xl md:text-4xl font-black ${isDark ? "text-[#EDE8F5]" : "text-slate-900"}`}>Simple Pricing</h2>
          <p className={`lp-body-text font-bold text-sm mt-3 ${isDark ? "text-[#A89FC0]" : "text-slate-500"}`}>
            No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-16">
          {/* Free Tier */}
          <div className={`lp-gold-card p-8 rounded-[2rem] border shadow-lg backdrop-blur-lg flex flex-col justify-between text-left relative overflow-hidden group ${isDark ? "bg-[rgba(184,141,21,0.12)] border-[rgba(184,141,21,0.22)]" : "bg-[#B88D15]/10 border-[#B88D15]/20"}`}>
            <div>
              <span className={`lp-muted-text text-[10px] tracking-[0.2em] font-extrabold uppercase ${isDark ? "text-[#6B6080]" : "text-slate-500"}`}>
                Free Option
              </span>
              <h3 className={`lp-h3 text-2xl font-black mt-2 ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>Free / Guest</h3>

              <div className={`mt-4 flex items-baseline gap-1 ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>
                <span className="text-4xl font-black">$0</span>
                <span className={`lp-muted-text text-xs font-bold ${isDark ? "text-[#6B6080]" : "text-slate-500"}`}>/ forever</span>
              </div>

              <ul className={`lp-pricing-divider space-y-3.5 mt-8 border-t pt-6 ${isDark ? "border-[rgba(184,141,21,0.12)]" : "border-[#B88D15]/10"}`}>
                <li className={`flex items-center gap-3 font-bold text-xs ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  Local browser storage
                </li>
                <li className={`flex items-center gap-3 font-bold text-xs ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  Interactive task manager
                </li>
                <li className={`flex items-center gap-3 font-bold text-xs ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  Basic lo-fi beats
                </li>
              </ul>
            </div>

            <form action={handleGuestLogin} className="mt-8">
              <button
                type="submit"
                className="w-full text-center bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-md hover:shadow-lg backdrop-blur-md"
              >
                Get Started
              </button>
            </form>
          </div>

          {/* Pro Tier */}
          <div className={`lp-gold-card p-8 rounded-[2rem] border shadow-lg backdrop-blur-lg flex flex-col justify-between text-left relative overflow-hidden group ${isDark ? "bg-[rgba(184,141,21,0.12)] border-[rgba(184,141,21,0.22)]" : "bg-[#B88D15]/10 border-[#B88D15]/20"}`}>
            <div>
              <span className="text-[10px] tracking-[0.2em] font-extrabold text-[#B88D15] uppercase">
                Fully Loaded
              </span>
              <h3 className={`lp-h3 text-2xl font-black mt-2 ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>Pro Plan</h3>

              <div className="mt-4 flex items-baseline gap-1">
                <span className={`lp-coming-soon-text text-2xl font-black ${isDark ? "text-[#6B6080]" : "text-slate-400"}`}>Coming Soon</span>
              </div>

              <ul className={`lp-pricing-divider space-y-3.5 mt-8 border-t pt-6 ${isDark ? "border-[rgba(184,141,21,0.12)]" : "border-[#B88D15]/10"}`}>
                <li className={`flex items-center gap-3 font-bold text-xs ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
                  <Check className="w-4 h-4 text-[#B88D15] shrink-0" />
                  Cloud sync &amp; backup
                </li>
                <li className={`flex items-center gap-3 font-bold text-xs ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
                  <Check className="w-4 h-4 text-[#B88D15] shrink-0" />
                  All dynamic features
                </li>
                <li className={`flex items-center gap-3 font-bold text-xs ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
                  <Check className="w-4 h-4 text-[#B88D15] shrink-0" />
                  Advanced stats &amp; history
                </li>
                <li className={`flex items-center gap-3 font-bold text-xs ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
                  <Check className="w-4 h-4 text-[#B88D15] shrink-0" />
                  Custom sync &amp; offline mode
                </li>
              </ul>
            </div>

            <button
              disabled
              className="w-full text-center bg-slate-500/10 border border-slate-500/20 text-slate-400 font-extrabold py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider mt-8 cursor-not-allowed backdrop-blur-sm shadow-inner"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className={`lp-cta-box border backdrop-blur-lg rounded-[2.5rem] p-10 md:p-16 text-center shadow-xl relative overflow-hidden ${isDark ? "bg-[rgba(123,82,171,0.12)] border-[rgba(123,82,171,0.25)]" : "bg-[#B88D15]/10 border-[#B88D15]/20"}`}>
          {/* Subtle background glow */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <h2 className={`lp-h2 text-3xl md:text-5xl font-black tracking-tight relative z-10 ${isDark ? "text-[#EDE8F5]" : "text-slate-900"}`}>
            Ready to find your flow?
          </h2>
          <p className={`lp-body-text font-bold text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed relative z-10 ${isDark ? "text-[#A89FC0]" : "text-slate-650"}`}>
            Quiet the noise. Embrace the calm. Your focus is a journey, and every step counts.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 mt-8 relative z-10">
            <button
              onClick={() => {
                if (hasSession) {
                  router.push("/dashboard");
                } else {
                  setAuthMode("signup");
                  setIsLoginOpen(true);
                }
              }}
              className="bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold px-8 py-3.5 rounded-full text-sm shadow-md hover:shadow-lg transition-all backdrop-blur-md cursor-pointer"
            >
              {hasSession ? "Go to Dashboard" : "Start focusing now"}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`lp-footer border-t py-16 text-left relative z-10 ${isDark ? "bg-[#0A0614] border-[rgba(123,82,171,0.15)]" : "bg-slate-50 border-slate-200/40"}`}>
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-sans font-semibold text-[#7B52AB]/80 tracking-tight">FocusFlow</h3>
            <p className={`lp-muted-text text-xs font-bold leading-relaxed max-w-xs ${isDark ? "text-[#6B6080]" : "text-slate-400"}`}>
              Gentle tools to help you focus nicely and productively.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            <h4 className={`lp-h4 text-xs font-black uppercase tracking-wider ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>Product</h4>
            <button type="button" className={`lp-footer-link text-xs font-bold transition-colors text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>Features</button>
            <button type="button" className={`lp-footer-link text-xs font-bold transition-colors text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>Methodology</button>
            <button type="button" className={`lp-footer-link text-xs font-bold transition-colors text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>Pricing</button>
            <form action={handleGuestLogin} className="inline">
              <button type="submit" className={`lp-footer-link text-xs font-bold transition-colors block text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>Guest Mode</button>
            </form>
          </div>
          <div className="flex flex-col gap-3.5">
            <h4 className={`lp-h4 text-xs font-black uppercase tracking-wider ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>Resources</h4>
            <button type="button" className={`lp-footer-link text-xs font-bold transition-colors text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>Blog</button>
            <button type="button" className={`lp-footer-link text-xs font-bold transition-colors text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>Guides</button>
            <button type="button" className={`lp-footer-link text-xs font-bold transition-colors text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>Community</button>
            <button type="button" className={`lp-footer-link text-xs font-bold transition-colors text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>Help Center</button>
          </div>
          <div className="flex flex-col gap-3.5">
            <h4 className={`lp-h4 text-xs font-black uppercase tracking-wider ${isDark ? "text-[#EDE8F5]" : "text-slate-800"}`}>Company</h4>
            <button type="button" className={`lp-footer-link text-xs font-bold transition-colors text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>About Us</button>
            <button type="button" className={`lp-footer-link text-xs font-bold transition-colors text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>Careers</button>
            <button type="button" className={`lp-footer-link text-xs font-bold transition-colors text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>Press</button>
            <button type="button" className={`lp-footer-link text-xs font-bold transition-colors text-left ${isDark ? "text-[#6B6080] hover:text-[#A89FC0]" : "text-slate-400 hover:text-slate-800"}`}>Contact</button>
          </div>
        </div>
        <div className={`mx-auto max-w-7xl px-6 border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? "border-[rgba(123,82,171,0.12)]" : "border-slate-150"}`}>
          <p className={`lp-muted-text text-[10px] font-bold ${isDark ? "text-[#6B6080]" : "text-slate-400"}`}>
            © {new Date().getFullYear()} FocusFlow. Productivity Study Corner.
          </p>
          <p className="font-caveat lp-gold-text text-2xl text-[#B88D15] select-none">
            Stay serene, keep moving.
          </p>
        </div>
      </footer>

      {/* Login Modal Overlay */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0614]/85 animate-login-backdrop">
          <div className={`rounded-[2rem] border shadow-2xl max-w-md w-full relative animate-modal-scale-up backdrop-blur-md transition-all duration-300 ${isDark ? "bg-[#150D24]/95 border-[rgba(123,82,171,0.25)] text-[#EDE8F5]" : "bg-[#FFFDF5]/95 border-[#B88D15]/20 text-slate-900"}`}>
            
            {/* Close button */}
            <button
              onClick={() => setIsLoginOpen(false)}
              className={`absolute top-5 right-5 p-2 rounded-full transition-all border cursor-pointer z-20 ${isDark ? "text-[#6B6080] border-transparent hover:text-[#A89FC0] hover:bg-[rgba(123,82,171,0.15)]" : "text-slate-400 border-transparent hover:text-slate-850 hover:bg-slate-100"}`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Height transitioning wrapper */}
            <div 
              style={{ height: height ? `${height}px` : "auto" }}
              className="transition-[height] duration-300 ease-out overflow-hidden"
            >
              <div ref={containerRef} className="p-8 flex flex-col">
                {/* Header / Logo */}
                <div className="flex flex-col items-center gap-3.5 text-center mb-6">
                  <div>
                    <h2 className="font-sans font-black text-2xl tracking-tight text-[#7B52AB]">FocusFlow</h2>
                    <p className={`text-[11px] font-bold mt-1.5 max-w-xs ${isDark ? "text-[#A89FC0]" : "text-slate-500"}`}>
                      Your quiet digital corner for deep concentration.
                    </p>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="relative grid grid-cols-2 p-1 bg-[#7B52AB]/5 dark:bg-[#7B52AB]/10 rounded-2xl border border-[#7B52AB]/15 w-full mb-6 shrink-0 overflow-hidden">
                  {/* Sliding backdrop */}
                  <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#7B52AB] rounded-xl shadow-md transition-all duration-300 ease-out z-0 ${
                      authMode === "signup" ? "translate-x-[calc(100%+4px)]" : "translate-x-1"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setErrorMessage("");
                    }}
                    className={`relative py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer z-10 ${
                      authMode === "login"
                        ? "text-white"
                        : isDark
                        ? "text-[#A89FC0] hover:text-[#EDE8F5]"
                        : "text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setErrorMessage("");
                    }}
                    className={`relative py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer z-10 ${
                      authMode === "signup"
                        ? "text-white"
                        : isDark
                        ? "text-[#A89FC0] hover:text-[#EDE8F5]"
                        : "text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Sign Up
                  </button>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold animate-fade-in animate-pulse">
                    {errorMessage}
                  </div>
                )}

                {/* Card Content based on Mode */}
                {authMode === "login" ? (
                  <div key="login" className="animate-slide-fade-in space-y-4">
                    <form onSubmit={handleCredentialsSubmit} className="space-y-3">
                      {/* Email Field */}
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address"
                          className={`w-full pl-11 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold shadow-sm placeholder-slate-400 ${
                            isDark
                              ? "bg-[rgba(123,82,171,0.08)] border-[rgba(123,82,171,0.25)] text-[#EDE8F5]"
                              : "border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-900"
                          }`}
                        />
                      </div>

                      {/* Password Field */}
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          name="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className={`w-full pl-11 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold shadow-sm placeholder-slate-400 ${
                            isDark
                              ? "bg-[rgba(123,82,171,0.08)] border-[rgba(123,82,171,0.25)] text-[#EDE8F5]"
                              : "border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-900"
                          }`}
                        />
                      </div>

                      {/* Login Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer mt-2"
                      >
                        {isSubmitting ? "Signing In..." : "Log In"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-4 shrink-0">
                      <div className={`h-[1px] flex-1 ${isDark ? "bg-[rgba(123,82,171,0.18)]" : "bg-slate-100"}`} />
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isDark ? "text-[#6B6080]" : "text-slate-400"}`}>Or connect with</span>
                      <div className={`h-[1px] flex-1 ${isDark ? "bg-[rgba(123,82,171,0.18)]" : "bg-slate-100"}`} />
                    </div>

                    {/* Google Button */}
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                      className={`w-full flex items-center justify-center gap-2 border font-extrabold py-3 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-sm cursor-pointer ${
                        isDark 
                          ? "bg-[rgba(30,18,50,0.8)] hover:bg-[rgba(30,18,50,0.9)] border-[rgba(123,82,171,0.3)] text-[#EDE8F5]" 
                          : "bg-[#FAF6E3] hover:bg-[#FAF6E3]/80 border-[#7B52AB]/20 text-[#3E2361]"
                      }`}
                    >
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Sign In with Google
                    </button>

                    {/* Guest Mode option below Google */}
                    <div className="pt-2 text-center">
                      <form action={handleGuestLogin} className="inline">
                        <button
                          type="submit"
                          className={`text-xs font-bold underline transition-colors cursor-pointer ${
                            isDark ? "text-[#A89FC0] hover:text-[#EDE8F5]" : "text-slate-555 hover:text-[#7B52AB]"
                          }`}
                        >
                          Use Guest Mode
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div key="signup" className="animate-slide-fade-in space-y-4">
                    <form onSubmit={handleCredentialsSubmit} className="space-y-3">
                      {/* Name Field */}
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name"
                          className={`w-full pl-11 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold shadow-sm placeholder-slate-400 ${
                            isDark
                              ? "bg-[rgba(123,82,171,0.08)] border-[rgba(123,82,171,0.25)] text-[#EDE8F5]"
                              : "border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-900"
                          }`}
                        />
                      </div>

                      {/* Email Field */}
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address"
                          className={`w-full pl-11 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold shadow-sm placeholder-slate-400 ${
                            isDark
                              ? "bg-[rgba(123,82,171,0.08)] border-[rgba(123,82,171,0.25)] text-[#EDE8F5]"
                              : "border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-900"
                          }`}
                        />
                      </div>

                      {/* Password Field */}
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          name="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className={`w-full pl-11 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold shadow-sm placeholder-slate-400 ${
                            isDark
                              ? "bg-[rgba(123,82,171,0.08)] border-[rgba(123,82,171,0.25)] text-[#EDE8F5]"
                              : "border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-900"
                          }`}
                        />
                      </div>

                      {/* Confirm Password Field */}
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm Password"
                          className={`w-full pl-11 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold shadow-sm placeholder-slate-400 ${
                            isDark
                              ? "bg-[rgba(123,82,171,0.08)] border-[rgba(123,82,171,0.25)] text-[#EDE8F5]"
                              : "border-[#7B52AB]/20 bg-[#FAF6E3]/30 text-slate-900"
                          }`}
                        />
                      </div>

                      {/* Sign Up Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer mt-2"
                      >
                        {isSubmitting ? "Creating Account..." : "Sign Up"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-4 shrink-0">
                      <div className={`h-[1px] flex-1 ${isDark ? "bg-[rgba(123,82,171,0.18)]" : "bg-slate-100"}`} />
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isDark ? "text-[#6B6080]" : "text-slate-400"}`}>Or connect with</span>
                      <div className={`h-[1px] flex-1 ${isDark ? "bg-[rgba(123,82,171,0.18)]" : "bg-slate-100"}`} />
                    </div>

                    {/* Google Button */}
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                      className={`w-full flex items-center justify-center gap-2 border font-extrabold py-3 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-sm cursor-pointer ${
                        isDark 
                          ? "bg-[rgba(30,18,50,0.8)] hover:bg-[rgba(30,18,50,0.9)] border-[rgba(123,82,171,0.3)] text-[#EDE8F5]" 
                          : "bg-[#FAF6E3] hover:bg-[#FAF6E3]/80 border-[#7B52AB]/20 text-[#3E2361]"
                      }`}
                    >
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Sign Up with Google
                    </button>

                    {/* Guest Mode option below Google */}
                    <div className="pt-2 text-center">
                      <form action={handleGuestLogin} className="inline">
                        <button
                          type="submit"
                          className={`text-xs font-bold underline transition-colors cursor-pointer ${
                            isDark ? "text-[#A89FC0] hover:text-[#EDE8F5]" : "text-slate-555 hover:text-[#7B52AB]"
                          }`}
                        >
                          Use Guest Mode
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
