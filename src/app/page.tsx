import { signIn } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Clock, ShieldCheck, Sparkles, UserCheck, Play, SkipForward, Music, Zap } from "lucide-react";

export const metadata = {
  title: "FocusFlow - Master Your Time",
  description: "A free, simple tool to log your work and build better habits.",
};

export default function Home() {
  async function handleLogin(formData: FormData) {
    "use server";
    const email = formData.get("email");
    if (email) {
      await signIn("nodemailer", {
        email: email.toString(),
        redirectTo: "/dashboard",
      });
    }
  }

  async function handleGuestLogin() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.set("guest-session", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen bg-[#dce3f8] text-slate-800 font-sans flex flex-col justify-between selection:bg-[#f2a893] selection:text-white">
      {/* Wave decoration on top */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none overflow-hidden opacity-50">
        <svg className="absolute w-full h-full text-white/40" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,96L80,128C160,160,320,224,480,218.7C640,213,800,139,960,112C1120,85,1280,107,1360,117.3L1440,128L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0C0,0,0,0,0,0Z"></path>
        </svg>
      </div>

      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#f2a893] rounded-xl shadow-sm">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800">
            Focus Flow
          </span>
        </div>
        <div className="text-xs text-[#e07f67] font-bold px-3 py-1 rounded-full border border-[#f5c6bb] bg-white/70 backdrop-blur-md shadow-sm">
          v1.0.0
        </div>
      </header>

      {/* Hero section */}
      <main className="container mx-auto px-6 py-4 md:py-10 flex flex-col items-center justify-center flex-1 z-10">
        <div className="max-w-4xl text-center flex flex-col items-center gap-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#e5e9f8] bg-white/80 text-slate-800 text-xs font-bold uppercase tracking-wider mb-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#f2a893]" />
            Your cozy study corner
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.15] text-slate-850">
            Master Your Time with{" "}
            <span className="bg-gradient-to-r from-[#e07f67] via-[#f2a893] to-violet-650 bg-clip-text text-transparent">
              FocusFlow
            </span>
          </h1>

          <p className="max-w-xl text-base text-slate-600 font-bold leading-relaxed">
            A free, simple tool to log your work and build better habits. Streamline your tasks and visual workflows.
          </p>

          {/* Cards Layout */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Guest Sandbox Card (Cute Cat) */}
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between text-left relative overflow-hidden group">
              <div className="flex flex-col items-start">
                <div className="p-2.5 w-fit rounded-xl bg-orange-50 text-[#e07f67] mb-3 shadow-sm border border-orange-100">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <h2 className="text-xl font-black text-slate-800 mb-1">Instant Guest Sandbox</h2>
                <p className="text-xs text-slate-500 mb-4 font-bold leading-relaxed">
                  Try all features immediately without logging in. Your tasks will be stored locally in your browser.
                </p>

                {/* Vector Cat Graphic */}
                <div className="w-full flex justify-center py-2 h-44 items-center">
                  <Image
                    src="/cat_playing.png"
                    alt="Cute brown cat playing with yellow yarn ball"
                    width={170}
                    height={170}
                    className="object-contain transform group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                </div>
              </div>

              {/* Lo-fi mock player at card bottom */}
              <div className="mt-4 p-3 rounded-2xl bg-[#fcf8f6] border border-[#f7eae5] flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-[#f2a893]/20 text-[#e07f67]">
                    <Music className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">Focus Lo-Fi beats</p>
                    <p className="text-[10px] font-bold text-slate-400">Coffee Shop Study</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Play className="w-3.5 h-3.5 text-[#e07f67] fill-current" />
                  <SkipForward className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              <form action={handleGuestLogin}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#e07f67] to-[#f2a893] hover:from-[#d6725b] hover:to-[#e59580] text-white font-extrabold py-3 px-4 rounded-2xl shadow-md transition-all group/btn text-xs uppercase tracking-wider"
                >
                  Continue as Guest
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </form>
            </div>

            {/* Email Sign In Card */}
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between text-left">
              <div>
                <div className="p-2.5 w-fit rounded-xl bg-violet-50 text-violet-600 mb-4 shadow-sm border border-violet-100">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-800 mb-1">Magic Link Login</h2>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed font-bold">
                  Save your tasks in our database securely and access them across all of your devices.
                </p>

                {/* Cozy Encouragement Banner */}
                <div className="my-6 p-4 rounded-2xl border border-dashed border-[#e07f67]/30 bg-[#fffbfa] text-center">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#e07f67]/75">
                    Cozy Motivation
                  </p>
                  <p className="font-caveat text-3xl text-[#e07f67] mt-1.5">
                    You can do it beautiful
                  </p>
                </div>
              </div>

              <form action={handleLogin} className="space-y-3">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f2a893]/30 focus:border-[#f2a893] transition-all text-sm font-bold shadow-sm"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold py-2.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-sm"
                >
                  Email Magic Link
                </button>
              </form>
            </div>
          </div>

          {/* Core features highlight */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl text-left border-t border-[#c6cfed] pt-8">
            <div className="flex flex-col gap-2">
              <div className="p-2 w-fit rounded-lg bg-white shadow-sm border border-slate-100 text-[#e07f67]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-800">Dual-Mode Timer</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-bold">
                Toggle between strict countdown focus block and stopwatch count up.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-2 w-fit rounded-lg bg-white shadow-sm border border-slate-100 text-[#f2a893]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-800">Offline Storage</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-bold">
                Supports guest storage via local browser syncing.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-2 w-fit rounded-lg bg-white shadow-sm border border-slate-100 text-violet-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-800">Global Stats</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-bold">
                Track aggregates and minutes logged across all global users.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#c6cfed] py-6 text-center text-xs text-slate-500 font-semibold z-10 bg-white/10">
        <p>© {new Date().getFullYear()} FocusFlow. Cozy study corner. Built with Next.js.</p>
      </footer>
    </div>
  );
}
