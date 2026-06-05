import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "@/components/admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

  // ONLY allow mistjs20@gmail.com to access the admin panel
  if (!session || !session.user || session.user.email !== "mistjs20@gmail.com") {
    redirect("/dashboard");
  }

  // Fetch admin's own tasks for the Sidebar layout
  const adminTasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedTasks = adminTasks.map((task) => ({
    id: task.id,
    title: task.title,
    allocatedTime: task.allocatedTime,
    spentTime: task.spentTime,
    isCompleted: task.isCompleted,
    createdAt: task.createdAt.toISOString(),
  }));

  const userDetails = {
    name: session.user.name || null,
    email: session.user.email || "",
    image: session.user.image || null,
  };

  // Fetch global admin metrics
  let totalUsers = 0;
  let totalTasks = 0;
  let totalCompletedTasks = 0;
  let totalSpentMinutes = 0;
  let formattedUsers: any[] = [];

  try {
    totalUsers = await prisma.user.count();
    totalTasks = await prisma.task.count();
    totalCompletedTasks = await prisma.task.count({
      where: { isCompleted: true },
    });

    const totalTimeAgg = await prisma.task.aggregate({
      where: { isCompleted: true },
      _sum: { spentTime: true },
    });
    totalSpentMinutes = totalTimeAgg._sum.spentTime || 0;

    // Fetch all users with their tasks to compute user-specific analytics
    const users = await prisma.user.findMany({
      include: {
        tasks: {
          select: {
            spentTime: true,
            isCompleted: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    formattedUsers = users.map((u) => {
      const uTasksCount = u.tasks.length;
      const uCompletedCount = u.tasks.filter((t) => t.isCompleted).length;
      const uSpentMinutes = u.tasks.filter((t) => t.isCompleted).reduce((sum, t) => sum + t.spentTime, 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        createdAt: u.createdAt.toISOString(),
        stats: {
          totalTasks: uTasksCount,
          completedTasks: uCompletedCount,
          totalSpentMinutes: uSpentMinutes,
        },
      };
    });
  } catch (error) {
    console.error("Database query failed on admin page:", error);
  }

  return (
    <AdminClient
      user={userDetails}
      tasks={formattedTasks}
      metrics={{
        totalUsers,
        totalTasks,
        totalCompletedTasks,
        totalSpentMinutes,
      }}
      usersList={formattedUsers}
    />
  );
}
