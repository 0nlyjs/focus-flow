import React from "react";
import { DashboardSkeletonLayout, RemindersSkeleton } from "@/components/dashboard-skeleton";

export default function Loading() {
  return (
    <DashboardSkeletonLayout>
      <RemindersSkeleton />
    </DashboardSkeletonLayout>
  );
}
