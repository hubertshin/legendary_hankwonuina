'use client';

import React, { useEffect, useState } from 'react';

const filmStrips = [
  {
    src: "/lovable-uploads/ee164b49-c8b1-4c4f-afc8-b6de3e375f72.png",
    alt: "추억의 순간들 1"
  },
  {
    src: "/lovable-uploads/56aace2a-d18b-4e06-812f-16290f3176b5.png",
    alt: "추억의 순간들 2"
  },
  {
    src: "/lovable-uploads/d6588295-e649-4d25-b0c1-ae3dccd311d1.png",
    alt: "추억의 순간들 3"
  },
  {
    src: "/lovable-uploads/52fef754-7784-44b1-b968-56211485bc1b.png",
    alt: "추억의 순간들 4"
  },
  {
    src: "/lovable-uploads/1499995f-6cda-4e1f-8f58-78a3fa3fc263.png",
    alt: "추억의 순간들 5"
  }
];

export const FilmStrip = () => {
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  // 컴포넌트 마운트 시 모든 이미지를 preload
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = filmStrips.map((filmStrip) => {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            setImagesLoaded(prev => new Set([...prev, filmStrip.src]));
            resolve(filmStrip.src);
          };
          img.onerror = reject;
          img.src = filmStrip.src;
        });
      });

      try {
        await Promise.all(imagePromises);
        setAllImagesLoaded(true);
      } catch (error) {
        console.error('Failed to preload some images:', error);
        // 일부 이미지가 실패해도 계속 진행
        setAllImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  // 무한 스크롤을 위해 필름 스트립들을 3번 반복
  const repeatedFilmStrips = [...filmStrips, ...filmStrips, ...filmStrips];

  return (
    <div className="relative w-screen overflow-hidden -ml-[50vw] left-1/2 mb-12">
      {/* 로딩 상태 표시 */}
      {!allImagesLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-secondary/80 flex items-center justify-center z-10">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-gold"></div>
            <span className="text-foreground/70 text-sm">한권의 여정 시작하는 중...</span>
          </div>
        </div>
      )}
      
      {/* 필름 스트립 컨테이너 */}
      <div className={`relative transition-opacity duration-500 ${allImagesLoaded ? 'opacity-100' : 'opacity-30'}`}>
        {/* 메인 필름 스트립 애니메이션 */}
        <div className="flex animate-[filmFlow_60s_linear_infinite] will-change-transform">
          {repeatedFilmStrips.map((filmStrip, index) => {
            const isLoaded = imagesLoaded.has(filmStrip.src);
            return (
              <div
                key={index}
                className="flex-shrink-0 relative"
                style={{ width: "800px", height: "400px" }} // 적절한 높이로 설정
              >
                <img
                  src={filmStrip.src}
                  alt={filmStrip.alt}
                  className={`w-full h-full object-cover transition-all duration-700 hover:brightness-110 hover:contrast-110 ${
                    isLoaded ? 'opacity-100' : 'opacity-50'
                  }`}
                  loading="eager"
                  fetchPriority="high"
                  style={{ 
                    filter: "sepia(20%) contrast(1.1) brightness(0.95)",
                    imageRendering: "auto"
                  }}
                />
                {/* 개별 이미지 로딩 표시 */}
                {!isLoaded && (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="animate-pulse bg-gray-300 w-full h-full"></div>
                  </div>
                )}
                {/* 필름 질감 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent opacity-30 pointer-events-none" />
                {/* 빈티지 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/10 via-transparent to-amber-100/10 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 빈티지 필름 효과를 위한 노이즈 오버레이 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
    </div>
  );
};