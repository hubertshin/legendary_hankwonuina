"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AudioRecorder } from "@/components/recording/audio-recorder";
import { FileUploader } from "@/components/recording/file-uploader";
import { QuestionPanel } from "@/components/recording/question-panel";
import { ConfirmationModal } from "@/components/event/confirmation-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Upload, Play, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { generateSessionId, validateKoreanPhone, cleanPhoneNumber } from "@/lib/event-utils";
import { useToast } from "@/components/ui/use-toast";

interface AudioFile {
  clipIndex: number;
  s3Key: string;
  filename: string;
  duration: number;
  mimeType: string;
  size: number;
  audioUrl?: string;
}

export default function EventLandingPage() {
  const [sessionId, setSessionId] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [subjectType, setSubjectType] = useState("본인");
  const [subjectOther, setSubjectOther] = useState("");
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recorderKey, setRecorderKey] = useState(0);
  const { toast } = useToast();

  // Generate session ID on mount
  useEffect(() => {
    const id = generateSessionId();
    setSessionId(id);
  }, []);

  // Handle audio recording complete
  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    // Only ignore completely empty recordings
    if (blob.size < 100) {
      return;
    }

    if (audioFiles.length >= 3) {
      toast({
        title: "최대 3개까지 녹음 가능합니다",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate unique clipIndex using timestamp
      const clipIndex = Date.now();

      // Determine file extension from blob type
      let extension = 'm4a'; // default for audio/mp4
      if (blob.type.includes('webm')) {
        extension = 'webm';
      } else if (blob.type.includes('mp4') || blob.type.includes('m4a')) {
        extension = 'm4a';
      } else if (blob.type.includes('mpeg') || blob.type.includes('mp3')) {
        extension = 'mp3';
      }

      const filename = `recording-${clipIndex}.${extension}`;

      // Get presigned URL
      const presignResponse = await fetch("/api/event/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          contentType: blob.type,
          size: blob.size,
          clipIndex,
          sessionId,
        }),
      });

      if (!presignResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, s3Key, useLocalUpload } = await presignResponse.json();

      // Upload file (either to S3 or local filesystem)
      let uploadResponse;
      if (useLocalUpload) {
        // Local upload using FormData
        const formData = new FormData();
        formData.append("file", blob, filename);
        formData.append("s3Key", s3Key);

        uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
      } else {
        // S3 upload using PUT
        uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": blob.type },
          body: blob,
        });
      }

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload failed:", uploadResponse.status, errorText);
        throw new Error(`Failed to upload file: ${uploadResponse.status} - ${errorText}`);
      }

      // Confirm upload
      const confirmResponse = await fetch("/api/event/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key, duration }),
      });

      if (!confirmResponse.ok) {
        throw new Error("Failed to confirm upload");
      }

      const { s3Url } = await confirmResponse.json();

      // Add to audio files list
      setAudioFiles((prev) => [
        ...prev,
        {
          clipIndex,
          s3Key,
          filename,
          duration,
          mimeType: blob.type,
          size: blob.size,
          audioUrl: s3Url,
        },
      ]);

      toast({
        title: "녹음이 저장되었습니다",
      });
    } catch (error) {
      console.error("Recording upload error:", error);
      toast({
        title: "녹음 저장 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (audioFiles.length >= 3) {
      toast({
        title: "최대 3개까지 업로드 가능합니다",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate unique clipIndex using timestamp
      const clipIndex = Date.now();

      // Get presigned URL
      const presignResponse = await fetch("/api/event/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          clipIndex,
          sessionId,
        }),
      });

      if (!presignResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, s3Key, useLocalUpload } = await presignResponse.json();

      // Upload file (either to S3 or local filesystem)
      let uploadResponse;
      if (useLocalUpload) {
        // Local upload using FormData
        const formData = new FormData();
        formData.append("file", file, file.name);
        formData.append("s3Key", s3Key);

        uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
      } else {
        // S3 upload using PUT
        uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
      }

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload failed:", uploadResponse.status, errorText);
        throw new Error(`Failed to upload file: ${uploadResponse.status} - ${errorText}`);
      }

      // Confirm upload (duration unknown for uploaded files)
      const confirmResponse = await fetch("/api/event/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key, duration: 0 }),
      });

      if (!confirmResponse.ok) {
        throw new Error("Failed to confirm upload");
      }

      const { s3Url } = await confirmResponse.json();

      // Add to audio files list
      setAudioFiles((prev) => [
        ...prev,
        {
          clipIndex,
          s3Key,
          filename: file.name,
          duration: 0,
          mimeType: file.type,
          size: file.size,
          audioUrl: s3Url,
        },
      ]);

      toast({
        title: "파일이 업로드되었습니다",
      });
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "파일 업로드 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // Delete audio file
  const handleDeleteAudio = (clipIndex: number) => {
    setAudioFiles((prev) => prev.filter((f) => f.clipIndex !== clipIndex));
    toast({
      title: "삭제되었습니다",
    });
  };

  // Format phone number with dashes
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-numeric characters
    const numbers = value.replace(/[^\d]/g, '');

    // Limit to 11 digits
    const limitedNumbers = numbers.slice(0, 11);

    // Format with dashes
    let formatted = limitedNumbers;
    if (limitedNumbers.length > 3) {
      if (limitedNumbers.length <= 7) {
        formatted = `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
      } else {
        formatted = `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
      }
    }

    setPhone(formatted);
  };

  // Submit form
  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast({
        title: "이름을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!birthDate) {
      toast({
        title: "생년월일을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!validateKoreanPhone(phone)) {
      console.log("Phone validation failed:", phone);
      console.log("Cleaned phone:", phone.replace(/[\s-]/g, ''));
      toast({
        title: "올바른 휴대폰 번호를 입력해주세요",
        description: "010-1234-5678 형식으로 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (audioFiles.length === 0) {
      toast({
        title: "최소 1개 이상의 음성 파일을 녹음해주세요",
        variant: "destructive",
      });
      return;
    }

    if (subjectType === "기타" && !subjectOther.trim()) {
      toast({
        title: "자서전 주인공을 입력해주세요",
        variant: "destructive",
      });
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
          subjectType,
          subjectOther: subjectType === "기타" ? subjectOther : undefined,
          audioFiles,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      // Show confirmation modal
      setShowConfirmation(true);

      // Reset form
      setName("");
      setBirthDate("");
      setPhone("");
      setSubjectType("본인");
      setSubjectOther("");
      setAudioFiles([]);
      setRecorderKey((prev) => prev + 1); // Reset recorder component
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "제출 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F3] to-[#C1A875]/10 overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
            자서전 제1장<br />
            무료제작 이벤트
          </h1>
          <p className="text-xl lg:text-2xl text-brand-text-light mb-8 leading-relaxed max-w-3xl mx-auto">
            당신의 이야기를 음성으로 남기면,<br />
            자서전 제1장을 무료로 완성해드립니다.
          </p>

          <div className="space-y-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#43946C] hover:shadow-xl transform hover:-translate-x-2 transition-all duration-300">
              <div className="flex items-start">
                <div className="bg-[#43946C] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                  1
                </div>
                <p className="text-[#2E2E2E] leading-relaxed">
                  신청자 정보 입력하기
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#43946C] hover:shadow-xl transform hover:-translate-x-2 transition-all duration-300">
              <div className="flex items-start">
                <div className="bg-[#43946C] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                  2
                </div>
                <p className="text-[#2E2E2E] leading-relaxed">
                  아래의 인터뷰 질문지를 살펴보면서 어린시절 이야기를 음성 녹음하기
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#43946C] hover:shadow-xl transform hover:-translate-x-2 transition-all duration-300">
              <div className="flex items-start">
                <div className="bg-[#43946C] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                  3
                </div>
                <p className="text-[#2E2E2E] leading-relaxed">
                  녹음 파일을 성공적으로 제출하기
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Personal Info Form */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            <span className="text-[#43946C]">1.</span> <span className="text-[#2E2E2E]">신청자 정보 입력</span>
          </h2>
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300" style={{
            background: 'linear-gradient(135deg, rgba(193, 168, 117, 0.08) 0%, rgba(44, 62, 80, 0.05) 100%)'
          }}>
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

              <div>
                <Label className="mb-3 block">자서전 주인공 *</Label>
                <RadioGroup value={subjectType} onValueChange={setSubjectType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="본인" id="subject-self" />
                    <Label htmlFor="subject-self" className="font-normal cursor-pointer">본인</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="부모님" id="subject-parents" />
                    <Label htmlFor="subject-parents" className="font-normal cursor-pointer">부모님</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="형제자매" id="subject-siblings" />
                    <Label htmlFor="subject-siblings" className="font-normal cursor-pointer">형제자매</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="친구" id="subject-friend" />
                    <Label htmlFor="subject-friend" className="font-normal cursor-pointer">친구</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="기타" id="subject-other" />
                    <Label htmlFor="subject-other" className="font-normal cursor-pointer">기타</Label>
                  </div>
                </RadioGroup>

                {subjectType === "기타" && (
                  <Input
                    value={subjectOther}
                    onChange={(e) => setSubjectOther(e.target.value)}
                    placeholder="관계를 입력해주세요"
                    className="mt-3"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Recording Guide */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            <span className="text-[#43946C]">2.</span> <span className="text-[#2E2E2E]">녹음 가이드</span>
          </h2>
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300" style={{
            background: 'linear-gradient(135deg, rgba(193, 168, 117, 0.08) 0%, rgba(44, 62, 80, 0.05) 100%)'
          }}>
            <p className="text-[#2E2E2E]/80 mb-4">
              <strong className="text-[#2E2E2E]">
                아래 예시 음성에서 들리는 것처럼 나의 어린시절 이야기를 가족에게 말해주듯 이야기하는 음성을 녹음해주세요.
              </strong>
            </p>

            <p className="text-[#2E2E2E]/80 text-sm mb-4">
              (자서전의 주인공이 내가 아닌 다른 가족이라면 그 가족의 이야기를 녹음해주세요.)
            </p>

            <div className="mb-4">
              <Label className="mb-2 block font-semibold text-[#2E2E2E]">예시 음성 듣기</Label>
              <div className="p-3 bg-white rounded-lg border">
                <audio controls controlsList="nodownload noplaybackrate" className="w-full">
                  <source src="/audio/example.m4a" type="audio/mp4" />
                  브라우저가 오디오 재생을 지원하지 않습니다.
                </audio>
              </div>
            </div>

            <div className="space-y-2 text-sm text-[#2E2E2E]/80">
              <p>• 한 파일당 3~10분 정도로 녹음해주세요.</p>
              <p>• 조용한 공간에서 녹음해주세요.</p>
              <p>• 말이 정리되지 않아도 괜찮습니다. 편안하게 대화하듯 녹음해주세요.</p>
            </div>
          </div>
        </section>

        {/* Recording Section */}
        <section className="mb-12 overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            <span className="text-[#43946C]">3.</span> <span className="text-[#2E2E2E]">음성 녹음하기 (최대 3개)</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6 w-full overflow-hidden">
            <div className="space-y-6 w-full min-w-0 overflow-hidden">
              {/* Recording/Upload Tabs */}
              <div className="w-full overflow-hidden bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300" style={{
                background: 'linear-gradient(135deg, rgba(193, 168, 117, 0.08) 0%, rgba(44, 62, 80, 0.05) 100%)'
              }}>
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
                    <p className="text-sm text-[#2E2E2E]/80 mb-4">
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

              {/* Audio Files List */}
              {audioFiles.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300" style={{
                  background: 'linear-gradient(135deg, rgba(193, 168, 117, 0.08) 0%, rgba(44, 62, 80, 0.05) 100%)'
                }}>
                  <h3 className="font-semibold mb-4 text-[#2E2E2E]">녹음된 파일 ({audioFiles.length}/3)</h3>
                  <div className="space-y-3">
                    {audioFiles.map((file) => (
                      <div
                        key={file.clipIndex}
                        className="p-3 bg-white/50 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <CheckCircle className="h-5 w-5 text-[#43946C] flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate text-[#2E2E2E]">{file.filename}</p>
                              {file.duration > 0 && (
                                <p className="text-xs text-[#2E2E2E]/60">
                                  {Math.floor(file.duration / 60)}:{String(Math.floor(file.duration % 60)).padStart(2, "0")}
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

            {/* Question Panel */}
            <QuestionPanel sessionId={sessionId} />
          </div>
        </section>

        {/* Submit Button */}
        <section className="text-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="relative bg-gradient-to-r from-brand-gold via-accent to-brand-gold hover:from-brand-gold-hover hover:via-brand-gold-hover hover:to-brand-gold-hover text-white text-lg px-10 py-5 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border-2 border-brand-gold/30 hover:border-brand-gold-hover/50 group overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center">
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              어린 시절 이야기 제출하기
            </span>
          </Button>
        </section>
      </div>

      <Footer />

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
      />
    </div>
  );
}
