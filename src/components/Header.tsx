'use client';

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLinkClick = (path: string) => {
    router.push(path);
    window.scrollTo(0, 0);
    setIsMenuOpen(false); // 모바일 메뉴 닫기
  };

  return (
    <header className="bg-background/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => handleLinkClick('/')} className="flex items-center space-x-2">
            <img src="/lovable-uploads/32760d4e-6290-41fc-aacf-1898f668c43e.png" alt="한권의나 로고" className="h-12 w-12" />
            <span className="text-2xl font-bold text-foreground">한권의나</span>
          </button>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleLinkClick('/brand-story')} className="text-foreground hover:text-secondary transition-colors">브랜드 스토리</button>
            <button onClick={() => handleLinkClick('/process')} className="text-foreground hover:text-secondary transition-colors">진행과정</button>
            <button onClick={() => handleLinkClick('/samples')} className="text-foreground hover:text-secondary transition-colors">자서전 샘플</button>
            <button onClick={() => handleLinkClick('/pricing')} className="text-foreground hover:text-secondary transition-colors">서비스 가격</button>
            <button onClick={() => handleLinkClick('/chapter1-event')} className="text-foreground hover:text-secondary transition-colors">무료 이벤트</button>
            <Button onClick={() => handleLinkClick('/consultation')} className="bg-brand-gold hover:bg-brand-gold-hover text-white">상담하기</Button>
          </nav>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <button onClick={() => handleLinkClick('/brand-story')} className="text-foreground hover:text-secondary transition-colors text-left">브랜드 스토리</button>
              <button onClick={() => handleLinkClick('/process')} className="text-foreground hover:text-secondary transition-colors text-left">진행과정</button>
              <button onClick={() => handleLinkClick('/samples')} className="text-foreground hover:text-secondary transition-colors text-left">자서전 샘플</button>
              <button onClick={() => handleLinkClick('/pricing')} className="text-foreground hover:text-secondary transition-colors text-left">서비스 가격</button>
              <button onClick={() => handleLinkClick('/chapter1-event')} className="text-foreground hover:text-secondary transition-colors text-left">무료 이벤트</button>
              <Button onClick={() => handleLinkClick('/consultation')} className="bg-brand-gold hover:bg-brand-gold-hover text-white w-full">상담하기</Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
