import React from "react";
import { DashboardSkeletonLayout, DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function Loading() {
  return (
    <DashboardSkeletonLayout>
      <DashboardSkeleton />
    </DashboardSkeletonLayout>
  );
}
