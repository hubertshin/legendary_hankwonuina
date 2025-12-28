'use client';

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SamplesPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  const samplePages = ['/lovable-uploads/03b237e9-42f7-49d0-8158-72c6ebdac5c1.png', '/lovable-uploads/1a34f7de-64cf-4a88-951b-a3778fb57b45.png', '/lovable-uploads/26196d32-0801-4cef-ba62-3249491c518f.png', '/lovable-uploads/a96d813a-9030-4ad1-a537-fa9637ef0493.png', '/lovable-uploads/13f19f6e-4a16-498d-be12-4cbd32fa9894.png'];

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      samplePages.forEach((src, index) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, index]));
        };
        img.src = src;
      });
    };

    preloadImages();
  }, []);

  // Preload adjacent images when current page changes
  useEffect(() => {
    const preloadAdjacentImages = () => {
      const toPreload = [currentPage - 1, currentPage + 1].filter(
        index => index >= 0 && index < samplePages.length && !loadedImages.has(index)
      );

      toPreload.forEach(index => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, index]));
        };
        img.src = samplePages[index];
      });
    };

    preloadAdjacentImages();
  }, [currentPage, loadedImages]);

  const nextPage = () => {
    if (currentPage < samplePages.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentPage(currentPage + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentPage(currentPage - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const goToPage = (index: number) => {
    if (index !== currentPage && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentPage(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-secondary/10 to-brand-gold/10">
      <Header />

      <section className="py-20 md:py-20 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-10">  {/* 여백을 mb-10으로 늘림 */}
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">자서전 샘플</h1>
            <p className="text-xl text-brand-text-light leading-relaxed">
              실제 자서전에 어떤 내용이 담기는지<br className="md:hidden" /> 미리 확인해보세요.
            </p>
          </div>

          {/* Book Container */}
          <div className="max-w-6xl mx-auto">
            {/* 실제 자서전 발췌 안내문 */}
            <div className="text-center mb-8 md:mb-2 lg:mb-24 lg:-mt-8">  {/* 데스크탑에서 더 큰 간격으로 확실히 분리 */}
              <div className="md:inline-block w-full md:w-auto bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/40 rounded-lg px-6 py-3 relative z-20">  {/* 이미지 위에 표시되도록 z-index 추가 */}
                <p className="text-brand-text-light text-base font-medium">
                  실제 <span className="text-brand-gold font-semibold">「우아란: 나를 닮은 시간들」</span>에서<br className="md:hidden" /> 발췌한 내용입니다.
                </p>
              </div>
            </div>
            <div className="relative">
              {/* Page Image */}
              <div className="relative w-full md:h-[700px] h-auto flex items-center justify-center py-4">{/* 모든 화면에서 여백 고정 */}
                <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                  <img
                    src={samplePages[currentPage]}
                    alt={`자서전 샘플 페이지 ${currentPage + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    style={{ imageRendering: 'auto' }}
                    loading="eager"
                  />
                </div>
                {!loadedImages.has(currentPage) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <button onClick={prevPage} disabled={currentPage === 0} className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group z-10">
                <ChevronLeft className="h-6 w-6 text-foreground group-hover:text-brand-gold transition-colors" />
              </button>

              <button onClick={nextPage} disabled={currentPage === samplePages.length - 1} className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group z-10">
                <ChevronRight className="h-6 w-6 text-foreground group-hover:text-brand-gold transition-colors" />
              </button>

              {/* Page Indicators */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-2">
                  {samplePages.map((_, index) => <button key={index} onClick={() => goToPage(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentPage ? 'bg-brand-gold' : 'bg-brand-text-light/30 hover:bg-brand-text-light/50'}`} />)}
                </div>
              </div>
            </div>

            {/* Sample Info */}
            <div className="mt-20 text-center">
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  이렇게 완성됩니다
                </h3>
                <p className="text-brand-text-light leading-relaxed max-w-2xl mx-auto mb-8 text-center">
                  위 샘플은 실제 '한권의나' 서비스와 함께 제작된 자서전의 내용 일부입니다.<br />
                  약 4시간의 인터뷰를 통해 여러분의 소중한 이야기가 아름다운 책이 됩니다.<br />
                  한 권의 책 안에 담긴 여러분만의 품격있는 이야기를 이제 만나보세요.
                </p>
                <Link href="/consultation" onClick={() => window.scrollTo(0, 0)}>
                  <Button className="bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-4 rounded-lg font-medium text-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                    나의 자서전 만들기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default SamplesPage;
