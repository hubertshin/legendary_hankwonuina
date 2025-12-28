import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock, MessageCircle, Calendar } from "lucide-react";
const Consultation = () => {
  return <div className="min-h-screen bg-gradient-to-br from-[#FAF8F3] to-[#C1A875]/10">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-[#2C3E50] mb-6">
              상담하기
            </h1>
            <p className="text-xl text-[#2E2E2E] leading-relaxed">
              삶을 기록하고 품격을 남기는 일<br />
              지금 바로 상담하고 자서전 제작 여정을 시작하세요.
            </p>
          </div>

          {/* 카카오톡 상담 메인 CTA */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-12 text-center shadow-2xl">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
                  <svg viewBox="0 0 24 24" className="w-12 h-12" fill="#3C1E1E">
                    <path d="M12 3C7.03 3 3 6.6 3 11.1c0 2.4 1.2 4.6 3.1 6.1L5.6 21l4.5-2.4c.6.1 1.3.2 1.9.2 4.97 0 9-3.6 9-8.1S16.97 3 12 3z"/>
                  </svg>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-[#3C1E1E] mb-4">
                  카카오톡 무료상담💬
                </h2>
                <p className="text-lg text-[#3C1E1E] mb-8">
                  카카오톡으로 간편하게 상담받고<br />
                  <span className="font-bold">특별 혜택까지 받아보세요!</span>
                </p>
              </div>

              <Button
                size="lg"
                className="bg-[#3C1E1E] hover:bg-[#2C1515] text-white text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 rounded-full shadow-lg transform hover:scale-105 transition-all w-full sm:w-auto"
                asChild
              >
                <a href="http://pf.kakao.com/_xabkWn/chat" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-6 w-6 mr-3" />
                  카카오톡으로 상담받기
                </a>
              </Button>

              <div className="mt-6 flex items-center justify-center gap-4 text-[#3C1E1E]">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">평일 09:00-18:00</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">빠른 응답</span>
                </div>
              </div>
            </div>
          </div>

          {/* 상담 프로세스 */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-[#2C3E50] to-[#4C5C47] text-white rounded-3xl p-12 shadow-2xl">
              <h3 className="text-xl font-bold mb-4">상담 프로세스</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 min-w-6 min-h-6 bg-[#C1A875] rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">1</div>
                  <div>
                    <div className="font-medium">카카오톡 채팅으로 상담을 시작해주세요.</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 min-w-6 min-h-6 bg-[#C1A875] rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">2</div>
                  <div>
                    <div className="font-medium">한권의나 상담원이 일정 조율과 필요시 전화 상담을 진행합니다.</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 min-w-6 min-h-6 bg-[#C1A875] rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">3</div>
                  <div>
                    <div className="font-medium">자서전 저자의 목적에 맞는 제작 서비스를 맞춤 제안해드립니다.</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 min-w-6 min-h-6 bg-[#C1A875] rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">4</div>
                  <div>
                    <div className="font-medium">자서전 제작을 위한 준비를 시작합니다.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Consultation;
