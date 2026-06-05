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

  const userDetails = {
    name: session.user.name || null,
    email: session.user.email || "",
    image: session.user.image || null,
  };

  return (
    <AdminClient
      user={userDetails}
      tasks={[]}
      metrics={{
        totalUsers: 0,
        totalTasks: 0,
        totalCompletedTasks: 0,
        totalSpentMinutes: 0,
      }}
      usersList={[]}
    />
  );
}
