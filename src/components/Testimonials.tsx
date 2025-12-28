'use client';

import { Star, Quote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const testimonials = [
  {
    name: "김**",
    age: "5명의 손자를 둔 할머니",
    image: "photo-1649972904349-6e44c42644a7",
    rating: 5,
    text: "처음엔 긴장했지만, 인터뷰가 끝난 후 인생이 정리된 느낌이었어요. 주부의 인생이 무엇이 있을까 했지만 막상 한권의 책으로 정리해보니 가족에게 제 인생을 선물한 기분입니다."
  },
  {
    name: "박**",
    age: "은퇴한 교사",
    image: "photo-1488590528505-98d2b5aba04b",
    rating: 5,
    text: "딸이랑 함께 초고 원고를 읽으며 몇 번이고 울고 웃었어요. 내 인생이 이렇게 한 편의 영화처럼 보일 줄은 상상도 못했었는데 말이죠."
  },
  {
    name: "설*",
    age: "선생님",
    image: "photo-1581091226825-a6a2a5aee158",
    rating: 5,
    text: "3시간 인터뷰하고 나서는 너무 평범한 내용들인데 책이 만들어질까 고민되었어요. 그런데 원고를 받아보니 내 이야기가 너무나 잘 정리되어 있더군요. 이렇게 인생을 정리해보니 앞으로 남은 인생을 더 잘 살아갈 준비가 되었어요."
  }
];

export const Testimonials = () => {
  const router = useRouter();

  const handleLinkClick = (path: string) => {
    router.push(path);
    window.scrollTo(0, 0);
  };
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#2E2E2E] mb-6">
            자서전 제작 후기
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-[#FAF8F3] rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 relative"
            >
              <Quote className="h-8 w-8 text-[#C1A875]/30 mb-4" />
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-[#C1A875] fill-current" />
                ))}
              </div>

              <p className="text-[#2E2E2E]/90 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              <div className="flex items-center">
                <img 
                  src={`https://images.unsplash.com/${testimonial.image}?w=150&h=150&fit=crop&crop=face`}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-[#2E2E2E]">{testimonial.name}</h4>
                  <p className="text-[#2E2E2E]/70 text-sm">{testimonial.age}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center w-full">
          <button onClick={() => handleLinkClick('/samples')}>
            <Button 
              size="lg" 
              className="relative bg-gradient-to-r from-[#C1A875] via-[#D4B87E] to-[#C1A875] hover:from-[#B5965E] hover:via-[#C9A86B] hover:to-[#B5965E] text-white text-lg px-10 py-5 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border-2 border-[#C1A875]/30 hover:border-[#B5965E]/50 group overflow-hidden w-auto"
            >
              <span className="relative z-10 flex items-center justify-center">
                제작 샘플 읽어보기
                <ArrowRight className="ml-3 h-6 w-6 transform group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </button>
        </div>
      </div>
    </section>
  );
};
