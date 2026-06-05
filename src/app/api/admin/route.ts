import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  // ONLY allow mistjs20@gmail.com to access the admin panel
  if (!session || !session.user || session.user.email !== "mistjs20@gmail.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const totalUsers = await prisma.user.count();
    const totalTasks = await prisma.task.count();
    const totalCompletedTasks = await prisma.task.count({
      where: { isCompleted: true },
    });

    const totalTimeAgg = await prisma.task.aggregate({
      where: { isCompleted: true },
      _sum: { spentTime: true },
    });
    const totalSpentMinutes = totalTimeAgg._sum.spentTime || 0;

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

    const formattedUsers = users.map((u) => {
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

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        totalTasks,
        totalCompletedTasks,
        totalSpentMinutes,
      },
      usersList: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
