'use client';

import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRouter } from "next/navigation";

export const FAQ = () => {
  const router = useRouter();

  const handleLinkClick = (path: string) => {
    router.push(path);
    window.scrollTo(0, 0);
  };
  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-[#FAF8F3] to-[#C1A875]/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#2E2E2E] mb-6">
            자주 묻는 질문(FAQ)
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <AccordionTrigger className="px-8 py-6 text-left text-lg font-semibold text-[#2C3E50] hover:no-underline hover:bg-[#FAF8F3]/50 transition-colors">
                Q. 글을 잘 못 써도 괜찮을까요?
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-6 text-[#2E2E2E] leading-relaxed text-base">
                <p className="mb-4 whitespace-pre-line">
                  <strong>물론입니다. 이야기만 들려주세요.</strong>{'\n'}'한권의나'에서 자서전 제작 전과정을 함께하며 자서전 인쇄/배송까지 대신해드립니다.{'\n'}그래도 구체적으로 저자님이 하셔야할 일이 궁금하신 분들은 아래의 내용을 참고해주세요.
                </p>
                <div className="mt-4">
                  <button onClick={() => {
                      router.push('/process');
                      setTimeout(() => window.scrollTo(0, 0), 100);
                    }}>
                    <Button variant="outline" size="sm" className="border-[#C1A875] text-[#C1A875] hover:bg-[#C1A875] hover:text-white">
                      자세한 진행과정 살펴보기
                    </Button>
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <AccordionTrigger className="px-8 py-6 text-left text-lg font-semibold text-[#2C3E50] hover:no-underline hover:bg-[#FAF8F3]/50 transition-colors">
                Q. 인터뷰는 어떻게 진행되나요?
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-6 text-[#2E2E2E] leading-relaxed text-base">
                <div className="whitespace-pre-line">
                  인터뷰 날짜에 맞춰 온라인 미팅 링크를 제공해드립니다.{'\n'}온라인으로 얼굴을 보며 편안한 분위기에서 진행합니다.{'\n'}인터뷰 전에 '한권의나'에서 미리 준비해둔 인터뷰 질문을 저자님께 공유해드립니다.{'\n'}미리 살펴보신 질문에 대한 답변을 인터뷰에서 편하게 말씀해주시면 됩니다.{'\n'}저자님의 말씀은 모두 녹음되어 자서전 집필에 활용됩니다.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <AccordionTrigger className="px-8 py-6 text-left text-lg font-semibold text-[#2C3E50] hover:no-underline hover:bg-[#FAF8F3]/50 transition-colors">
                Q. 책 분량은 어떻게 되나요?
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-6 text-[#2E2E2E] leading-relaxed text-base">
                <div className="whitespace-pre-line">
                  정확한 페이지 수는 저자님의 인터뷰 내용에 따라 다르며 인터뷰 내용에 따라 맞춤 제작됩니다.{'\n'}통상 5시간 정도의 인터뷰 내용에 100페이지 내외의 책이 만들어집니다.{'\n'}인터뷰 내용에 따라 맞춤 제작됩니다.{'\n'}'한권의나'에서는 분량이 많아져도 추가 비용을 청구하지 않으니 마음 편하게 인생 이야기를 공유해주세요.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <AccordionTrigger className="px-8 py-6 text-left text-lg font-semibold text-[#2C3E50] hover:no-underline hover:bg-[#FAF8F3]/50 transition-colors">
                Q. 비용은 어떻게 되나요?
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-6 text-[#2E2E2E] leading-relaxed text-base">
                <p className="mb-4 whitespace-pre-line">
                  크게 두 가지 비용- (1)자서전 제작 서비스료, (2)자서전 인쇄 실비로 나뉩니다.{'\n'}자서전 제작 서비스료는 제작 전과정에 들어가는 모든 서비스를 포함한 가격이며 중간에 추가 비용이 없습니다.{'\n'}자서전 인쇄 실비는 자서전 원고를 최종 퇴고한 뒤 인쇄 컬러 도수, 책 커버 재질, 책 종이 재질, 인쇄 권 수에 따라 실비로 견적을 드립니다.{'\n'}'한권의나'에서는 저자님이 자서전을 받아보시기까지 모든 과정을 함께 하면서도 인쇄는 실비부담을 원칙으로 하여 저자님께서 부담을 느끼시지 않도록 노력하고 있습니다.
                </p>
                <button onClick={() => handleLinkClick('/pricing')}>
                  <Button variant="outline" size="sm" className="border-[#C1A875] text-[#C1A875] hover:bg-[#C1A875] hover:text-white">
                    서비스 가격 상세보기
                  </Button>
                </button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <AccordionTrigger className="px-8 py-6 text-left text-lg font-semibold text-[#2C3E50] hover:no-underline hover:bg-[#FAF8F3]/50 transition-colors">
                Q. 시간은 얼마나 걸리나요?
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-6 text-[#2E2E2E] leading-relaxed text-base">
                <p className="mb-4 whitespace-pre-line">
                  정해진 '한권의나' 제작 과정을 따르면 한 달 만에 자서전을 완성하고 인쇄 주문을 넣게 됩니다.{'\n'}'한권의나'와 함께라면 한 달 뒤에는 평생의 염원이었던 나의 자서전을 품에 안을 수 있게 됩니다.
                </p>
                <button onClick={() => handleLinkClick('/process')}>
                  <Button variant="outline" size="sm" className="border-[#C1A875] text-[#C1A875] hover:bg-[#C1A875] hover:text-white">
                    진행과정 상세보기
                  </Button>
                </button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
};
