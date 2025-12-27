"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, ArrowRight } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "나의 자서전" }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      const project = await res.json();
      router.push(`/project/${project.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("프로젝트 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-warm-900">새 자서전 시작하기</h1>
        <p className="mt-2 text-warm-600">
          소중한 이야기를 담을 자서전의 제목을 정해주세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>자서전 정보</CardTitle>
          <CardDescription>
            나중에 변경할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">자서전 제목</Label>
              <Input
                id="title"
                placeholder="예: 나의 어린 시절 이야기"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                비워두시면 &quot;나의 자서전&quot;으로 설정됩니다
              </p>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  자서전 만들기
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
