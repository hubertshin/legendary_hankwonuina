"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationModal } from "@/components/event/confirmation-modal";
import { Loader2, BookOpen, Quote } from "lucide-react";
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

  const handleSubmit = async () => {
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
            className="inline-block text-sm font-semibold px-5 py-2 rounded-full mb-6 tracking-wide"
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

          {/* Steps */}
          <div className="space-y-4 max-w-2xl mx-auto text-left">
            {[
              "신청자 정보 입력하기",
              "제출하기",
            ].map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl p-5 shadow-sm"
                style={{ backgroundColor: "#fff" }}
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: "#C9A84C" }}
                >
                  {i + 1}
                </div>
                <p style={{ color: "#1C1C1E" }} className="leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
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

        {/* ── FORM: 1. 신청자 정보 ── */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            <span style={{ color: "#1C1C1E" }}>무료 자서전 신청 정보 입력</span>
          </h2>
          <div
            className="rounded-3xl p-6 shadow-lg"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(28,28,30,0.04) 100%)",
              backgroundColor: "#fff",
            }}
          >
            <div className="space-y-6 max-w-sm mx-auto">
              <div>
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>생년월일 *</Label>
                <div className="flex gap-2 mt-1.5">
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">년</option>
                    {years.map((year) => (
                      <option key={year} value={String(year)}>
                        {year}년
                      </option>
                    ))}
                  </select>
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className="w-24 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">월</option>
                    {months.map((month) => (
                      <option key={month} value={String(month)}>
                        {month}월
                      </option>
                    ))}
                  </select>
                  <select
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className="w-24 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">일</option>
                    {days.map((day) => (
                      <option key={day} value={String(day)}>
                        {day}일
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="phone">전화번호 *</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="010-1234-5678"
                  className="mt-1.5"
                  inputMode="numeric"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full text-white text-lg py-5 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #C9A84C, #b8923e)",
                    border: "none",
                  }}
                >
                  <span className="flex items-center justify-center">
                    {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    무료 자서전 신청하기
                  </span>
                </Button>
              </div>
            </div>
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

      <ConfirmationModal open={showConfirmation} onOpenChange={setShowConfirmation} />
    </div>
  );
}
