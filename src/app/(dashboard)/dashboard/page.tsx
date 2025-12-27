import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusConfig = {
  DRAFT: {
    label: "작성 중",
    icon: FileText,
    color: "text-warm-600",
    bg: "bg-warm-100",
  },
  UPLOADING: {
    label: "업로드 중",
    icon: Loader2,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  PROCESSING: {
    label: "처리 중",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  COMPLETED: {
    label: "완료",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  FAILED: {
    label: "실패",
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-100",
  },
};

export default async function DashboardPage() {
  const session = await auth();

  const projects = await prisma.project.findMany({
    where: {
      userId: session!.user!.id,
    },
    include: {
      audioAssets: true,
      drafts: {
        where: { isActive: true },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">내 프로젝트</h1>
          <p className="text-warm-600">
            나만의 자서전을 만들고 관리하세요
          </p>
        </div>
        <Link href="/project/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            새 자서전 시작
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-warm-800">
              아직 프로젝트가 없습니다
            </h3>
            <p className="mb-6 text-center text-warm-600">
              첫 번째 자서전을 만들어보세요.
              <br />
              음성을 녹음하면 AI가 자서전으로 만들어드립니다.
            </p>
            <Link href="/project/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                새 자서전 시작
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const status = statusConfig[project.status];
            const StatusIcon = status.icon;

            return (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${status.bg} ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                    <CardDescription>
                      {formatDate(project.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-warm-600">
                      <span>녹음 {project.audioAssets.length}개</span>
                      {project.drafts.length > 0 && (
                        <span>
                          {project.drafts[0].pageCount}페이지
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
