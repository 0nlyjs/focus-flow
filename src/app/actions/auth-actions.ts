"use server";

import { signIn } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

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
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  redirect("/dashboard");
}

export async function signUpAction(name: string, email: string, password: string) {
  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "A user with this email address already exists" };
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: "An unexpected error occurred during signup." };
  }
}

export async function updateNameAction(newName: string) {
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "You must be logged in to update your profile" };
  }

  const cleanName = newName.trim();
  if (!cleanName) {
    return { error: "Name cannot be empty" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: cleanName },
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating name:", error);
    return { error: "Failed to update name" };
  }
}

export async function deleteAccountAction() {
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "You must be logged in to delete your account" };
  }

  try {
    await prisma.user.delete({
      where: { id: session.user.id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { error: "Failed to delete account" };
  }
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("guest-session");

  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/" });
}

