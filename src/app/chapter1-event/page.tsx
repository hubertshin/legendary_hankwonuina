"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioRecorder } from "@/components/recording/audio-recorder";
import { FileUploader } from "@/components/recording/file-uploader";
import { QuestionPanel } from "@/components/recording/question-panel";
import { ConfirmationModal } from "@/components/event/confirmation-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Upload, Trash2, CheckCircle, Loader2, BookOpen, Quote } from "lucide-react";
import { generateSessionId, validateKoreanPhone, cleanPhoneNumber } from "@/lib/event-utils";
import { useToast } from "@/components/ui/use-toast";
import { trackLead } from "@/lib/metaPixel";

interface AudioFile {
  clipIndex: number;
  s3Key: string;
  filename: string;
  duration: number;
  mimeType: string;
  size: number;
  audioUrl?: string;
}

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
  const [sessionId, setSessionId] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recorderKey, setRecorderKey] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const id = generateSessionId();
    setSessionId(id);
  }, []);

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    if (blob.size < 100) return;

    if (audioFiles.length >= 3) {
      toast({ title: "최대 3개까지 녹음 가능합니다", variant: "destructive" });
      return;
    }

    try {
      const clipIndex = Date.now();

      let extension = "m4a";
      if (blob.type.includes("webm")) extension = "webm";
      else if (blob.type.includes("mp4") || blob.type.includes("m4a")) extension = "m4a";
      else if (blob.type.includes("mpeg") || blob.type.includes("mp3")) extension = "mp3";

      const filename = `recording-${clipIndex}.${extension}`;

      const presignResponse = await fetch("/api/event/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, contentType: blob.type, size: blob.size, clipIndex, sessionId }),
      });
      if (!presignResponse.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, s3Key } = await presignResponse.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      if (!uploadResponse.ok) throw new Error("Failed to upload file");

      const confirmResponse = await fetch("/api/event/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key, duration }),
      });
      if (!confirmResponse.ok) throw new Error("Failed to confirm upload");

      const { s3Url } = await confirmResponse.json();

      setAudioFiles((prev) => [
        ...prev,
        { clipIndex, s3Key, filename, duration, mimeType: blob.type, size: blob.size, audioUrl: s3Url },
      ]);
      toast({ title: "녹음이 저장되었습니다" });
    } catch (error) {
      console.error("Recording upload error:", error);
      toast({ title: "녹음 저장 실패", description: "다시 시도해주세요.", variant: "destructive" });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (audioFiles.length >= 3) {
      toast({ title: "최대 3개까지 업로드 가능합니다", variant: "destructive" });
      return;
    }

    try {
      const clipIndex = Date.now();

      const presignResponse = await fetch("/api/event/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size, clipIndex, sessionId }),
      });
      if (!presignResponse.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, s3Key } = await presignResponse.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("Failed to upload file");

      const confirmResponse = await fetch("/api/event/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key, duration: 0 }),
      });
      if (!confirmResponse.ok) throw new Error("Failed to confirm upload");

      const { s3Url } = await confirmResponse.json();

      setAudioFiles((prev) => [
        ...prev,
        { clipIndex, s3Key, filename: file.name, duration: 0, mimeType: file.type, size: file.size, audioUrl: s3Url },
      ]);
      toast({ title: "파일이 업로드되었습니다" });
    } catch (error) {
      console.error("File upload error:", error);
      toast({ title: "파일 업로드 실패", description: "다시 시도해주세요.", variant: "destructive" });
    }
  };

  const handleDeleteAudio = (clipIndex: number) => {
    setAudioFiles((prev) => prev.filter((f) => f.clipIndex !== clipIndex));
    toast({ title: "삭제되었습니다" });
  };

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
    if (!birthDate) {
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
    if (audioFiles.length === 0) {
      toast({ title: "최소 1개 이상의 음성 파일을 녹음해주세요", variant: "destructive" });
      return;
    }

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
          audioFiles,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit");

      trackLead();
      setShowConfirmation(true);
      setName("");
      setBirthDate("");
      setPhone("");
      setAudioFiles([]);
      setRecorderKey((prev) => prev + 1);
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
              "아래의 인터뷰 질문지를 살펴보면서 어린 시절 이야기를 음성 녹음하기",
              "녹음 파일을 성공적으로 제출하기",
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
            <span style={{ color: "#C9A84C" }}>1.</span>{" "}
            <span style={{ color: "#1C1C1E" }}>신청자 정보 입력</span>
          </h2>
          <div
            className="rounded-3xl p-6 shadow-lg"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(28,28,30,0.04) 100%)",
              backgroundColor: "#fff",
            }}
          >
            <div className="space-y-6">
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
                <Label htmlFor="birthDate">생년월일 *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-1.5"
                  lang="ko-KR"
                />
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
            </div>
          </div>
        </section>

        {/* ── FORM: 2. 녹음 가이드 ── */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            <span style={{ color: "#C9A84C" }}>2.</span>{" "}
            <span style={{ color: "#1C1C1E" }}>녹음 가이드</span>
          </h2>
          <div
            className="rounded-3xl p-6 shadow-lg"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(28,28,30,0.04) 100%)",
              backgroundColor: "#fff",
            }}
          >
            <p className="font-semibold mb-4" style={{ color: "#1C1C1E" }}>
              본인의 어린 시절 이야기를 가족에게 말해주듯 편안하게 녹음해주세요
            </p>

            <div className="mb-4">
              <Label className="mb-2 block font-semibold" style={{ color: "#1C1C1E" }}>
                예시 음성 듣기
              </Label>
              <div className="p-3 bg-white rounded-lg border">
                <audio controls controlsList="nodownload noplaybackrate" className="w-full">
                  <source src="/audio/example.m4a" type="audio/mp4" />
                  브라우저가 오디오 재생을 지원하지 않습니다.
                </audio>
              </div>
            </div>

            <div className="space-y-2 text-sm" style={{ color: "#555" }}>
              <p>• 한 파일당 3~10분 정도로 녹음해주세요.</p>
              <p>• 조용한 공간에서 녹음해주세요.</p>
              <p>• 말이 정리되지 않아도 괜찮습니다. 편안하게 대화하듯 녹음해주세요.</p>
            </div>
          </div>
        </section>

        {/* ── FORM: 3. 음성 녹음 ── */}
        <section className="mb-12 overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            <span style={{ color: "#C9A84C" }}>3.</span>{" "}
            <span style={{ color: "#1C1C1E" }}>음성 녹음하기 (최대 3개)</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6 w-full overflow-hidden">
            <div className="space-y-6 w-full min-w-0 overflow-hidden">
              <div
                className="w-full overflow-hidden rounded-3xl p-6 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(28,28,30,0.04) 100%)",
                  backgroundColor: "#fff",
                }}
              >
                <Tabs defaultValue="record" className="w-full overflow-hidden">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="record">
                      <Mic className="h-4 w-4 mr-2" />
                      녹음하기
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="h-4 w-4 mr-2" />
                      파일 업로드
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="record" className="mt-4 overflow-hidden">
                    <p className="text-sm mb-4" style={{ color: "#555" }}>
                      이 버튼을 눌러 음성 녹음을 시작하세요.
                    </p>
                    <AudioRecorder
                      key={recorderKey}
                      onRecordingComplete={handleRecordingComplete}
                      maxDuration={600}
                      disabled={audioFiles.length >= 3}
                    />
                  </TabsContent>

                  <TabsContent value="upload" className="mt-4 overflow-hidden">
                    <FileUploader
                      onFileSelect={handleFileUpload}
                      disabled={audioFiles.length >= 3}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {audioFiles.length > 0 && (
                <div
                  className="rounded-3xl p-6 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(28,28,30,0.04) 100%)",
                    backgroundColor: "#fff",
                  }}
                >
                  <h3 className="font-semibold mb-4" style={{ color: "#1C1C1E" }}>
                    녹음된 파일 ({audioFiles.length}/3)
                  </h3>
                  <div className="space-y-3">
                    {audioFiles.map((file) => (
                      <div key={file.clipIndex} className="p-3 bg-white/50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: "#C9A84C" }} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate" style={{ color: "#1C1C1E" }}>
                                {file.filename}
                              </p>
                              {file.duration > 0 && (
                                <p className="text-xs" style={{ color: "#999" }}>
                                  {Math.floor(file.duration / 60)}:
                                  {String(Math.floor(file.duration % 60)).padStart(2, "0")}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAudio(file.clipIndex)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                        {file.audioUrl && (
                          <audio src={file.audioUrl} controls className="w-full h-10" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <QuestionPanel sessionId={sessionId} />
          </div>
        </section>

        {/* ── CTA (mid-page) ── */}
        <section className="text-center mb-12">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-white text-lg px-10 py-5 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            style={{ background: "linear-gradient(135deg, #C9A84C, #b8923e)", border: "none" }}
          >
            <span className="flex items-center justify-center">
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              어린 시절 이야기 제출하기
            </span>
          </Button>
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

        {/* ── SUBMIT ── */}
        <section className="text-center pb-4">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-white text-lg px-10 py-5 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #b8923e)",
              border: "none",
            }}
          >
            <span className="flex items-center justify-center">
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              어린 시절 이야기 제출하기
            </span>
          </Button>
        </section>
      </div>

      <Footer />

      <ConfirmationModal open={showConfirmation} onOpenChange={setShowConfirmation} />
    </div>
  );
}
