'use client';

import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
export const BrandStoryIntro = () => {
  const router = useRouter();
  const handleLinkClick = (path: string) => {
    router.push(path);
    window.scrollTo(0, 0);
  };
  return <section className="py-20 bg-gradient-to-br from-white to-[#FAF8F3]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* 제목 섹션 */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-[#C1A875]/10 px-6 py-3 rounded-full mb-6">
              <img src="/lovable-uploads/32760d4e-6290-41fc-aacf-1898f668c43e.png" alt="한권의나 로고" className="h-8 w-8" />
              <span className="text-lg font-semibold text-[#2C3E50]">브랜드 스토리</span>
            </div>
            {/* Desktop & iPad version */}
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2E2E2E] mb-6 hidden md:block">
              '한권의나' - 어떤 서비스일까요?
            </h2>
            {/* Mobile version */}
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2E2E2E] mb-6 md:hidden">
              '한권의나'<br />어떤 서비스일까요?
            </h2>
          </div>

          {/* 스토리 내용 */}
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-[#C1A875]/20">
            <div className="space-y-6 text-lg leading-relaxed text-black">
              <p className="text-xl font-medium text-black mb-8">
                자서전을 만들어주는 '한권의나'는<br />
                어느 엄마와 딸의 프로젝트에서 시작됐습니다.
              </p>

              <p className="text-black">어머니는 아래와 같은 꿈이 있었습니다.</p>

              <div className="bg-[#FAF8F3] rounded-xl p-4 md:p-6 border-l-4 border-[#C1A875]">
                {/* Desktop & iPad version */}
                <p className="italic text-[#2E2E2E] text-center font-medium text-lg leading-relaxed hidden md:block">
                  "내 인생 이야기를 담은 자서전을 직접 만들어,<br />
                  환갑에 가족과 친구들에게 선물하고 싶다"
                </p>
                {/* Mobile version */}
                <p className="italic text-[#2E2E2E] text-center font-medium text-lg leading-relaxed md:hidden">
                  "내 인생 이야기를 담은 자서전을<br />
                  직접 만들어, 환갑에 가족과<br />
                  친구들에게 선물하고 싶다"
                </p>
              </div>

              <p className="text-black">
                하지만 그 꿈은 20년 가까이 시작하지 못하고 마음 한구석에만 자리하고 있었어요.
              </p>

              <div className="bg-[#FAF8F3] rounded-xl p-4 md:p-6 border-l-4 border-[#C1A875]">
                <p className="italic text-[#2E2E2E] text-center font-medium text-lg leading-relaxed">
                  "글을 잘 쓰는 것도 아니고,<br />
                  책 만드는 일은 엄두가 안나.."
                </p>
              </div>

              <p className="text-black">
                그러다 정말 환갑이 되는 해,<br />
                딸은 어머니에게 이렇게 말합니다.
              </p>

              <div className="bg-[#FAF8F3] rounded-xl p-4 md:p-6 border-l-4 border-[#C1A875]">
                <p className="italic text-[#2E2E2E] text-center font-medium text-lg leading-relaxed">"제가 자서전 제작을 도울게요!"</p>
              </div>

              {/* CTA 버튼 */}
              <div className="flex justify-center items-center pt-8 w-full">
                <button onClick={() => handleLinkClick('/brand-story')} className="w-full max-w-md lg:max-w-none lg:w-auto">
                  <Button size="lg" className="relative bg-gradient-to-r from-[#C1A875] via-[#D4B87E] to-[#C1A875] hover:from-[#B5965E] hover:via-[#C9A86B] hover:to-[#B5965E] text-white text-lg px-10 py-5 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border-2 border-[#C1A875]/30 hover:border-[#B5965E]/50 group overflow-hidden w-full lg:w-auto">
                    <span className="relative z-10 flex items-center justify-center">
                      브랜드 스토리 더 알아보기
                      <ArrowRight className="ml-3 h-6 w-6 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};