import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RemindersClient from "@/components/reminders-client";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const session = await auth();
  
  // Read cookies to check for guest session
  const cookieStore = await cookies();
  const isGuest = cookieStore.get("guest-session")?.value === "true";

  // Redirect if neither authenticated nor guest
  if (!isGuest && (!session || !session.user || !session.user.id)) {
    redirect("/");
  }

  let formattedTasks: {
    id: string;
    title: string;
    allocatedTime: number;
    spentTime: number;
    isCompleted: boolean;
    createdAt: string;
  }[] = [];

  let userDetails: { name: string | null; email: string; image?: string | null } = {
    name: "Guest User",
    email: "guest@focusflow.local",
    image: null,
  };

  // If authenticated, load tasks from DB
  if (session && session.user && session.user.id) {
    userDetails = {
      name: session.user.name || null,
      email: session.user.email || "",
      image: session.user.image || null,
    };

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    formattedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      allocatedTime: task.allocatedTime,
      spentTime: task.spentTime,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt.toISOString(),
    }));
  }

  return (
    <RemindersClient
      user={userDetails}
      initialTasks={formattedTasks}
      isGuest={isGuest}
    />
  );
}
