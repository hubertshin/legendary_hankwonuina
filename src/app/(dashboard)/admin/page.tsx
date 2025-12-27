import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Mic,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AdminPage() {
  const session = await auth();

  // Check admin role
  // @ts-expect-error - role is added in session callback
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get statistics
  const [userCount, projectCount, jobStats, recentJobs] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.job.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.job.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: { title: true },
        },
      },
    }),
  ]);

  const statusCounts = jobStats.reduce(
    (acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-900">관리자 대시보드</h1>
        <p className="text-warm-600">시스템 상태 및 작업 모니터링</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 프로젝트</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">처리 중</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts["PROCESSING"] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">실패</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statusCounts["FAILED"] || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>최근 작업</CardTitle>
          <CardDescription>시스템에서 처리된 최근 작업 목록</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      job.status === "COMPLETED"
                        ? "bg-green-100"
                        : job.status === "FAILED"
                          ? "bg-red-100"
                          : job.status === "PROCESSING"
                            ? "bg-yellow-100"
                            : "bg-gray-100"
                    }`}
                  >
                    {job.status === "COMPLETED" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : job.status === "FAILED" ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : job.status === "PROCESSING" ? (
                      <RefreshCw className="h-5 w-5 animate-spin text-yellow-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-warm-900">
                      {job.type} - {job.project.title}
                    </p>
                    <p className="text-sm text-warm-500">
                      {formatDateTime(job.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      job.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : job.status === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : job.status === "PROCESSING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {job.status}
                  </span>
                  {job.progress > 0 && job.progress < 100 && (
                    <span className="text-sm text-warm-600">
                      {job.progress}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
