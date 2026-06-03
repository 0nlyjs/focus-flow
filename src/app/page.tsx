"use client";

import { useState, useEffect } from "react";
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
  Volume2
} from "lucide-react";
import { handleLogin, handleGuestLogin } from "@/app/actions/auth-actions";
import InteractiveParticles from "@/components/interactive-particles";

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.documentElement.style.fontSize = "120%";
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, []);

  const handleMagicLinkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const formData = new FormData(e.currentTarget);
      await handleLogin(formData);
    } catch (err: any) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6E3] text-slate-800 font-sans selection:bg-[#7B52AB]/20 selection:text-[#3E2361] relative">
      <InteractiveParticles />
      {/* Header / Navbar */}
      <header className="border-b border-[#B88D15]/20 bg-[#B88D15]/10 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-sans font-semibold text-2xl tracking-tight text-[#7B52AB]/80 hover:text-[#7B52AB] transition-colors inline-flex items-center leading-none"
          >
            FocusFlow
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#methodology" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              Methodology
            </a>
            <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="text-sm font-extrabold text-slate-550 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Login
            </button>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold px-5 py-2 rounded-full text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all backdrop-blur-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div className="flex flex-col gap-6 text-left">
          <h1 className="text-[3.25rem] md:text-[4.05rem] font-black tracking-tight text-slate-900 leading-[1.06]">
            Define Your <br />
            <span className="text-[#B88D15]">Focus</span>
          </h1>

          <p className="text-slate-650 text-[1.08rem] md:text-[1.2rem] leading-relaxed max-w-lg font-bold">
            Step away from the hustle. FocusFlow helps you cultivate a serene state of productivity through gentle reminders and organic time management.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold px-8 py-3.5 rounded-full text-[0.95rem] shadow-md hover:shadow-lg transition-all backdrop-blur-md"
            >
              Start Focusing
            </button>
          </div>

          <p className="font-caveat text-[2.1rem] text-[#B88D15] mt-3 select-none">
            "One step at a time, you've got this!"
          </p>
        </div>

        {/* Right Column */}
        <div className="flex justify-center items-center relative group">
          {/* Ambient Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#B88D15]/25 to-[#7B52AB]/30 rounded-[3rem] blur-3xl opacity-75 group-hover:opacity-95 transition-opacity duration-500 -z-10" />

          <div className="bg-white/40 p-3 rounded-[2.5rem] border border-white/50 shadow-2xl backdrop-blur-xl aspect-[4/3] w-full max-w-lg flex flex-col justify-center items-center relative animate-float transition-all duration-500 hover:shadow-[0_20px_50px_rgba(184,141,21,0.3)]">
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
      </section>

      {/* "Why FocusFlow?" Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 border-t border-slate-200/40">
        <div className="text-center">
          <h2 className="text-[2.05rem] md:text-[2.7rem] font-black text-slate-900">Why FocusFlow?</h2>
          <p className="text-slate-500 font-bold text-[0.95rem] mt-3 max-w-xl mx-auto">
            Features that help you stay aligned and productive without the pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {/* Card 1 */}
          <div className="bg-[#B88D15]/10 p-8 rounded-3xl border border-[#B88D15]/20 shadow-md backdrop-blur-lg hover:bg-[#B88D15]/15 transition-all flex flex-col items-start gap-4 text-left">
            <div className="p-3 w-fit rounded-full bg-[#7B52AB]/15 text-[#3E2361] border border-[#7B52AB]/20">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-[1.2rem] font-black text-slate-800">Serene Focus</h3>
            <p className="text-[0.82rem] text-slate-650 leading-relaxed font-bold">
              Set gentle timers and minimize visual clutter so you can focus on what truly matters to you.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#B88D15]/10 p-8 rounded-3xl border border-[#B88D15]/20 shadow-md backdrop-blur-lg hover:bg-[#B88D15]/15 transition-all flex flex-col items-start gap-4 text-left">
            <div className="p-3 w-fit rounded-full bg-[#B88D15]/15 text-[#B88D15] border border-[#B88D15]/20">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-[1.2rem] font-black text-slate-800">Gentle Tracking</h3>
            <p className="text-[0.82rem] text-slate-650 leading-relaxed font-bold">
              Watch your focus daily bloom. Our minimalist tracker keeps you continuing your growth.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#B88D15]/10 p-8 rounded-3xl border border-[#B88D15]/20 shadow-md backdrop-blur-lg hover:bg-[#B88D15]/15 transition-all flex flex-col items-start gap-4 text-left">
            <div className="p-3 w-fit rounded-full bg-[#7B52AB]/15 text-[#7B52AB] border border-[#7B52AB]/20">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-[1.2rem] font-black text-slate-800">Mind Space</h3>
            <p className="text-[0.82rem] text-slate-650 leading-relaxed font-bold">
              Reflect on your day, log your victory, and clear out thoughts that clutter your mindscape.
            </p>
          </div>
        </div>
      </section>

      {/* "Enter the Zone" Section */}
      <section id="methodology" className="bg-[#B88D15]/5 py-20 border-y border-slate-200/40">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column (Image) */}
          <div className="flex justify-center items-center order-2 lg:order-1 relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#7B52AB]/25 to-[#B88D15]/30 rounded-[3rem] blur-3xl opacity-75 group-hover:opacity-95 transition-opacity duration-500 -z-10" />

            <div className="bg-white/40 p-3 rounded-[2.5rem] border border-white/50 shadow-2xl backdrop-blur-xl aspect-[4/3] w-full max-w-md flex flex-col justify-center items-center relative animate-float-delayed transition-all duration-500 hover:shadow-[0_20px_50px_rgba(123,82,171,0.3)]">
              <div className="w-full h-full relative overflow-hidden rounded-[1.8rem] shadow-inner">
                <Image
                  src="/cat_playing.png"
                  alt="Cute cat playing with yarn illustration"
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Overlay Label */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 px-5 py-1.5 rounded-full border border-white/60 backdrop-blur-md shadow-md select-none opacity-90 hover:opacity-100 transition-opacity duration-300">
                <p className="font-caveat text-[1.65rem] text-[#B88D15] leading-none whitespace-nowrap">
                  Play with the kittens
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (Text) */}
          <div className="flex flex-col gap-5 text-left order-1 lg:order-2">
            <h2 className="text-[2.45rem] font-black text-slate-900 leading-tight">
              Enter the <span className="text-[#7B52AB]">Zone</span>
            </h2>
            <p className="text-slate-650 text-[0.95rem] md:text-[1.08rem] leading-relaxed font-bold">
              Focus flows naturally when you're in the right environment. Our minimalist workspace keeps distractions out so you can focus on the work that matters most.
            </p>

            <ul className="space-y-4 mt-3">
              <li className="flex items-center gap-3 text-slate-700 font-bold text-[0.95rem]">
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <Check className="w-4 h-4" />
                </div>
                Minimal background music controls
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-bold text-[0.95rem]">
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
            <h2 className="text-[2.45rem] font-black text-slate-900 leading-tight">
              Log Your <span className="text-[#B88D15]">Wins</span>
            </h2>
            <p className="text-slate-650 text-[0.95rem] md:text-[1.08rem] leading-relaxed font-bold">
              Celebrate tiny victories. FocusFlow records completed tasks to keep you motivated and secure a record of productivity.
            </p>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#B88D15]/78 hover:bg-[#B88D15]/90 border border-[#B88D15]/40 text-white font-extrabold px-8 py-3.5 rounded-full text-[0.95rem] shadow-md hover:shadow-lg transition-all backdrop-blur-md w-fit mt-3"
            >
              Log your first win
            </button>
          </div>

          {/* Right Column (Image) */}
          <div className="flex justify-center items-center relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#B88D15]/25 to-[#7B52AB]/30 rounded-[3rem] blur-3xl opacity-75 group-hover:opacity-95 transition-opacity duration-500 -z-10" />

            <div className="bg-white/40 p-3 rounded-[2.5rem] border border-white/50 shadow-2xl backdrop-blur-xl aspect-[4/3] w-full max-w-md flex flex-col justify-center items-center relative animate-float transition-all duration-500 hover:shadow-[0_20px_50px_rgba(184, 141, 21, 0.3)]">
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
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#B88D15]/5 py-20 border-y border-slate-200/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">What Our Users Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Review 1 */}
            <div className="bg-[#7B52AB]/10 p-8 rounded-3xl border border-[#7B52AB]/20 shadow-md backdrop-blur-lg hover:bg-[#7B52AB]/15 transition-all text-left flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-slate-650 text-sm font-semibold italic leading-relaxed">
                  "FocusFlow is exactly what I needed. It makes tracking time feel less like a chore and more like a gentle habit."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-9 h-9 rounded-full bg-[#7B52AB]/15 text-[#3E2361] font-black text-xs flex items-center justify-center border border-[#7B52AB]/30">
                  EJ
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Emma J.</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Freelance Designer</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-[#7B52AB]/10 p-8 rounded-3xl border border-[#7B52AB]/20 shadow-md backdrop-blur-lg hover:bg-[#7B52AB]/15 transition-all text-left flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-slate-650 text-sm font-semibold italic leading-relaxed">
                  "The sound of lo-fi music combined with simple tracking helps me stay in the zone for hours without burning out."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-9 h-9 rounded-full bg-[#7B52AB]/15 text-[#3E2361] font-black text-xs flex items-center justify-center border border-[#7B52AB]/20">
                  OS
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Olive S.</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Software Engineer</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-[#7B52AB]/10 p-8 rounded-3xl border border-[#7B52AB]/20 shadow-md backdrop-blur-lg hover:bg-[#7B52AB]/15 transition-all text-left flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-slate-650 text-sm font-semibold italic leading-relaxed">
                  "I love the guest mode! I can jump right into work on any machine without having to sign in or sign up first."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-9 h-9 rounded-full bg-[#7B52AB]/15 text-[#7B52AB] font-black text-xs flex items-center justify-center border border-[#7B52AB]/20">
                  SL
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Sarah L.</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">Simple Pricing</h2>
          <p className="text-slate-500 font-bold text-sm mt-3">
            No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-16">
          {/* Free Tier */}
          <div className="bg-[#B88D15]/10 p-8 rounded-[2rem] border border-[#B88D15]/20 shadow-lg backdrop-blur-lg flex flex-col justify-between text-left relative overflow-hidden group">
            <div>
              <span className="text-[10px] tracking-[0.2em] font-extrabold text-slate-500 uppercase">
                Free Option
              </span>
              <h3 className="text-2xl font-black text-slate-800 mt-2">Free / Guest</h3>
              
              <div className="mt-4 flex items-baseline gap-1 text-slate-800">
                <span className="text-4xl font-black">$0</span>
                <span className="text-xs font-bold text-slate-500">/ forever</span>
              </div>

              <ul className="space-y-3.5 mt-8 border-t border-[#B88D15]/10 pt-6">
                <li className="flex items-center gap-3 text-slate-650 font-bold text-xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  Local browser storage
                </li>
                <li className="flex items-center gap-3 text-slate-650 font-bold text-xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  Interactive task manager
                </li>
                <li className="flex items-center gap-3 text-slate-650 font-bold text-xs">
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
          <div className="bg-[#B88D15]/10 p-8 rounded-[2rem] border border-[#B88D15]/20 shadow-lg backdrop-blur-lg flex flex-col justify-between text-left relative overflow-hidden group">
            <div>
              <span className="text-[10px] tracking-[0.2em] font-extrabold text-[#B88D15] uppercase">
                Fully Loaded
              </span>
              <h3 className="text-2xl font-black text-slate-800 mt-2">Pro Plan</h3>

              <div className="mt-4 flex items-baseline gap-1 text-slate-800">
                <span className="text-2xl font-black text-slate-400">Coming Soon</span>
              </div>

              <ul className="space-y-3.5 mt-8 border-t border-[#B88D15]/10 pt-6">
                <li className="flex items-center gap-3 text-slate-650 font-bold text-xs">
                  <Check className="w-4 h-4 text-[#B88D15] shrink-0" />
                  Cloud sync & backup
                </li>
                <li className="flex items-center gap-3 text-slate-650 font-bold text-xs">
                  <Check className="w-4 h-4 text-[#B88D15] shrink-0" />
                  All dynamic features
                </li>
                <li className="flex items-center gap-3 text-slate-650 font-bold text-xs">
                  <Check className="w-4 h-4 text-[#B88D15] shrink-0" />
                  Advanced stats & history
                </li>
                <li className="flex items-center gap-3 text-slate-650 font-bold text-xs">
                  <Check className="w-4 h-4 text-[#B88D15] shrink-0" />
                  Custom sync & offline mode
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
        <div className="bg-[#B88D15]/10 border border-[#B88D15]/20 backdrop-blur-lg rounded-[2.5rem] p-10 md:p-16 text-center text-slate-850 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <h2 className="text-3xl md:text-5xl font-black tracking-tight relative z-10 text-slate-900">
            Ready to find your flow?
          </h2>
          <p className="text-slate-650 font-bold text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed relative z-10">
            Quiet the noise. Embrace the calm. Your focus is a journey, and every step counts.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 mt-8 relative z-10">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold px-8 py-3.5 rounded-full text-sm shadow-md hover:shadow-lg transition-all backdrop-blur-md"
            >
              Start focusing now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200/40 py-16 text-slate-600 text-left relative z-10">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-sans font-semibold text-[#7B52AB]/80 tracking-tight">FocusFlow</h3>
            <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-xs">
              Gentle tools to help you focus nicely and productively.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Product</h4>
            <a href="#features" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors">Features</a>
            <a href="#methodology" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors">Methodology</a>
            <a href="#pricing" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors">Pricing</a>
            <form action={handleGuestLogin} className="inline">
              <button type="submit" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors block text-left">Guest Mode</button>
            </form>
          </div>
          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Resources</h4>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors">Blog</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors">Guides</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors">Community</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors">Help Center</a>
          </div>
          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Company</h4>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors">About Us</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors">Careers</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors">Press</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors">Contact</a>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 border-t border-slate-150 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-400 font-bold">
            © {new Date().getFullYear()} FocusFlow. Productivity Study Corner.
          </p>
          <p className="font-caveat text-2xl text-[#B88D15] select-none">
            Stay serene, keep moving.
          </p>
        </div>
      </footer>

      {/* Login Modal Overlay */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-2xl max-w-md w-full relative">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-3.5 rounded-2xl bg-orange-50/50 text-[#B88D15] border border-[#EADBF7]/40">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Sign in to FocusFlow</h3>
                <p className="text-xs text-slate-400 font-bold mt-1.5 leading-relaxed">
                  Enter your email to receive a secure passwordless login link.
                </p>
              </div>

              {errorMessage && (
                <div className="w-full p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleMagicLinkSubmit} className="w-full space-y-3 mt-4">
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B52AB]/30 focus:border-[#7B52AB] transition-all text-sm font-bold shadow-sm"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#7B52AB]/78 hover:bg-[#7B52AB]/90 border border-[#7B52AB]/40 text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-md hover:shadow-lg backdrop-blur-md disabled:opacity-75"
                >
                  {isSubmitting ? "Sending..." : "Send Magic Link"}
                </button>
              </form>

              <div className="w-full border-t border-slate-100 my-2 pt-4">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 mb-3">
                  Or continue instantly
                </p>
                <form action={handleGuestLogin}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-white/30 hover:bg-white/55 border border-white/50 text-slate-755 font-extrabold py-3 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-sm backdrop-blur-sm"
                  >
                    Continue as Guest
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
