"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateTaskSchema = z.object({
  title: z.string().min(1, "Task description cannot be empty"),
  allocatedTime: z.number().int().min(1, "Allocated time must be at least 1 minute"),
});

export async function createTask(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "You must be logged in to create a task" };
  }

  const title = formData.get("title") as string;
  const allocatedTimeStr = formData.get("allocatedTime") as string;
  const allocatedTime = parseInt(allocatedTimeStr, 10);

  const result = CreateTaskSchema.safeParse({ title, allocatedTime });

  if (!result.success) {
    return {
      error: result.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  try {
    const task = await prisma.task.create({
      data: {
        title: result.data.title,
        allocatedTime: result.data.allocatedTime,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      task: {
        id: task.id,
        title: task.title,
        allocatedTime: task.allocatedTime,
        spentTime: task.spentTime,
        isCompleted: task.isCompleted,
        createdAt: task.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return { error: "Failed to create task" };
  }
}

export async function logTaskInterval(
  parentId: string,
  title: string,
  spentTime: number,
  allocatedTime: number
) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "You must be logged in to log task progress" };
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        allocatedTime,
        spentTime,
        isCompleted: true,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      task: {
        id: task.id,
        title: task.title,
        allocatedTime: task.allocatedTime,
        spentTime: task.spentTime,
        isCompleted: task.isCompleted,
        createdAt: task.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error logging task interval:", error);
    return { error: "Failed to log task interval" };
  }
}

export async function syncGuestTasks(
  guestTasks: {
    id: string;
    title: string;
    allocatedTime: number;
    spentTime: number;
    isCompleted: boolean;
    createdAt: string;
  }[]
) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "You must be logged in to sync tasks" };
  }

  const userId = session.user.id as string;

  try {
    const createdTasks = await prisma.$transaction(
      guestTasks.map((t) =>
        prisma.task.create({
          data: {
            id: t.id,
            title: t.title,
            allocatedTime: t.allocatedTime,
            spentTime: t.spentTime,
            isCompleted: t.isCompleted,
            userId: userId,
            createdAt: new Date(t.createdAt),
          },
        })
      )
    );

    revalidatePath("/dashboard");
    revalidatePath("/analytics");
    revalidatePath("/reminders");
    return {
      success: true,
      tasks: createdTasks.map((t) => ({
        id: t.id,
        title: t.title,
        allocatedTime: t.allocatedTime,
        spentTime: t.spentTime,
        isCompleted: t.isCompleted,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error syncing guest tasks:", error);
    return { error: "Failed to sync guest tasks" };
  }
}

