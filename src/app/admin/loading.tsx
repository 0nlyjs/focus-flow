import React from "react";
import { DashboardSkeletonLayout, AdminSkeleton } from "@/components/dashboard-skeleton";

export default function Loading() {
  return (
    <DashboardSkeletonLayout>
      <AdminSkeleton />
    </DashboardSkeletonLayout>
  );
}
