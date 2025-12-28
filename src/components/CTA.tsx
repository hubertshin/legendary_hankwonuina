
import { Button } from "@/components/ui/button";

export const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-[#2C3E50] to-[#4C5C47] text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            상담 및 신청
          </h2>
          <div className="text-xl lg:text-2xl mb-12 opacity-90 leading-relaxed">
            <p className="mb-2">'한권의 여정' 시작하시겠어요?</p>
            <p>아래 링크를 통해 상담을 신청해보세요.</p>
          </div>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-[#FEE500] text-black hover:bg-[#FFDC00] text-lg px-8 py-4 flex items-center gap-3 font-medium hover:scale-105 transition-all duration-300 transform"
              asChild
            >
              <a href="https://pf.kakao.com/_xabkWn/chat" target="_blank" rel="noopener noreferrer">
                💬 카카오톡 채널로 바로 문의하기
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
