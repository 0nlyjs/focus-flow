import { signIn } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, Clock, ShieldCheck, Sparkles, UserCheck, Zap } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden bg-sky-50/50 text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Background radial soft blue/indigo glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-200/50 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-sky-200/50 blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between z-10">
        <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-900 to-blue-750 bg-clip-text text-transparent">
          Focus Flow
        </span>
        <div className="text-xs text-blue-800 font-bold px-3 py-1 rounded-full border border-blue-200 bg-white/80 backdrop-blur-md shadow-sm">
          v1.0.0
        </div>
      </header>

      {/* Hero section */}
      <main className="container mx-auto px-6 py-8 md:py-16 flex flex-col items-center justify-center flex-1 z-10">
        <div className="max-w-4xl text-center flex flex-col items-center gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-105/60 text-blue-900 text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            Productivity Reimagined
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
            Master Your Time with{" "}
            <span className="bg-gradient-to-r from-blue-700 via-sky-655 to-indigo-700 bg-clip-text text-transparent">
              FocusFlow
            </span>
          </h1>

          <p className="max-w-xl text-base sm:text-lg text-slate-700 font-bold leading-relaxed">
            A free, simple tool to log your work and build better habits. Streamline your tasks and visual workflows.
          </p>

          {/* Side-by-side Auth & Guest Entry (Light Glassmorphic) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Guest Entry Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-white bg-white/70 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-blue-100 transition-all duration-300 flex flex-col justify-between text-left">
              <div>
                <div className="p-2.5 w-fit rounded-xl bg-blue-50 text-blue-600 mb-4 shadow-sm border border-blue-100">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <h2 className="text-xl font-extrabold text-blue-900 mb-2">Instant Guest Sandbox</h2>
                <p className="text-sm text-slate-700 mb-6 leading-relaxed font-medium">
                  Try all features immediately without logging in. Your tasks will be stored locally in your browser.
                </p>
              </div>

              <form action={handleGuestLogin}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all group text-sm uppercase tracking-wider"
                >
                  Continue as Guest
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </div>

            {/* Email Sign In Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-white bg-white/70 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-blue-100 transition-all duration-300 text-left">
              <div className="p-2.5 w-fit rounded-xl bg-sky-50 text-sky-600 mb-4 shadow-sm border border-sky-100">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-blue-900 mb-2">Magic Link Login</h2>
              <p className="text-sm text-slate-700 mb-4 leading-relaxed font-medium">
                Save your tasks in our database securely and access them across all of your devices.
              </p>

              <form action={handleLogin} className="space-y-3">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 bg-white/60 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold shadow-sm"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 border border-blue-200 hover:bg-slate-50 text-slate-700 font-extrabold py-2.5 px-4 rounded-xl transition-all text-sm shadow-sm"
                >
                  Email Magic Link
                </button>
              </form>
            </div>
          </div>

          {/* Core features highlight */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl text-left border-t border-blue-200/50 pt-12">
            <div className="flex flex-col gap-2">
              <div className="p-2 w-fit rounded-lg bg-blue-100/60 text-blue-700 border border-blue-200">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-blue-900">Dual-Mode Timer</h3>
              <p className="text-sm text-slate-750 leading-relaxed font-medium">
                Toggle between strict countdown focus block and stopwatch count up.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-2 w-fit rounded-lg bg-sky-100/60 text-sky-700 border border-sky-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-blue-900">Offline Storage</h3>
              <p className="text-sm text-slate-750 leading-relaxed font-medium">
                Supports guest storage via local browser syncing.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-2 w-fit rounded-lg bg-indigo-100/60 text-indigo-700 border border-indigo-200">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-blue-900">Global Stats</h3>
              <p className="text-sm text-slate-750 leading-relaxed font-medium">
                Track aggregates and minutes logged across all global users.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-200/50 py-6 text-center text-xs text-slate-600 font-semibold z-10 bg-white/20">
        <p>© {new Date().getFullYear()} FocusFlow. Built with Next.js App Router and Prisma.</p>
      </footer>
    </div>
  );
}
