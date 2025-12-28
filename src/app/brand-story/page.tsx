'use client';

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Handshake, Sparkles, TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const BrandStory = () => {
  const router = useRouter();
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<HTMLDivElement[]>([]);
  // 이미지 프리로딩 및 IntersectionObserver 설정
  useEffect(() => {
    // 모든 이미지 프리로딩
    const preloadImages = () => {
      storyData.forEach((story, index) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, story.image]));
        };
        img.src = story.image;
      });
    };

    preloadImages();

    // IntersectionObserver 설정
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const index = parseInt(entry.target.getAttribute('data-section') || '0');
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set([...prev, index]));
        }
      });
    }, {
      threshold: 0.3
    });

    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);
  const storyData = [{
    text: (
      <>
        어머니의 오랜 버킷리스트 중 하나는,{'\n'}
        <span className="text-emerald-600 font-semibold">"내 인생 이야기를 담은 자서전을 직접 만들어, 환갑에 가족과 친구들에게 선물하고 싶다"</span>는 소망이었습니다.{'\n'}
        하지만 20년 가까이 그 꿈은 마음 한구석에 자리한 채 시작되지 못했어요.{'\n'}
        <span className="text-emerald-600 font-semibold">"글을 잘 쓰는 것도 아니고, 책 만드는 일은 엄두가 안나..."</span>
      </>
    ),
    image: "/lovable-uploads/73e8d55a-4e4d-4551-95cf-d1ba30fcd776.png"
  }, {
    text: (
      <>
        어느새 어머니가 환갑을 맞이하시게 되면서 딸은 어머니에게 <span className="text-emerald-600 font-semibold">"제가 자서전 제작을 도와드릴게요."</span>라고 말하게 됩니다.{'\n'}
        딸로서는 어머니의 오랜 소망을 꼭 이뤄드리고 싶었고, 또 한편으로는 조각조각 듣기만 했던 어머니의 삶을 처음부터 끝까지 듣고 싶은 마음도 담겼었습니다.
      </>
    ),
    image: "/lovable-uploads/8111aea2-ccd8-4f78-a70a-bee48f112bd6.png"
  }, {
    text: (
      <>
        그렇게 무모하게 시작한 자서전 제작...{'\n'}
        한 달이라는 시간 동안 우리는 단지 '책 한 권'을 만든 것이 아니었습니다.{'\n'}
        <span className="text-emerald-600 font-semibold">"내가 무심히 풀어놓은 이야기가 이렇게 정갈하게 책에 담길 줄은 몰랐어..."</span>
      </>
    ),
    image: "/lovable-uploads/0e61dac1-b784-4612-9c51-90bd51e8c840.png"
  }, {
    text: (
      <>
        어머니는 그렇게 탄생한 자서전을 보며 감탄하셨고, 우리는 매 장면에서 웃고, 울고, 더 가까워졌습니다.{'\n'}
        꾹 눌러 담아두었던 이야기들이 활자로 피어날 때 <span className="text-emerald-600 font-semibold">그 아름다움에 미소짓고,</span>{'\n'}
        말하지 못한 감정들이 표현된 장면에서 <span className="text-emerald-600 font-semibold">울컥 눈물이 나기도</span> 했습니다.
      </>
    ),
    image: "/lovable-uploads/94437069-b30e-4acc-801c-3dcd77dd41e9.png"
  }, {
    text: (
      <>
        그렇게 엄마와 딸은 인생을 기록하는 과정 속에서 <span className="text-emerald-600 font-semibold">또 하나의 인생</span>을 함께 만든 것이었습니다.
      </>
    ),
    image: "/lovable-uploads/e0693469-1547-403b-bd06-db6de55d5d31.png"
  }];
  const values = [{
    icon: <Heart className="h-6 w-6" />,
    title: "진정성",
    description: "당신의 이야기를 왜곡 없이, 있는 그대로 담습니다."
  }, {
    icon: <Handshake className="h-6 w-6" />,
    title: "공감",
    description: "진심 어린 대화 속에서 마음의 결까지 함께 기록합니다."
  }, {
    icon: <Sparkles className="h-8 w-8" />,
    title: "품격",
    description: "세련된 디자인, 차분한 언어, 아름다운 구성으로 완성합니다."
  }, {
    icon: <TreePine className="h-6 w-6" />,
    title: "지속성",
    description: "한 권의 책은 단지 기록이 아니라, 다음 세대를 위한 유산이 됩니다."
  }];
  return <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <Header />

      {/* Hero Section */}
      <section className="py-20 lg:py-32 pb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            한권의나 브랜드 스토리
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            모든 인생은 한 권의 품격있는 이야기입니다.
          </p>
        </div>
      </section>

      {/* 우리의 시작 */}
      <section className="pt-4 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">우리의 시작</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">자서전을 만들어주는 '한권의 나'는 어느 엄마와 딸의 프로젝트에서 우연히 시작됐습니다.</p>
          </div>

          <div className="space-y-24">
            {storyData.map((story, index) => <div key={index} ref={el => {
            if (el) sectionRefs.current[index] = el;
          }} data-section={index} className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center transition-all duration-1000 ${visibleSections.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="bg-card p-6 md:p-8 rounded-2xl shadow-lg border">
                    <div className="text-lg leading-relaxed text-foreground whitespace-pre-line">
                      {story.text}
                    </div>
                  </div>
                </div>
                <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg max-w-md mx-auto relative">
                    <img
                      src={story.image}
                      alt={`브랜드 스토리 ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="eager"
                      style={{ imageRendering: 'auto' }}
                    />
                    {!loadedImages.has(story.image) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* 우리가 믿는 철학 */}
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="lg:text-4xl font-bold text-foreground mb-12 text-center text-4xl">우리가 믿는 철학</h2>

            <div className="text-center mb-4">
              <p className="text-lg text-muted-foreground mb-2 text-center">우리는 단지 "대신 써주는 서비스"가 아닙니다.</p>
              <p className="font-medium text-lg text-center text-slate-950">자서전을 쓰는 과정은 "삶을 정리하고, 위로하고, 이어주는 특별한 여정" 이라고 믿습니다.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card p-6 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="text-4xl flex-shrink-0">🥰</div>
                  <div className="flex-1">
                    {/* Desktop version */}
                    <p className="text-lg leading-relaxed text-foreground hidden lg:block text-center">
                      어떤 AI 기술도 담아낼 수 없는 <strong>한 사람의 숨결과 온기</strong>
                    </p>
                    {/* Mobile/iPad version */}
                    <p className="text-lg leading-relaxed text-foreground lg:hidden text-center">
                      어떤 AI 기술도 담아낼 수 없는<br />
                      <strong>한 사람의 숨결과 온기</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-6 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="text-4xl flex-shrink-0">🥹</div>
                  <div className="flex-1">
                    {/* Desktop version */}
                    <p className="text-lg leading-relaxed text-foreground hidden lg:block text-center">
                      어떤 편집 기술도 대신할 수 없는 <strong>표현하지 못한 마음들</strong>
                    </p>
                    {/* Mobile/iPad version */}
                    <p className="text-lg leading-relaxed text-foreground lg:hidden text-center">
                      어떤 편집 기술도 대신할 수 없는<br />
                      <strong>마음 속 깊은 이야기들</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-lg leading-relaxed text-foreground">
                오래된 다이어리에 꾹꾹 눌러쓴 당신의 말들처럼<br />
                <strong>품격 있게, 따뜻하게, 그리고 진심으로</strong> 담아내고 싶었습니다.
              </p>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 shadow-lg">
              {/* Desktop version */}
              <p className="text-lg text-emerald-800 text-center font-semibold hidden lg:block">
                그래서 '한권의 나'는 오늘도 한 사람 한 사람의 이야기를<br />
                정중하게 듣고, 공감하고, 아름답게 책으로 엮어드립니다.
              </p>
              {/* Mobile version */}
              <p className="text-lg text-emerald-800 text-center font-semibold lg:hidden">
                '한권의 나'는 한 사람 한사람의<br />
                이야기를 정중하게 듣고, 공감하고<br />
                아름답게 책으로 엮어드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 가치 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="lg:text-4xl font-bold text-foreground mb-6 text-4xl">핵심 가치</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {values.map((value, index) => <Card key={index} className="text-center p-2 md:p-4 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-2 md:space-y-3 p-3 md:p-6 pt-0">
                  <div className="flex items-center justify-center gap-2 text-brand-gold">
                    {value.icon}
                    <h3 className="text-lg font-bold text-foreground">{value.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-brand-gold/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          {/* Desktop & iPad version */}
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 hidden md:block">당신의 삶에도, 한 권의 이야기가 있습니다</h2>
          {/* Mobile version */}
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 md:hidden">당신의 삶에도,<br />한 권의 이야기가 있습니다</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            당신의 이야기를 들려주세요.<br />
            저희가 귀 기울여 듣고,<br />
            품격 있게 한 권으로 엮어드리겠습니다.
          </p>
          <Button size="lg" onClick={() => { router.push('/consultation'); window.scrollTo(0, 0); }} className="relative bg-gradient-to-r from-brand-gold via-accent to-brand-gold hover:from-brand-gold-hover hover:via-brand-gold-hover hover:to-brand-gold-hover text-white text-lg px-10 py-5 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border-2 border-brand-gold/30 hover:border-brand-gold-hover/50 group overflow-hidden">
            <span className="relative z-10 flex items-center justify-center">
              한권의 여정 시작하기
            </span>
          </Button>
        </div>
      </section>

      <Footer />
    </div>;
};
export default BrandStory;
