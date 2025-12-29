'use client';

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, forwardRef, type ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// pdf.js worker 설정 (Next.js용 CDN 방식)
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type PageCoverProps = {
  children: ReactNode;
};

const PageCover = forwardRef<HTMLDivElement, PageCoverProps>(
  ({ children }, ref) => (
    <div className="page page-cover" ref={ref} data-density="hard">
      <div className="page-content h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  )
);
PageCover.displayName = "PageCover";

type PageContentProps = {
  pageNumber: number;
  width: number;
  height: number;
};

const PageContent = forwardRef<HTMLDivElement, PageContentProps>(
  ({ pageNumber, width, height }, ref) => (
    <div className="page" ref={ref}>
      <div className="page-content bg-white overflow-hidden" style={{ width, height }}>
        <Page
          pageNumber={pageNumber}
          width={width}
          height={height}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </div>
    </div>
  )
);
PageContent.displayName = "PageContent";

const SamplesPage = () => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const bookRef = useRef<HTMLFlipBook | null>(null);

  // 오디오 객체를 담을 ref 생성
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 버튼 클릭으로 인한 flip인지 추적
  const isButtonFlip = useRef<boolean>(false);

  // 컴포넌트 시작 시 오디오 파일 로드
  useEffect(() => {
    const audioUrl = "/lovable-uploads/page_flip.mp3";
    audioRef.current = new Audio(audioUrl);
    audioRef.current.volume = 0.5;
  }, []);

  // 소리 재생 헬퍼 함수
  const playFlipSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.log("Audio play prevented:", e));
    }
  };

  // 반응형 페이지 크기
  const getPageSize = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) {
        return { width: 350, height: 480 };
      }
      if (window.innerWidth < 1024) {
        return { width: 550, height: 750 };
      }
    }
    return { width: 700, height: 950 };
  };
  const [pageSize] = useState(getPageSize);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onFlip = (e: { data: number }) => {
    setCurrentPage(e.data);

    // 버튼 클릭이 아닌 직접 페이지 클릭일 때만 소리 재생
    if (!isButtonFlip.current) {
      playFlipSound();
    }
    // 플래그 초기화
    isButtonFlip.current = false;
  };

  const nextPage = () => {
    if (bookRef.current) {
      isButtonFlip.current = true; // 버튼으로 인한 flip 표시
      playFlipSound(); // 버튼 클릭과 동시에 소리 재생
      // @ts-ignore
      bookRef.current.pageFlip().flipNext();
    }
  };

  const prevPage = () => {
    if (bookRef.current) {
      isButtonFlip.current = true; // 버튼으로 인한 flip 표시
      playFlipSound(); // 버튼 클릭과 동시에 소리 재생
      // @ts-ignore
      bookRef.current.pageFlip().flipPrev();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 to-brand-gold/10">
      <Header />

      <section className="py-20 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              자서전 샘플
            </h1>
            <p className="text-xl text-brand-text-light leading-relaxed">
              실제 자서전에 어떤 내용이 담기는지
              <br className="md:hidden" /> 미리 확인해보세요.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-2 lg:mb-10 lg:-mt-8">
              <div className="md:inline-block w-full md:w-auto bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/40 rounded-lg px-6 py-3 relative z-20">
                <p className="text-brand-text-light text-base font-medium">
                  실제 저희가 작성 도와드린{" "}
                  <span className="text-brand-gold font-semibold">
                    신ㅇㅇ님의 자서전: "삶이 나를 단련시켰고, 나는 나답게
                    살았도다"
                  </span>
                  의 <br className="md:hidden" /> 내용입니다.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg min-h-[400px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto mb-4" />
                    <p className="text-brand-text-light">
                      자서전을 불러오는 중입니다...
                    </p>
                  </div>
                </div>
              )}

              <Document
                file="/lovable-uploads/test2.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                loading={null}
              >
                {numPages > 0 && (
                 <HTMLFlipBook
                  ref={bookRef}
                  width={pageSize.width}
                  height={pageSize.height}
                  size="fixed"
                  minWidth={pageSize.width}
                  maxWidth={pageSize.width}
                  minHeight={pageSize.height}
                  maxHeight={pageSize.height}
                  onFlip={onFlip}
                  className="shadow-2xl mx-auto"
                  startPage={0}
                  drawShadow={true}
                  flippingTime={200}
                  usePortrait={true}
                  startZIndex={0}
                  autoSize={true}
                  showPageCorners={true}
                  disableFlipByClick={false}
                  style={{ margin: '0 auto' }}
                >
                    {Array.from({ length: numPages }, (_, index) => (
                      <PageContent
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        width={pageSize.width}
                        height={pageSize.height}
                      />
                    ))}

                  </HTMLFlipBook>
                )}
              </Document>

              {numPages > 0 &&  (
                <div className="flex items-center justify-center gap-6 mt-[1cm]">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={prevPage}
                    disabled={currentPage <= 0}
                    className="flex items-center gap-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    이전
                  </Button>

                  <span className="text-brand-text-light font-medium px-4">
                    {currentPage + 1} / {numPages}
                  </span>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={nextPage}
                    disabled={currentPage >= numPages + 1}
                    className="flex items-center gap-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white disabled:opacity-50"
                  >
                    다음
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <p className="text-sm text-brand-text-light/70 mt-4">
                페이지 모서리를 드래그하거나 버튼을 눌러 책장을 넘겨보세요.
              </p>
            </div>

            <div className="mt-10 text-center">
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  이렇게 완성됩니다
                </h3>
                <p className="text-brand-text-light leading-relaxed max-w-2xl mx-auto mb-8 text-center">
                  위 샘플은 실제 &apos;한권의나&apos; 서비스와 함께 제작된 자서전의
                  내용 일부입니다.
                  <br />
                  약 4시간의 인터뷰를 통해 여러분의 소중한 이야기가 아름다운 책이
                  됩니다.
                  <br />
                  한 권의 책 안에 담긴 여러분만의 품격있는 이야기를 이제
                  만나보세요.
                </p>
                <Button asChild className="bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-4 rounded-lg font-medium text-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <Link href="/consultation" onClick={() => window.scrollTo(0, 0)}>
                    나의 자서전 만들기
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SamplesPage;
