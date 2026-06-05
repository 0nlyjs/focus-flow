import React from "react";
import { DashboardSkeletonLayout, AnalyticsSkeleton } from "@/components/dashboard-skeleton";

export default function Loading() {
  return (
    <DashboardSkeletonLayout>
      <AnalyticsSkeleton />
    </DashboardSkeletonLayout>
  );
}
