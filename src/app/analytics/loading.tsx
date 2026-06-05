import React from "react";
import { DashboardSkeletonLayout, AnalyticsSkeleton } from "@/components/dashboard-skeleton";

export default function AnalyticsLoading() {
  return (
    <DashboardSkeletonLayout>
      <AnalyticsSkeleton />
    </DashboardSkeletonLayout>
  );
}
