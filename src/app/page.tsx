import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  BookOpen,
  Sparkles,
  Download,
  ArrowRight,
  Check,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-warm-800">
            한권의나
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/how-it-works"
              className="text-warm-700 hover:text-warm-900"
            >
              이용 방법
            </Link>
            <Link href="/login">
              <Button variant="outline">로그인</Button>
            </Link>
            <Link href="/login">
              <Button>시작하기</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold leading-tight text-warm-900 md:text-6xl">
          당신의 이야기를
          <br />
          <span className="text-primary">한 권의 책</span>으로
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-warm-600">
          어린 시절의 추억을 음성으로 녹음하면, AI가 따뜻한 문체의 자서전으로
          만들어드립니다. 소중한 기억을 영원히 간직하세요.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="xl" className="gap-2">
              무료로 시작하기 <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button size="xl" variant="outline">
              자세히 알아보기
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-warm-900">
            어떻게 만들어지나요?
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            <Card className="border-warm-200 bg-warm-50/50">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Mic className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-warm-800">
                  1. 음성 녹음
                </h3>
                <p className="text-warm-600">
                  어린 시절 이야기를 가족에게 말하듯 편하게 녹음해주세요.
                </p>
              </CardContent>
            </Card>
            <Card className="border-warm-200 bg-warm-50/50">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-warm-800">
                  2. AI 분석
                </h3>
                <p className="text-warm-600">
                  AI가 녹음을 분석하여 핵심 이야기와 감정을 추출합니다.
                </p>
              </CardContent>
            </Card>
            <Card className="border-warm-200 bg-warm-50/50">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-warm-800">
                  3. 자서전 작성
                </h3>
                <p className="text-warm-600">
                  따뜻한 문학적 문체로 약 10페이지의 자서전 초안을 생성합니다.
                </p>
              </CardContent>
            </Card>
            <Card className="border-warm-200 bg-warm-50/50">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Download className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-warm-800">
                  4. 다운로드
                </h3>
                <p className="text-warm-600">
                  PDF와 DOCX 형식으로 다운로드하여 인쇄하거나 편집하세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-warm-900">
                왜 한권의나인가요?
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-warm-800">
                      가이드 질문 제공
                    </h4>
                    <p className="text-warm-600">
                      어떤 이야기를 해야 할지 막막하지 않도록 체계적인 질문을
                      제공합니다.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-warm-800">
                      따뜻한 문학적 문체
                    </h4>
                    <p className="text-warm-600">
                      녹음 내용에 충실하면서도 읽기 좋은 회고록 스타일로
                      작성됩니다.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-warm-800">
                      출처 표시 및 편집
                    </h4>
                    <p className="text-warm-600">
                      각 문장의 원본 녹음 위치를 확인하고, 직접 수정할 수
                      있습니다.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-warm-800">
                      안전한 데이터 관리
                    </h4>
                    <p className="text-warm-600">
                      소중한 녹음 파일과 자서전은 안전하게 보관됩니다.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-warm-100 p-8">
              <blockquote className="font-serif text-xl italic text-warm-700">
                &ldquo;엄마의 어린 시절 이야기를 책으로 만들어 드렸더니, 온
                가족이 함께 읽으며 웃고 울었어요. 소중한 선물이 되었습니다.&rdquo;
              </blockquote>
              <p className="mt-4 text-warm-600">- 김○○, 서울</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            지금 바로 당신의 이야기를 시작하세요
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
            처음 2페이지는 무료로 미리보기할 수 있습니다. 마음에 드시면 전체
            자서전을 받아보세요.
          </p>
          <Link href="/login">
            <Button size="xl" variant="secondary" className="gap-2">
              무료로 시작하기 <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-warm-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-2xl font-bold text-warm-800">한권의나</div>
            <div className="flex gap-6 text-warm-600">
              <Link href="/terms" className="hover:text-warm-800">
                이용약관
              </Link>
              <Link href="/privacy" className="hover:text-warm-800">
                개인정보처리방침
              </Link>
              <Link href="/contact" className="hover:text-warm-800">
                문의하기
              </Link>
            </div>
            <p className="text-warm-500">
              &copy; 2024 한권의나. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
