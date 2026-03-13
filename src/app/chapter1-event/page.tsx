"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationModal } from "@/components/event/confirmation-modal";
import { SubmitReviewModal } from "@/components/event/submit-review-modal";
import { Loader2, BookOpen, Quote, NotebookPen } from "lucide-react";
import { generateSessionId, validateKoreanPhone, cleanPhoneNumber } from "@/lib/event-utils";
import { useToast } from "@/components/ui/use-toast";
import { trackLead } from "@/lib/metaPixel";

const REVIEWS = [
  {
    text: "별 기대없이 인터뷰 질문지를 보며 생각나는대로 이야기하고 녹음파일을 제출했습니다. 그런데 왠걸.. 제 자서전이라며 전달받은 제1장을 읽어보는데 마치 내가 문학 책의 주인공이 된 것 같았어요.",
    author: "김**",
    role: "5명의 손주를 둔 할머니",
  },
  {
    text: "어린 시절에 대한 기억이 별로 없는 줄 알았는데 막상 녹음하다보니 이야기가 줄줄줄 나왔어요. 잊어질 뻔했던 제 기억을 이렇게 기록할 수 있다니 감동이에요. 이후 이야기를 아예 책으로 만든 것도 대만족입니다.",
    author: "박**",
    role: "은퇴한 교사",
  },
  {
    text: "내 자서전이 이렇게 한 편의 문학책처럼 작성될 수 있다니 그저 놀랍습니다. 보잘 것 없던 이야기라고 생각했는데 이리도 보물처럼 반짝이게 만들어주다니 너무 감동이고 고마워요.",
    author: "이**",
    role: "은퇴 후 인생2막 준비",
  },
];

export default function EventLandingPage() {
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [phone, setPhone] = useState("");

  // Generate year options (1920 ~ current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();



  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/[^\d]/g, "").slice(0, 11);
    let formatted = numbers;
    if (numbers.length > 3) {
      formatted =
        numbers.length <= 7
          ? `${numbers.slice(0, 3)}-${numbers.slice(3)}`
          : `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
    setPhone(formatted);
  };

  const handleOpenReview = () => {
    if (!name.trim()) {
      toast({ title: "이름을 입력해주세요", variant: "destructive" });
      return;
    }
    if (!birthYear || !birthMonth || !birthDay) {
      toast({ title: "생년월일을 입력해주세요", variant: "destructive" });
      return;
    }
    if (!validateKoreanPhone(phone)) {
      toast({
        title: "올바른 휴대폰 번호를 입력해주세요",
        description: "010-1234-5678 형식으로 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    setShowReview(true);
  };

  const handleSubmit = async () => {
    // Format birthDate as YYYY-MM-DD
    const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/event/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          birthDate,
          phone: cleanPhoneNumber(phone),
          subjectType: "본인",
          audioFiles: [],
        }),
      });
      if (!response.ok) throw new Error("Failed to submit");

      trackLead();
      setShowReview(false);
      setShowConfirmation(true);
      setName("");
      setBirthYear("");
      setBirthMonth("");
      setBirthDay("");
      setPhone("");
    } catch (error) {
      console.error("Submit error:", error);
      toast({ title: "제출 실패", description: "다시 시도해주세요.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#F8F5EF" }}>
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-4xl">

        {/* ── HERO SECTION ── */}
        <section className="text-center mb-16">
          <div
            className="inline-block text-xl font-bold px-8 py-3 rounded-full mb-6 tracking-wide"
            style={{ backgroundColor: "#C9A84C", color: "#fff" }}
          >
            선착순 무료 · 부담 없이 경험해보세요
          </div>

          <h1
            className="text-3xl lg:text-5xl font-bold mb-5 leading-snug"
            style={{ fontFamily: "var(--font-noto-serif)", color: "#1C1C1E" }}
          >
            내 인생 이야기,<br />
            한 권의 책으로 남기고 싶으셨죠?
          </h1>

          <p className="text-lg lg:text-xl mb-10 leading-relaxed" style={{ color: "#555" }}>
            20분만 이야기해 주시면,<br />
            자서전 제1장을 <strong style={{ color: "#C9A84C" }}>무료</strong>로 완성해드립니다
          </p>
        </section>

        {/* ── FORM: 1. 신청자 정보 ── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <NotebookPen className="w-7 h-7 flex-shrink-0" style={{ color: "#C9A84C" }} />
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "#1C1C1E", fontFamily: "var(--font-noto-serif)" }}>
              무료 자서전 신청 정보 입력
            </h2>
          </div>
          <div
            className="rounded-3xl p-8 shadow-lg"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(28,28,30,0.04) 100%)",
              backgroundColor: "#fff",
            }}
          >
            <div className="space-y-8 max-w-sm mx-auto">
              {/* 성함 */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xl font-bold mb-2"
                  style={{ color: "#1C1C1E" }}
                >
                  성함 <span style={{ color: "#C9A84C" }}>*</span>
                </label>
                <p className="text-base mb-2" style={{ color: "#888" }}>
                  예) 홍길동
                </p>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="h-16 text-xl px-4 rounded-xl border-2"
                  style={{ fontSize: "1.25rem" }}
                />
              </div>

              {/* 생년월일 */}
              <div>
                <p className="text-xl font-bold mb-2" style={{ color: "#1C1C1E" }}>
                  태어나신 년도 / 월 / 일 <span style={{ color: "#C9A84C" }}>*</span>
                </p>
                <p className="text-base mb-3" style={{ color: "#888" }}>
                  예) 1950 년 &nbsp; 3 월 &nbsp; 15 일
                </p>
                <div className="flex items-center">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={birthYear}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                        setBirthYear(v);
                      }}
                      placeholder="1950"
                      className="h-16 rounded-xl border-2 border-input bg-background px-3 text-center font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                      style={{ fontSize: "1.25rem", width: "6.5rem" }}
                    />
                    <span className="text-xl font-bold flex-shrink-0" style={{ color: "#555" }}>년</span>
                  </div>
                  <div className="w-5 flex-shrink-0" />
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={birthMonth}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, "").slice(0, 2);
                        if (v === "" || (Number(v) >= 1 && Number(v) <= 12)) setBirthMonth(v);
                      }}
                      placeholder="3"
                      className="h-16 rounded-xl border-2 border-input bg-background px-3 text-center font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                      style={{ fontSize: "1.25rem", width: "4rem" }}
                    />
                    <span className="text-xl font-bold flex-shrink-0" style={{ color: "#555" }}>월</span>
                  </div>
                  <div className="w-5 flex-shrink-0" />
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={birthDay}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, "").slice(0, 2);
                        if (v === "" || (Number(v) >= 1 && Number(v) <= 31)) setBirthDay(v);
                      }}
                      placeholder="15"
                      className="h-16 rounded-xl border-2 border-input bg-background px-3 text-center font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                      style={{ fontSize: "1.25rem", width: "4rem" }}
                    />
                    <span className="text-xl font-bold flex-shrink-0" style={{ color: "#555" }}>일</span>
                  </div>
                </div>
              </div>

              {/* 전화번호 */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xl font-bold mb-2"
                  style={{ color: "#1C1C1E" }}
                >
                  전화번호 <span style={{ color: "#C9A84C" }}>*</span>
                </label>
                <p className="text-base mb-2" style={{ color: "#888" }}>
                  숫자만 입력하시면 자동으로 정리됩니다 &nbsp; 예) 010-1234-5678
                </p>
                <Input
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="010-0000-0000"
                  className="h-16 text-xl px-4 rounded-xl border-2"
                  style={{ fontSize: "1.25rem" }}
                  inputMode="numeric"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  size="lg"
                  onClick={handleOpenReview}
                  disabled={isSubmitting}
                  className="w-full text-white font-bold rounded-xl shadow-xl transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #C9A84C, #b8923e)",
                    border: "none",
                    fontSize: "1.375rem",
                    padding: "1.25rem",
                    lineHeight: "1.4",
                  }}
                >
                  <span className="flex items-center justify-center">
                    {isSubmitting && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                    무료 자서전 신청하기
                  </span>
                </Button>
                <p className="text-center text-base mt-3" style={{ color: "#888" }}>
                  입력하신 정보는 자서전 제작에만 사용됩니다
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SAMPLE SECTION ── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6" style={{ color: "#C9A84C" }} />
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ fontFamily: "var(--font-noto-serif)", color: "#1C1C1E" }}
            >
              이런 책이 완성됩니다
            </h2>
          </div>

          {/* Book page card */}
          <div
            className="rounded-2xl shadow-xl overflow-hidden"
            style={{ backgroundColor: "#FDFAF4", border: "1px solid #E8DFC8" }}
          >
            {/* Book spine accent */}
            <div className="flex">
              <div className="w-2 flex-shrink-0" style={{ backgroundColor: "#C9A84C" }} />
              <div className="flex-1 p-8 md:p-12">
                <p
                  className="text-xs font-semibold tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-noto-serif)", color: "#C9A84C" }}
                >
                  제1장 북면 월백리의 봄
                </p>
                <p
                  className="text-2xl md:text-3xl font-bold mb-6"
                  style={{ fontFamily: "var(--font-noto-serif)", color: "#1C1C1E" }}
                >
                  진달래 능선과 숲속 고구마
                </p>

                <div
                  className="space-y-5 text-base md:text-lg leading-loose"
                  style={{ fontFamily: "var(--font-noto-serif)", color: "#2C2C2C" }}
                >
                  <p>
                    초등학교 3학년까지 나는 성산초등학교에 다녔다. 그곳은 지금은 도로가 정비되고 자동차로 쉽게 갈 수 있는 거리지만, 당시에는 산을 두 번이나 넘는 고갯길이었다. 능선 하나를 넘으면 또 다른 산이 기다리고 있었고, 아이의 걸음으로는 그 길이 멀고 험했다. 하지만 봄이면 산은 진달래로 물들었고, 그 꽃을 꺾어 입에 물고 빨아먹으며 걸었던 길은 나에게 세상에서 가장 아름다운 등굣길이었다. 입술이 파래질 때까지 진달래 꽃잎을 빨던 그 시절, 나의 발걸음은 언제나 노래하듯 가벼웠다.
                  </p>
                  <p>
                    겨울엔 고구마가 최고의 간식이었다. 학교 갈 때 집에서 한두 개 챙겨가다, 숲속 내가 정해 둔 비밀 장소에 살짝 묻어 두었다. 하굣길, 그 땅을 조심스레 파내 고구마를 꺼냈다. 씻지도 않은 채, 흙만 털어 껍질째 베어 물었다. 단단하면서도 포슬한 그 맛, 손가락 끝까지 퍼지던 온기. 친구와 마주 앉아 땅바닥에 주저앉아 먹던 그 풍경은, 지금 내 기억 속 가장 따뜻한 한 폭의 그림이다.
                  </p>
                </div>

                <div
                  className="mt-8 pt-6 text-sm"
                  style={{ borderTop: "1px solid #E8DFC8", color: "#999" }}
                >
                  ※ 실제 제작된 자서전 샘플입니다
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY FREE SECTION ── */}
        <section className="mb-16">
          <div
            className="rounded-2xl p-8 md:p-12 text-center"
            style={{ backgroundColor: "#1C1C1E" }}
          >
            <h2
              className="text-2xl md:text-3xl font-bold mb-6"
              style={{ fontFamily: "var(--font-noto-serif)", color: "#C9A84C" }}
            >
              왜 무료인가요?
            </h2>
            <p
              className="text-base md:text-lg leading-loose max-w-2xl mx-auto"
              style={{ color: "#D4C9B0" }}
            >
              직접 내 자서전을 읽어보기 전까지는 믿기 어려울 수 있습니다.<br />
              그래서 어린시절 이야기를 먼저 무료로 완성해드립니다.<br />
              읽어보시고 마음에 든다면, 나머지 인생 이야기를 책으로 완성해 드립니다.
            </p>
          </div>
        </section>

        {/* ── REVIEWS SECTION ── */}
        <section className="mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-8"
            style={{ fontFamily: "var(--font-noto-serif)", color: "#1C1C1E" }}
          >
            먼저 경험하신 분들의 이야기
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {REVIEWS.map((review, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 flex flex-col shadow-sm"
                style={{ backgroundColor: "#fff", border: "1px solid #E8DFC8" }}
              >
                <Quote className="w-6 h-6 mb-4 flex-shrink-0" style={{ color: "#C9A84C" }} />
                <p
                  className="text-sm leading-loose flex-1 mb-5"
                  style={{ color: "#444", fontFamily: "var(--font-noto-serif)" }}
                >
                  {review.text}
                </p>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#1C1C1E" }}>
                    {review.author}
                  </p>
                  <p className="text-xs" style={{ color: "#999" }}>
                    {review.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <Footer />

      <SubmitReviewModal
        open={showReview}
        onOpenChange={setShowReview}
        name={name}
        birthYear={birthYear}
        birthMonth={birthMonth}
        birthDay={birthDay}
        phone={phone}
        isSubmitting={isSubmitting}
        onConfirm={handleSubmit}
      />
      <ConfirmationModal open={showConfirmation} onOpenChange={setShowConfirmation} />
    </div>
  );
}
