
import { MessageCircle, Clock, Users, Shield, BookOpen, Heart } from "lucide-react";

const questions = [
  {
    text: "혼자 자서전을 쓰려면 몇 년씩 걸리지 않을까요?",
    emoji: "⁉️"
  },
  {
    text: "책 검수, 인쇄, 디자인 아무것도 모르는데 어떡하죠?",
    emoji: ""
  }
];

const features = [
  {
    icon: MessageCircle,
    title: "1:1 전문 인터뷰",
    description: "편안한 대화를 통해 당신의 소중한 이야기를 자연스럽게 끌어내어 정리합니다."
  },
  {
    icon: BookOpen,
    title: "전문 작가 집필",
    description: "경험 많은 집필진이 당신의 이야기를 감동적인 책으로 완성해드립니다."
  },
  {
    icon: Shield,
    title: "품질 보장",
    description: "완성도 높은 편집과 디자인으로 평생 간직할 수 있는 품격 있는 책을 제작합니다."
  },
  {
    icon: Heart,
    title: "맞춤형 서비스",
    description: "개인의 특성과 요구사항을 반영한 완전 맞춤형 자서전 제작 서비스입니다."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#2E2E2E] mb-6">
            왜 자서전 제작 서비스가 필요할까요?
          </h2>
        </div>

        {/* 질문 섹션 */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center">
            <div className="relative flex flex-col items-center space-y-1 p-6">
              <div className="text-6xl animate-bounce mb-2">
                ⁉️
              </div>
              <div className="relative">
                <span className="text-5xl text-gray-500 font-serif absolute -left-6 -top-2">"</span>
                <div className="px-8">
                  <p className="text-xl text-gray-700 font-medium leading-relaxed italic">
                    혼자 자서전을 쓰려면 몇 년씩 걸리지 않을까요?
                  </p>
                  <p className="text-xl text-gray-700 font-medium leading-relaxed italic">
                    책 검수, 인쇄, 디자인 아무것도 모르는데 어떡하죠?
                  </p>
                </div>
                <span className="text-5xl text-gray-500 font-serif absolute -right-6 -bottom-2">"</span>
              </div>
            </div>
          </div>
        </div>

        {/* 솔루션 섹션 */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[#C1A875]/20">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#C1A875] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#2E2E2E] mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-[#2E2E2E]/80 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
