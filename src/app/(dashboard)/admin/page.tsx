import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();

  // Check admin role
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
        <p className="text-muted-foreground">
          무료 자서전 이벤트 신청자를 관리하세요
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-1 max-w-md mx-auto">
        <Link href="/admin/submissions">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">무료 자서전 신청자 관리</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                이벤트 신청자 목록을 확인하고 관리합니다.
              </p>
              <Button variant="outline" className="w-full">
                신청자 목록 보기 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
