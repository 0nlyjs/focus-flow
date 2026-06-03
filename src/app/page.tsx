"use client";

import { useState } from "react";
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
  MessageCircle,
  HelpCircle,
  Volume2
} from "lucide-react";
import { handleLogin, handleGuestLogin } from "@/app/actions/auth-actions";

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans selection:bg-[#f2a893] selection:text-white relative">
      {/* Header / Navbar */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-slate-850 hover:opacity-90 transition-opacity">
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
              className="text-sm font-extrabold text-slate-500 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Login
            </button>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#4f64a2] hover:bg-[#3d4f85] text-white font-extrabold px-5 py-2 rounded-full text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8edfc] text-[#4f64a2] text-[10px] font-black tracking-wider uppercase w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            Your daily focus
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
            Define Your <br />
            <span className="text-[#e07f67]">Focus</span>
          </h1>

          <p className="text-slate-550 text-base md:text-lg leading-relaxed max-w-lg font-bold">
            Step away from the hustle. FocusFlow helps you cultivate a serene state of productivity through gentle reminders and organic time management.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#4f64a2] hover:bg-[#3d4f85] text-white font-extrabold px-8 py-3.5 rounded-full text-sm shadow-md hover:shadow-lg transition-all"
            >
              Start Focusing
            </button>
            <a
              href="#features"
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold px-6 py-3.5 rounded-full text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-700 text-slate-700" />
              See How It Works
            </a>
          </div>

          <p className="font-caveat text-3xl text-[#e07f67] mt-3 select-none">
            "You can do it, beautiful"
          </p>
        </div>

        {/* Right Column */}
        <div className="flex justify-center items-center">
          <div className="bg-[#fff8f6] p-6 rounded-[2.5rem] border border-[#fceee9] shadow-[0_12px_45px_rgb(224,127,103,0.06)] aspect-square w-full max-w-sm flex flex-col justify-between items-center relative overflow-hidden group">
            <div className="w-full flex-1 flex justify-center items-center">
              <Image
                src="/hero_girl.png"
                alt="Define your focus illustration"
                width={300}
                height={300}
                className="object-contain transform group-hover:scale-103 transition-transform duration-500 rounded-2xl"
                priority
              />
            </div>
            <span className="text-[10px] tracking-[0.25em] font-extrabold text-[#e07f67]/80 uppercase mt-4">
              FocusFlow
            </span>
          </div>
        </div>
      </section>

      {/* "Why FocusFlow?" Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 border-t border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">Why FocusFlow?</h2>
          <p className="text-slate-500 font-bold text-sm mt-3 max-w-xl mx-auto">
            Features that help you stay aligned and productive without the pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-md transition-shadow flex flex-col items-start gap-4 text-left">
            <div className="p-3 w-fit rounded-full bg-blue-50 text-[#4f64a2] border border-blue-100">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Serene Focus</h3>
            <p className="text-xs text-slate-550 leading-relaxed font-bold">
              Set gentle timers and minimize visual clutter so you can focus on what truly matters to you.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-md transition-shadow flex flex-col items-start gap-4 text-left">
            <div className="p-3 w-fit rounded-full bg-orange-50 text-[#e07f67] border border-orange-100">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Gentle Tracking</h3>
            <p className="text-xs text-slate-550 leading-relaxed font-bold">
              Watch your focus daily bloom. Our minimalist tracker keeps you continuing your growth.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-md transition-shadow flex flex-col items-start gap-4 text-left">
            <div className="p-3 w-fit rounded-full bg-purple-50 text-purple-600 border border-purple-100">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Mind Space</h3>
            <p className="text-xs text-slate-550 leading-relaxed font-bold">
              Reflect on your day, log your victory, and clear out thoughts that clutter your mindscape.
            </p>
          </div>
        </div>
      </section>

      {/* "Enter the Zone" Section */}
      <section id="methodology" className="bg-slate-50/50 py-20 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column (Image) */}
          <div className="flex justify-center items-center order-2 lg:order-1">
            <div className="bg-[#eef2ff] p-8 rounded-[2.5rem] border border-blue-100 shadow-[0_12px_45px_rgb(79,100,162,0.04)] aspect-square w-full max-w-sm flex flex-col justify-between items-center relative overflow-hidden group">
              <div className="w-full flex-1 flex justify-center items-center">
                <Image
                  src="/cat_playing.png"
                  alt="Cute cat playing with yarn illustration"
                  width={240}
                  height={240}
                  className="object-contain transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="font-caveat text-3xl text-[#e07f67] mt-4 select-none">
                Play with the kittens
              </p>
            </div>
          </div>

          {/* Right Column (Text) */}
          <div className="flex flex-col gap-5 text-left order-1 lg:order-2">
            <h2 className="text-4xl font-black text-slate-900 leading-tight">
              Enter the <span className="text-[#4f64a2]">Zone</span>
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed font-bold">
              Focus flows naturally when you're in the right environment. Our minimalist workspace keeps distractions out so you can focus on the work that matters most.
            </p>

            <ul className="space-y-4 mt-3">
              <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Check className="w-4 h-4" />
                </div>
                Minimal background music controls
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
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
            <h2 className="text-4xl font-black text-slate-900 leading-tight">
              Log Your <span className="text-[#e07f67]">Wins</span>
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed font-bold">
              Celebrate tiny victories. FocusFlow records completed tasks to keep you motivated and secure a record of productivity.
            </p>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#e07f67] hover:bg-[#d6725b] text-white font-extrabold px-8 py-3.5 rounded-full text-sm shadow-md hover:shadow-lg transition-all w-fit mt-3"
            >
              Log your first win
            </button>
          </div>

          {/* Right Column (Image) */}
          <div className="flex justify-center items-center">
            <div className="bg-[#fffbfb] p-8 rounded-[2.5rem] border border-[#fceee9] shadow-[0_12px_45px_rgb(224,127,103,0.04)] aspect-square w-full max-w-sm flex flex-col justify-center items-center relative overflow-hidden group">
              <Image
                src="/sitting_cat.png"
                alt="Cozy cat with steam"
                width={260}
                height={260}
                className="object-contain transform group-hover:scale-103 transition-transform duration-500 rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-slate-50/50 py-20 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">What Our Users Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Review 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.015)] text-left flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 text-amber-400">
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
                <div className="w-9 h-9 rounded-full bg-orange-100 text-[#e07f67] font-black text-xs flex items-center justify-center border border-orange-200">
                  EJ
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Emma J.</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Freelance Designer</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.015)] text-left flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 text-amber-400">
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
                <div className="w-9 h-9 rounded-full bg-blue-100 text-[#4f64a2] font-black text-xs flex items-center justify-center border border-blue-200">
                  OS
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Olive S.</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Software Engineer</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.015)] text-left flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 text-amber-400">
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
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 font-black text-xs flex items-center justify-center border border-purple-200">
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
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg flex flex-col justify-between text-left relative overflow-hidden group">
            <div>
              <span className="text-[10px] tracking-[0.2em] font-extrabold text-slate-400 uppercase">
                Free Option
              </span>
              <h3 className="text-2xl font-black text-slate-800 mt-2">Free / Guest</h3>
              
              <div className="mt-4 flex items-baseline gap-1 text-slate-800">
                <span className="text-4xl font-black">$0</span>
                <span className="text-xs font-bold text-slate-400">/ forever</span>
              </div>

              <ul className="space-y-3.5 mt-8 border-t border-slate-50 pt-6">
                <li className="flex items-center gap-3 text-slate-600 font-bold text-xs">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  Local browser storage
                </li>
                <li className="flex items-center gap-3 text-slate-600 font-bold text-xs">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  Interactive task manager
                </li>
                <li className="flex items-center gap-3 text-slate-600 font-bold text-xs">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  Basic lo-fi beats
                </li>
              </ul>
            </div>

            <form action={handleGuestLogin} className="mt-8">
              <button
                type="submit"
                className="w-full text-center border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-sm"
              >
                Get Started
              </button>
            </form>
          </div>

          {/* Pro Tier */}
          <div className="bg-white p-8 rounded-[2rem] border border-[#fceee9] shadow-lg flex flex-col justify-between text-left relative overflow-hidden group">
            <div className="absolute top-4 right-4 bg-[#e07f67]/10 text-[#e07f67] text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Popular
            </div>

            <div>
              <span className="text-[10px] tracking-[0.2em] font-extrabold text-[#e07f67] uppercase">
                Fully Loaded
              </span>
              <h3 className="text-2xl font-black text-slate-800 mt-2">Pro Plan</h3>

              <div className="mt-4 flex items-baseline gap-1 text-slate-850">
                <span className="text-4xl font-black">$9</span>
                <span className="text-xs font-bold text-[#e07f67]/60">/ month</span>
              </div>

              <ul className="space-y-3.5 mt-8 border-t border-slate-50 pt-6">
                <li className="flex items-center gap-3 text-slate-650 font-bold text-xs">
                  <Check className="w-4 h-4 text-[#e07f67] shrink-0" />
                  Cloud sync & backup
                </li>
                <li className="flex items-center gap-3 text-slate-650 font-bold text-xs">
                  <Check className="w-4 h-4 text-[#e07f67] shrink-0" />
                  All dynamic features
                </li>
                <li className="flex items-center gap-3 text-slate-650 font-bold text-xs">
                  <Check className="w-4 h-4 text-[#e07f67] shrink-0" />
                  Advanced stats & history
                </li>
                <li className="flex items-center gap-3 text-slate-650 font-bold text-xs">
                  <Check className="w-4 h-4 text-[#e07f67] shrink-0" />
                  Custom sync & offline mode
                </li>
              </ul>
            </div>

            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full text-center bg-[#e07f67] hover:bg-[#d6725b] text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider mt-8 shadow-md hover:shadow-lg"
            >
              Join Pro
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="bg-[#4f64a2] rounded-[2.5rem] p-10 md:p-16 text-center text-white shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <h2 className="text-3xl md:text-5xl font-black tracking-tight relative z-10">
            Ready to find your flow?
          </h2>
          <p className="text-white/80 font-bold text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed relative z-10">
            Join 50,000+ users who focus more and stress less. Start your 14-day free trial today.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 mt-8 relative z-10">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-white hover:bg-slate-50 text-[#4f64a2] font-black px-8 py-3.5 rounded-full text-sm shadow-md transition-all"
            >
              Start focusing now
            </button>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#5f74b3] hover:bg-[#5266a1] text-white font-extrabold px-6 py-3.5 rounded-full text-sm transition-all border border-[#7a8ec5] shadow-sm"
            >
              Talk to an Expert
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-16 text-slate-600 text-left">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-black text-slate-800">FocusFlow</h3>
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
        <div className="mx-auto max-w-7xl px-6 border-t border-slate-100 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-400 font-bold">
            © {new Date().getFullYear()} FocusFlow. Productivity Study Corner.
          </p>
          <p className="font-caveat text-2xl text-[#e07f67] select-none">
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
              <div className="p-3.5 rounded-2xl bg-orange-50 text-[#e07f67] border border-orange-100">
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
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f2a893]/30 focus:border-[#f2a893] transition-all text-sm font-bold shadow-sm"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#4f64a2] hover:bg-[#3d4f85] text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-md disabled:opacity-75"
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
                    className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-750 font-extrabold py-3 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-sm"
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
