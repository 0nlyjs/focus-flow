import React from "react";
import { DashboardSkeletonLayout, RemindersSkeleton } from "@/components/dashboard-skeleton";

export default function RemindersLoading() {
  return (
    <DashboardSkeletonLayout>
      <RemindersSkeleton />
    </DashboardSkeletonLayout>
  );
}
