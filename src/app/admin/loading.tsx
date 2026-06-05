import React from "react";
import { DashboardSkeletonLayout, AdminSkeleton } from "@/components/dashboard-skeleton";

export default function AdminLoading() {
  return (
    <DashboardSkeletonLayout>
      <AdminSkeleton />
    </DashboardSkeletonLayout>
  );
}
