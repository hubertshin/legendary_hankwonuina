'use client';

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, Star, Gift, Clock, FileImage, Edit3, FileText, Package, Palette } from "lucide-react";
import { useRouter } from "next/navigation";

const Pricing = () => {
  const router = useRouter();

  const handleConsultationClick = () => {
    router.push('/consultation');
    window.scrollTo(0, 0);
  };
  const comparisonItems = [
    { icon: FileText, label: "페이지 수", mini: "약 50페이지", standard: "약 100페이지", premium: "약 200페이지" },
    { icon: FileImage, label: "사진 삽입", mini: "최대 10장", standard: "최대 30장", premium: "최대 60장" },
    { icon: Edit3, label: "전문 집필진 참여", mini: "포함", standard: "포함", premium: "포함" },
    { icon: Clock, label: "작업 기간", mini: "약 3주", standard: "약 1개월", premium: "약 1개월" },
    { icon: FileText, label: "인쇄용 PDF 파일", mini: "미제공", standard: "미제공", premium: "제공", highlight: true },
    { icon: Palette, label: "일러스트 이미지 추가", mobileLabel: "일러스트 이미지 추가", mini: "미포함", standard: "미포함", premium: "포함 (각 장당 1컷)", mobilePremium: "포함<br/><span class='text-sm'>(각 장당 1컷)</span>", highlight: true },
    { icon: Package, label: "선물용 책 포장", mini: "미포함", standard: "미포함", premium: "포함 (북케이스 포장 10권)", mobilePremium: "포함<br/><span class='text-sm'>(북케이스 포장 10권)</span>", highlight: true }
  ];

  const plans = [
    {
      name: "미니 에디션",
      price: "880,000",
      popular: false,
      description: "간결하게 담아내는 나의 이야기"
    },
    {
      name: "스탠다드 에디션",
      price: "1,490,000",
      popular: false,
      description: "나만의 이야기를 담은 기본 자서전"
    },
    {
      name: "프리미엄 에디션",
      price: "3,300,000",
      popular: true,
      description: "완성도 높은 고급 자서전 제작 서비스"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F3] to-[#C1A875]/10">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-[#2C3E50] to-[#C1A875] bg-clip-text text-transparent mb-6">
              자서전제작 서비스 가격
            </h1>
            <p className="text-xl text-[#2E2E2E] leading-relaxed">
              <span className="hidden md:inline">당신의 소중한 이야기가 담긴 품격있는 자서전을 제작합니다.</span>
              <span className="md:hidden">당신의 소중한 이야기가 담긴<br />품격있는 자서전을 제작합니다.</span>
            </p>
          </div>

          {/* Desktop Comparison Table */}
          <div className="hidden md:block bg-white rounded-3xl shadow-2xl overflow-hidden mb-16">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2C3E50] to-emerald-600 p-8">
              <div className="grid grid-cols-4 gap-6 text-white">
                <div className="text-center flex items-center justify-center">
                  <h3 className="text-xl font-bold mb-2">구분</h3>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">미니 에디션</h3>
                  <p className="text-sm opacity-90">간결하게 담아내는 나의 이야기</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">스탠다드 에디션</h3>
                  <p className="text-sm opacity-90">부담없이 나만의 이야기를 담은 자서전</p>
                </div>
                <div className="text-center relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-color-pulse">
                      <Star className="h-3 w-3" />
                      인기
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">프리미엄 에디션</h3>
                  <p className="text-sm opacity-90">다채로운 이야기를 담은 방대한 자서전</p>
                </div>
              </div>
            </div>

            {/* Price Row */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b-2 border-emerald-200">
              <div className="grid grid-cols-4 gap-6 items-center">
                <div className="text-center">
                  <h4 className="text-lg font-bold text-[#2C3E50]">부가세 포함</h4>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#2C3E50] mb-1">88만원</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#2C3E50] mb-1">149만원</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-1">330만원</div>
                </div>
              </div>
            </div>

            {/* Comparison Items */}
            {comparisonItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className={`p-6 border-b border-gray-100 ${item.highlight ? 'bg-gradient-to-r from-emerald-50 to-teal-50' : ''}`}>
                  <div className="grid grid-cols-4 gap-6 items-center">
                    <div className="flex items-center justify-center">
                      <IconComponent className={`h-6 w-6 mr-3 ${item.highlight ? 'text-emerald-600' : 'text-[#C1A875]'}`} />
                       <span className={`font-semibold ${item.highlight ? 'text-emerald-700' : 'text-[#2C3E50]'}`}>
                         {item.label}
                       </span>
                    </div>
                    <div className="text-center">
                      <span className={`text-lg ${item.mini === '미제공' || item.mini === '미포함' ? 'text-gray-400' : 'text-[#2C3E50] font-medium'}`}>
                        {item.mini}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className={`text-lg ${item.standard === '미제공' || item.standard === '미포함' ? 'text-gray-400' : 'text-[#2C3E50] font-medium'}`}>
                        {item.standard}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className={`text-lg font-medium ${item.highlight ? 'text-emerald-600 font-bold' : 'text-[#2C3E50]'}`}>
                        {item.premium}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CTA Button */}
            <div className="p-8 bg-gray-50">
              <div className="text-center">
                <Button
                  onClick={handleConsultationClick}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 px-16 text-xl font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                >
                  상담 신청하기
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-8 mb-16">
            {/* Mini Edition */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#8B7355] to-[#A08060] p-6 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">미니 에디션</h3>
                <p className="text-sm opacity-90">간결하게 담아내는 나의 이야기</p>
                <div className="mt-4">
                  <div className="text-3xl font-bold">88만원</div>
                  <p className="text-sm opacity-90">부가세 포함</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {comparisonItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3">
                       <IconComponent className="h-5 w-5 text-[#C1A875]" />
                       <span className="font-medium text-[#2C3E50]">
                         <span className="md:hidden" dangerouslySetInnerHTML={{__html: item.mobileLabel || item.label}}></span>
                         <span className="hidden md:inline">{item.label}</span>
                       </span>
                      <span className={`ml-auto text-lg font-medium ${item.mini === '미제공' || item.mini === '미포함' ? 'text-gray-400' : 'text-[#2C3E50]'}`}>
                        {item.mini}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Standard Edition */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#2C3E50] to-slate-600 p-6 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">스탠다드 에디션</h3>
                <p className="text-sm opacity-90">나만의 이야기를 담은 기본 자서전</p>
                <div className="mt-4">
                  <div className="text-3xl font-bold">149만원</div>
                  <p className="text-sm opacity-90">부가세 포함</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {comparisonItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3">
                       <IconComponent className="h-5 w-5 text-[#C1A875]" />
                       <span className="font-medium text-[#2C3E50]">
                         <span className="md:hidden" dangerouslySetInnerHTML={{__html: item.mobileLabel || item.label}}></span>
                         <span className="hidden md:inline">{item.label}</span>
                       </span>
                      <span className={`ml-auto text-lg font-medium ${item.standard === '미제공' || item.standard === '미포함' ? 'text-gray-400' : 'text-[#2C3E50]'}`}>
                        {item.standard}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Premium Edition */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center relative">
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                  <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-color-pulse">
                    <Star className="h-3 w-3" />
                    인기
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 mt-2">프리미엄 에디션</h3>
                <p className="text-sm opacity-90">다채로운 이야기를 담은 방대한 자서전</p>
                <div className="mt-4">
                  <div className="text-3xl font-bold">330만원</div>
                  <p className="text-sm opacity-90">부가세 포함</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {comparisonItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${item.highlight ? 'bg-gradient-to-r from-emerald-50 to-teal-50' : ''}`}>
                       <IconComponent className={`h-5 w-5 ${item.highlight ? 'text-emerald-600' : 'text-[#C1A875]'}`} />
                       <span className={`font-medium ${item.highlight ? 'text-emerald-700' : 'text-[#2C3E50]'}`}>
                         <span className="md:hidden" dangerouslySetInnerHTML={{__html: item.mobileLabel || item.label}}></span>
                         <span className="hidden md:inline">{item.label}</span>
                       </span>
                       <span className={`ml-auto text-lg font-medium text-right ${item.highlight ? 'text-emerald-600 font-bold' : 'text-[#2C3E50]'}`}>
                         <span className="md:hidden" dangerouslySetInnerHTML={{__html: item.mobilePremium || item.premium}}></span>
                         <span className="hidden md:inline">{item.premium}</span>
                       </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile CTA Button */}
            <div className="text-center">
              <Button
                onClick={handleConsultationClick}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-xl font-bold rounded-xl shadow-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-emerald-400/30"
              >
                상담 신청하기
              </Button>
            </div>
          </div>

          {/* Special Offer Section */}
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-3xl p-8 mb-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-20 -translate-x-20"></div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Gift className="h-5 w-5" />
                <span className="font-bold text-lg">런칭 기념 한정 혜택</span>
              </div>

              <h3 className="text-3xl lg:text-4xl font-bold mb-4">지금 신청하시면</h3>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 mb-6 max-w-2xl mx-auto">
                <p className="text-2xl lg:text-3xl font-bold mb-2">자서전 고급 양장본 <br className="md:hidden" /><span className="text-4xl lg:text-5xl text-yellow-300 font-black">30권</span>을</p>
                <p className="text-3xl lg:text-4xl font-black"><span className="text-yellow-300">무료로 인쇄</span><br className="md:hidden" /><span className="text-white">해드립니다🎁</span></p>
              </div>

              <p className="text-xl mb-4">'한권의나' 서비스 런칭 기념으로</p>
              <p className="text-xl mb-6">고급 양장본 30권 인쇄비를 <br className="md:hidden" />한권의나에서 <span className="font-bold text-yellow-300">전액 부담</span>합니다.</p>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-gray-800">혜택 기간</span>
                  </div>
                  <p className="text-base text-gray-700">10월 30일까지 한 달간</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-gray-800">제공 내용</span>
                  </div>
                  <p className="text-base text-gray-700">하드커버 자서전 30권 인쇄비(35만원 상당) 전액 무료</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-gray-800">추가 안내</span>
                  </div>
                  <p className="text-base text-gray-700">추가 인쇄 시 실비로 제공됩니다</p>
                </div>
              </div>
            </div>
          </div>


        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
