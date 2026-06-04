import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsClient from "@/components/analytics-client";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
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

  let userDetails: { name: string | null; email: string } = {
    name: "Guest User",
    email: "guest@focusflow.local",
  };

  // If authenticated, load tasks from DB
  if (session && session.user && session.user.id) {
    userDetails = {
      name: session.user.name || null,
      email: session.user.email || "",
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

  // Load global aggregates
  let completedTasksCount = 0;
  let totalSpentMinutes = 0;
  let userCount = 0;

  try {
    completedTasksCount = await prisma.task.count({
      where: { isCompleted: true },
    });

    const totalTimeAgg = await prisma.task.aggregate({
      where: { isCompleted: true },
      _sum: { spentTime: true },
    });

    totalSpentMinutes = totalTimeAgg._sum.spentTime || 0;
    userCount = await prisma.user.count();
  } catch (error) {
    console.warn("Database connection failed during build or request:", error);
  }

  return (
    <AnalyticsClient
      user={userDetails}
      initialTasks={formattedTasks}
      isGuest={isGuest}
      metrics={{
        completedTasksCount,
        totalSpentMinutes,
        userCount,
      }}
    />
  );
}
