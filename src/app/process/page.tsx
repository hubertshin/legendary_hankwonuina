import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MessageCircle, Mic, PenTool, Eye, Camera, Palette, BookOpen } from "lucide-react";
const ProcessPage = () => {
  const steps = [{
    emoji: "🕊️",
    title: "1단계",
    subtitle: "사전 상담",
    description: "카카오톡으로 어떤 자서전을 만들고 싶은지 편하게 상담합니다.\n담당 매니저 배정과 서비스료 결제가 진행됩니다."
  }, {
    emoji: "🎤",
    title: "2단계",
    subtitle: "인터뷰",
    description: "온라인 화상미팅을 통해 총 3~4시간 정도 진솔하게 삶을 들려주시면 됩니다."
  }, {
    emoji: "✍️",
    title: "3단계",
    subtitle: "원고 집필",
    description: "담당 매니저가 인터뷰 내용을 토대로 한 권의 자서전으로 정리합니다."
  }, {
    emoji: "👀",
    title: "4단계",
    subtitle: "퇴고 및 추가 인터뷰",
    description: "2-3회에 걸쳐 원고를 수정하고 추가하고 싶은 내용을 추가 인터뷰합니다."
  }, {
    emoji: "📸",
    title: "5단계",
    subtitle: "사진 수집",
    description: "자서전에 담을 사진을 골라 매니저에게 전달합니다."
  }, {
    emoji: "🎨",
    title: "6단계",
    subtitle: "표지 디자인 및 탈고",
    description: "자서전 제목과 표지 디자인을 결정하고 최종 원고를 확정합니다.\n하드커버/소프트커버, 인쇄 부수에 따라 인쇄 비용이 결정됩니다.\n인쇄 비용은 이 단계에서 결제합니다."
  }, {
    emoji: "📕",
    title: "7단계",
    subtitle: "인쇄 및 납본",
    description: "책으로 만들어진 자서전이 배송됩니다."
  }];
  const challenges = ["삶을 정리하는 일은 혼자서 감당하기 어렵습니다.", "진짜 이야기를 끌어낼 인터뷰 기술이 없으면, 이야기의 깊이가 드러나기 어렵습니다.", "초고, 퇴고, 편집, 교정, 디자인, 인쇄까지— 복잡하고 시간도 오래 걸립니다."];
  const innovations = [{
    emoji: "📚",
    text: "수백 권의 자서전을 연구하며 쌓은 전문 인터뷰 노하우"
  }, {
    emoji: "🎙️",
    text: "음성 기반 인터뷰로 감동적인 책을 제작하는 특수 AI 모델 자체 개발"
  }, {
    emoji: "🛠️",
    text: "기획부터 원고, 디자인, 인쇄까지 '원스톱' 자서전 제작 경험 제공"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-[#FAF8F3] to-[#C1A875]/10">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* 메인 제목 */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-[#2E2E2E] mb-6">
              진행과정
            </h1>
            <p className="text-xl text-[#2E2E2E]/80">한 달 안에 당신만의 이야기가 담긴
품격 있는 자서전이 완성됩니다.</p>
          </div>

          {/* 단계별 진행 과정 */}
          <div className="max-w-6xl mx-auto mb-20">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {steps.map((step, index) => <div key={index} className="relative bg-white rounded-3xl p-4 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-[#C1A875]/50" style={{
              background: `linear-gradient(135deg, rgba(193, 168, 117, 0.08) 0%, rgba(44, 62, 80, 0.05) 100%)`
            }}>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl animate-bounce flex-shrink-0" style={{
                  animationDelay: `${index * 0.1}s`
                }}>
                      {step.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {step.title}
                        </div>
                        <h3 className="text-base font-bold text-[#2E2E2E]">
                          {step.subtitle}
                        </h3>
                      </div>
                      <p className="text-[#2E2E2E]/80 leading-relaxed text-sm whitespace-pre-line">
                       {step.description}
                     </p>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>

          {/* 자서전 제작이 어려웠던 이유 */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#2E2E2E]">
              자서전 제작이 어려웠던 이유
            </h2>
            <div className="space-y-6">
              {challenges.map((challenge, index) => <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#C1A875] hover:shadow-xl transform hover:-translate-x-2 transition-all duration-300">
                  <div className="flex items-start">
                    <div className="bg-[#C1A875]/20 text-[#2C3E50] rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-[#2E2E2E] leading-relaxed">
                      {challenge}
                    </p>
                  </div>
                </div>)}
            </div>
          </div>

          {/* 한권의나의 혁신적인 접근 */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#2E2E2E]">
              '한권의 나'의 혁신적인 접근
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {innovations.map((innovation, index) => <div key={index} className="bg-white rounded-3xl p-8 md:text-center shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex md:flex-col items-center md:items-center text-left md:text-center" style={{
              background: `linear-gradient(135deg, rgba(193, 168, 117, 0.1) 0%, rgba(44, 62, 80, 0.05) 100%)`
            }}>
                  <div className="text-4xl md:text-5xl mb-0 md:mb-6 mr-4 md:mr-0 flex-shrink-0">
                    {innovation.emoji}
                  </div>
                  <p className="text-[#2E2E2E] font-medium leading-relaxed flex-1">
                    {innovation.text}
                  </p>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default ProcessPage;
