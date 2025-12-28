import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  Upload,
  Brain,
  FileText,
  Edit,
  Download,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-warm-800">
            한권의나
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button>시작하기</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-4xl font-bold text-warm-900 md:text-5xl">
          이용 방법
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-warm-600">
          간단한 6단계로 나만의 자서전을 완성하세요.
          <br />
          AI가 당신의 이야기를 따뜻한 책으로 만들어드립니다.
        </p>
      </section>

      {/* Steps */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Step 1 */}
          <Card className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-center justify-center bg-primary/10 p-8 md:w-48">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">1</span>
                  <Mic className="mx-auto mt-2 h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="flex-1 p-6">
                <CardTitle className="mb-3 text-xl">
                  음성 녹음 또는 파일 업로드
                </CardTitle>
                <p className="mb-4 text-warm-600">
                  어린 시절 이야기를 가족에게 말하듯 편하게 녹음해주세요. 최대 3개의
                  녹음 파일을 추가할 수 있으며, 기존 음성 파일(m4a, mp3, wav)을
                  업로드할 수도 있습니다.
                </p>
                <ul className="space-y-2 text-sm text-warm-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    권장 녹음 시간: 각 3~10분
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    조용한 환경에서 녹음하세요
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    완벽한 말투는 필요 없어요
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-center justify-center bg-primary/10 p-8 md:w-48">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">2</span>
                  <Upload className="mx-auto mt-2 h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="flex-1 p-6">
                <CardTitle className="mb-3 text-xl">녹음 제출</CardTitle>
                <p className="text-warm-600">
                  녹음이 완료되면 제출 버튼을 눌러주세요. 녹음 파일은 안전하게
                  서버에 업로드되며, AI 분석이 시작됩니다.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-center justify-center bg-primary/10 p-8 md:w-48">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">3</span>
                  <Brain className="mx-auto mt-2 h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="flex-1 p-6">
                <CardTitle className="mb-3 text-xl">AI 분석 및 작성</CardTitle>
                <p className="mb-4 text-warm-600">
                  AI가 녹음을 텍스트로 변환하고, 핵심 이야기와 인물, 장소, 감정을
                  분석합니다. 그 후 따뜻한 문학적 문체로 자서전 초안을 작성합니다.
                </p>
                <div className="flex items-center gap-2 text-sm text-warm-500">
                  <Clock className="h-4 w-4" />
                  예상 소요 시간: 10~30분
                </div>
              </div>
            </div>
          </Card>

          {/* Step 4 */}
          <Card className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-center justify-center bg-primary/10 p-8 md:w-48">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">4</span>
                  <FileText className="mx-auto mt-2 h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="flex-1 p-6">
                <CardTitle className="mb-3 text-xl">결과 확인</CardTitle>
                <p className="text-warm-600">
                  약 10페이지 분량의 자서전 초안이 완성됩니다. 각 문장에는 원본
                  녹음의 타임스탬프가 표시되어, 어떤 이야기에서 비롯되었는지 확인할
                  수 있습니다. 추론된 내용에는 &ldquo;불확실&rdquo; 표시가 됩니다.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 5 */}
          <Card className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-center justify-center bg-primary/10 p-8 md:w-48">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">5</span>
                  <Edit className="mx-auto mt-2 h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="flex-1 p-6">
                <CardTitle className="mb-3 text-xl">편집 및 수정</CardTitle>
                <p className="text-warm-600">
                  마음에 들지 않는 부분은 직접 수정하거나, 특정 섹션만 다시
                  생성할 수 있습니다. 피드백을 입력하면 AI가 해당 부분만 새로
                  작성해드립니다.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 6 */}
          <Card className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-center justify-center bg-primary/10 p-8 md:w-48">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">6</span>
                  <Download className="mx-auto mt-2 h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="flex-1 p-6">
                <CardTitle className="mb-3 text-xl">다운로드</CardTitle>
                <p className="text-warm-600">
                  완성된 자서전을 PDF 또는 DOCX 파일로 다운로드하세요. 인쇄하여
                  책으로 만들거나, 문서 편집기에서 추가 편집할 수 있습니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-12 text-3xl font-bold text-warm-900">요금 안내</h2>
          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
            <Card className="border-warm-200">
              <CardHeader>
                <CardTitle className="text-xl">무료 미리보기</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-3xl font-bold text-warm-900">무료</p>
                <ul className="space-y-2 text-left text-warm-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    음성 녹음 및 업로드
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    AI 분석 및 자서전 작성
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    처음 2페이지 미리보기
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl">전체 자서전</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-3xl font-bold text-warm-900">
                  ₩29,000
                </p>
                <ul className="space-y-2 text-left text-warm-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    전체 10페이지 열람
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    PDF + DOCX 다운로드
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    섹션별 재생성 기능
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    영구 저장
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-warm-900">
            지금 바로 시작하세요
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-warm-600">
            무료로 녹음하고, 미리보기를 확인해보세요.
          </p>
          <Link href="/login">
            <Button size="xl" className="gap-2">
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
            <p className="text-warm-500">
              &copy; 2024 한권의나. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
