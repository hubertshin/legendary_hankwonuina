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
            <Button
              size="lg"
              onClick={() => handleLinkClick('/consultation')}
              className="relative bg-gradient-to-r from-brand-gold via-accent to-brand-gold hover:from-brand-gold-hover hover:via-brand-gold-hover hover:to-brand-gold-hover text-white text-lg px-10 py-5 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border-2 border-brand-gold/30 hover:border-brand-gold-hover/50 group overflow-hidden w-full max-w-md lg:max-w-none lg:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center">
                자서전 만들기 시작
                <ArrowRight className="ml-3 h-6 w-6 transform group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>;
};