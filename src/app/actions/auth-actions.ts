"use server";

import { signIn } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleLogin(formData: FormData) {
  const email = formData.get("email");
  if (email) {
    await signIn("nodemailer", {
      email: email.toString(),
      redirectTo: "/dashboard",
    });
  }
}

export async function handleGuestLogin() {
  const cookieStore = await cookies();
  cookieStore.set("guest-session", "true", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  redirect("/dashboard");
}
