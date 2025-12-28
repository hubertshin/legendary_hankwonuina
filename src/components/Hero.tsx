'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { FilmStrip } from "./FilmStrip";
import { useState, useEffect } from "react";
export const Hero = () => {
  const [flippedCard1, setFlippedCard1] = useState(false);
  const [flippedCard2, setFlippedCard2] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const router = useRouter();

  // Hero에서 사용되는 모든 이미지들
  const heroImages = [
    "/lovable-uploads/7cb4a8cf-c373-4216-8304-2c8b713e4820.png",
    "/lovable-uploads/6ac72acf-006c-42b2-a8aa-cab95f688e36.png", 
    "/lovable-uploads/f80687da-a303-4dbc-8ae4-0e95085c49ba.png",
    "/lovable-uploads/0bf6f1b6-858d-4b48-83be-10e2e9843841.png"
  ];

  // 이미지 preload
  useEffect(() => {
    const preloadImages = () => {
      heroImages.forEach((src) => {
        const img = new Image();
        img.onload = () => {
          setImagesLoaded(prev => new Set([...prev, src]));
        };
        img.src = src;
      });
    };
    
    preloadImages();
  }, []);

  const handleLinkClick = (path: string) => {
    router.push(path);
    window.scrollTo(0, 0);
  };
  return <section className="relative py-8 lg:py-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-brand-gold/10"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 bg-brand-gold/20 px-6 py-2 rounded-full">
              <span className="text-lg font-bold text-secondary">✨자서전 제작 서비스✨</span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
            <span className="block md:inline">삶을 기록하고,</span>
            <span className="block md:inline md:ml-3">품격을 남기는 일</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-brand-text-light mb-8 leading-relaxed max-w-3xl mx-auto">당신의 이야기는 세대를 잇는 유산이 됩니다.</p>

          {/* 필름 스트립 애니메이션 */}
          <FilmStrip />

          <div className="flex justify-center items-center mb-10 w-full">
            <button onClick={() => handleLinkClick('/consultation')} className="w-full max-w-md lg:max-w-none lg:w-auto">
              <Button size="lg" className="relative bg-gradient-to-r from-brand-gold via-accent to-brand-gold hover:from-brand-gold-hover hover:via-brand-gold-hover hover:to-brand-gold-hover text-white text-lg px-10 py-5 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border-2 border-brand-gold/30 hover:border-brand-gold-hover/50 group overflow-hidden w-full lg:w-auto">
                <span className="relative z-10 flex items-center justify-center">
                  자서전 만들기 시작
                  <ArrowRight className="ml-3 h-6 w-6 transform group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </button>
          </div>

          {/* 실제 자서전 샘플 섹션 */}
          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* 첫 번째 자서전 카드 - 플립 효과 */}
              <div className="relative">
                <img src="/lovable-uploads/7cb4a8cf-c373-4216-8304-2c8b713e4820.png" alt="자서전 샘플 앞면" className="w-full h-auto object-contain opacity-0" />
                <div className="absolute inset-0 transform rotate-1 hover:rotate-0 transition-transform duration-300 perspective-1000 cursor-pointer animate-shake md:animate-none" onMouseEnter={() => setFlippedCard1(true)} onMouseLeave={() => setFlippedCard1(false)} onClick={() => setFlippedCard1(!flippedCard1)}>
                  <div className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ${flippedCard1 ? 'rotate-y-180' : ''}`}>
                    {/* 앞면 - 업로드된 이미지 */}
                    <div className="absolute inset-0 backface-hidden">
                      <div className="relative overflow-hidden rounded-2xl shadow-2xl w-full h-full">
                        <img 
                          src="/lovable-uploads/7cb4a8cf-c373-4216-8304-2c8b713e4820.png" 
                          alt="자서전 샘플 앞면" 
                          className={`w-full h-full object-cover transition-opacity duration-300 ${imagesLoaded.has("/lovable-uploads/7cb4a8cf-c373-4216-8304-2c8b713e4820.png") ? 'opacity-100' : 'opacity-50'}`}
                          loading="eager"
                          fetchPriority="high"
                        />
                      </div>
                    </div>
                    
                    {/* 뒷면 - 텍스트 있는 이미지 */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                      <div className="relative overflow-hidden rounded-2xl shadow-2xl w-full h-full">
                        <img 
                          src="/lovable-uploads/6ac72acf-006c-42b2-a8aa-cab95f688e36.png" 
                          alt="자서전 표지 샘플" 
                          className={`w-full h-full object-cover transition-opacity duration-300 ${imagesLoaded.has("/lovable-uploads/6ac72acf-006c-42b2-a8aa-cab95f688e36.png") ? 'opacity-100' : 'opacity-50'}`}
                          loading="eager"
                          fetchPriority="high"
                        />
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                          <div className="bg-card/90 backdrop-blur-md rounded-xl p-4 lg:p-6 text-center max-w-xs lg:max-w-sm mx-4">
                            <p className="text-sm lg:text-lg font-semibold text-secondary mb-1 lg:mb-2">
                              당신의 이야기를 책 한권에
                            </p>
                            <p className="text-xs lg:text-sm text-brand-text-light">
                              품격있는 실물 책으로 완성됩니다
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 두 번째 자서전 카드 - 플립 효과 */}
              <div className="relative">
                <img src="/lovable-uploads/f80687da-a303-4dbc-8ae4-0e95085c49ba.png" alt="자서전 샘플 앞면" className="w-full h-auto object-contain opacity-0" />
                <div className="absolute inset-0 transform -rotate-1 hover:rotate-0 transition-transform duration-300 perspective-1000 cursor-pointer animate-shake md:animate-none" onMouseEnter={() => setFlippedCard2(true)} onMouseLeave={() => setFlippedCard2(false)} onClick={() => setFlippedCard2(!flippedCard2)}>
                  <div className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ${flippedCard2 ? 'rotate-y-180' : ''}`}>
                    {/* 앞면 - 업로드된 이미지 */}
                    <div className="absolute inset-0 backface-hidden">
                      <div className="relative overflow-hidden rounded-2xl shadow-2xl w-full h-full">
                        <img 
                          src="/lovable-uploads/f80687da-a303-4dbc-8ae4-0e95085c49ba.png" 
                          alt="자서전 샘플 앞면" 
                          className={`w-full h-full object-cover transition-opacity duration-300 ${imagesLoaded.has("/lovable-uploads/f80687da-a303-4dbc-8ae4-0e95085c49ba.png") ? 'opacity-100' : 'opacity-50'}`}
                          loading="eager"
                          fetchPriority="high"
                        />
                      </div>
                    </div>
                    
                    {/* 뒷면 - 텍스트 있는 이미지 */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                      <div className="relative overflow-hidden rounded-2xl shadow-2xl w-full h-full">
                        <img 
                          src="/lovable-uploads/0bf6f1b6-858d-4b48-83be-10e2e9843841.png" 
                          alt="자서전 내지 샘플" 
                          className={`w-full h-full object-cover transition-opacity duration-300 ${imagesLoaded.has("/lovable-uploads/0bf6f1b6-858d-4b48-83be-10e2e9843841.png") ? 'opacity-100' : 'opacity-50'}`}
                          loading="eager"
                          fetchPriority="high"
                        />
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                          <div className="bg-card/90 backdrop-blur-md rounded-xl p-4 lg:p-6 text-center max-w-xs lg:max-w-sm mx-4">
                            <p className="text-sm lg:text-lg font-semibold text-secondary mb-1 lg:mb-2">
                              당신의 소중한 기억들이 여기에
                            </p>
                            <p className="text-xs lg:text-sm text-brand-text-light">
                              인터뷰를 통해 자연스럽게 완성됩니다
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};