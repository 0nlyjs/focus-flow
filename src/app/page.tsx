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
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background soft glow effects */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-violet-200/40 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl shadow-md shadow-indigo-500/20">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            FocusFlow
          </span>
        </div>
        <div className="text-xs text-indigo-600 font-semibold px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/50 backdrop-blur-md">
          v1.0.0
        </div>
      </header>

      {/* Hero section */}
      <main className="container mx-auto px-6 py-8 md:py-16 flex flex-col items-center justify-center flex-1 z-10">
        <div className="max-w-4xl text-center flex flex-col items-center gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-250 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Productivity Reimagined
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
            Master Your Time with{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-650 to-pink-600 bg-clip-text text-transparent">
              FocusFlow
            </span>
          </h1>

          <p className="max-w-xl text-base sm:text-lg text-slate-600 font-medium">
            A free, simple tool to log your work and build better habits. Streamline your tasks and visual workflows.
          </p>

          {/* Side-by-side Auth & Guest Entry */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Guest Entry Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between text-left">
              <div>
                <div className="p-2.5 w-fit rounded-xl bg-violet-100 text-violet-600 mb-4">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Instant Guest Sandbox</h2>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Try all features immediately without logging in. Your tasks will be stored locally in your browser.
                </p>
              </div>

              <form action={handleGuestLogin}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-750 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all group"
                >
                  Continue as Guest
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </div>

            {/* Email Sign In Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-left">
              <div className="p-2.5 w-fit rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Magic Link Login</h2>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                Save your tasks in our database securely and access them across all of your devices.
              </p>

              <form action={handleLogin} className="space-y-3">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm font-semibold"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-all text-sm"
                >
                  Email Magic Link
                </button>
              </form>
            </div>
          </div>

          {/* Core features highlight */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl text-left border-t border-slate-200 pt-12">
            <div className="flex flex-col gap-2">
              <div className="p-2 w-fit rounded-lg bg-indigo-500/10 text-indigo-600">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Dual-Mode Timer</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Toggle between strict countdown focus block and stopwatch count up.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-2 w-fit rounded-lg bg-violet-500/10 text-violet-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Offline Storage</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Supports guest storage via local browser syncing.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-2 w-fit rounded-lg bg-pink-500/10 text-pink-600">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Global Stats</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Track aggregates and minutes logged across all global users.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 z-10 bg-slate-50/50">
        <p>© {new Date().getFullYear()} FocusFlow. Built with Next.js App Router and Prisma.</p>
      </footer>
    </div>
  );
}
