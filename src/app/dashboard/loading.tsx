import React from "react";
import { DashboardSkeletonLayout, DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <DashboardSkeletonLayout>
      <DashboardSkeleton />
    </DashboardSkeletonLayout>
  );
}
