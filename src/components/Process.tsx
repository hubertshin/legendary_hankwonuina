'use client';

import { MessageCircle, Edit, Book, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const steps = [{
  icon: MessageCircle,
  title: "1:1 인터뷰",
  description: "당신의 인생, 경험, 자서전에 담고 싶은 이야기를 편안하게 말로 풀어냅니다.",
  step: "01"
}, {
  icon: Edit,
  title: "자서전 집필",
  description: "숙련된 집필 매니저가 당신의 이야기를 모든 페이지에서 빛나도록 정성껏 책으로 집필합니다.",
  step: "02"
}, {
  icon: Book,
  title: "검토 및 추가인터뷰",
  description: "한권의 책이 된 당신의 이야기를 읽으며 검토하고, 더 담고 싶은 이야기를 추가로 인터뷰합니다.",
  step: "03"
}, {
  icon: Gift,
  title: "나의 자서전 완성",
  description: "품격있게 제본된 자서전을 받아 가족과 함께 나누고 다음 세대를 위해 간직합니다.",
  step: "04"
}];

export const Process = () => {
  const router = useRouter();

  const handleLinkClick = (path: string) => {
    router.push(path);
    window.scrollTo(0, 0);
  };
  return <section id="process" className="py-20 bg-gradient-to-br from-[#FAF8F3] to-[#C1A875]/10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#2E2E2E] mb-6">
            어떻게 자서전이 제작되나요?
          </h2>
          <p className="text-xl text-[#2E2E2E]/80">
            <span className="text-emerald-600 font-bold">사람의 공감 능력</span>과 <span className="text-emerald-600 font-bold">기술의 효율성</span>을 담아,<br />
            누구나 쉽고 부담 없이 자서전을 남길 수 있도록 도와드립니다.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => <div key={index} className="group">
                {/* 데스크톱에서는 세로 배치 (기존) */}
                <div className="hidden lg:block text-center">
                  <div className="relative mb-8">
                    <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                      <step.icon className="h-8 w-8 text-[#2C3E50]" />
                    </div>
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-[#C1A875] text-2xl font-bold">
                      {step.step}
                    </div>
                    {index < steps.length - 1 && <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-[#C1A875]/30 -translate-x-10"></div>}
                  </div>
                  <h3 className="text-xl font-semibold text-[#2E2E2E] mb-4">
                    {step.title}
                  </h3>
                  <p className="text-[#2E2E2E]/80 leading-relaxed text-lg">
                    {step.description}
                  </p>
                </div>
                
                {/* 모바일/태블릿에서는 가로 배치 */}
                <div className="lg:hidden flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <step.icon className="h-7 w-7 text-[#2C3E50]" />
                      </div>
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-[#C1A875] text-lg font-bold">
                        {step.step}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-[#2E2E2E] mb-3">
                      {step.title}
                    </h3>
                    <p className="text-[#2E2E2E]/80 leading-relaxed text-base">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>)}
          </div>
        </div>

        <div className="flex justify-center items-center pt-8 w-full">
          <Button
            size="lg"
            onClick={() => handleLinkClick('/process')}
            className="relative bg-gradient-to-r from-[#C1A875] via-[#D4B87E] to-[#C1A875] hover:from-[#B5965E] hover:via-[#C9A86B] hover:to-[#B5965E] text-white text-lg px-10 py-5 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border-2 border-[#C1A875]/30 hover:border-[#B5965E]/50 group overflow-hidden w-auto"
          >
            <span className="relative z-10 flex items-center justify-center">
              자서전 제작과정 살펴보기
              <ArrowRight className="ml-3 h-6 w-6 transform group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </div>
      </div>
    </section>;
    // 테스트 
};
