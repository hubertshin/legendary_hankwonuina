'use client';

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export const Footer = () => {
  const router = useRouter();

  const handleLinkClick = (path: string) => {
    router.push(path);
    window.scrollTo(0, 0);
  };

  const handleFAQClick = () => {
    router.push('/');
    setTimeout(() => {
      const faqElement = document.querySelector('#faq');
      if (faqElement) {
        faqElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <footer className="bg-[#2E2E2E] text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/lovable-uploads/32760d4e-6290-41fc-aacf-1898f668c43e.png" alt="한권의나 로고" className="h-12 w-12" />
              <span className="text-2xl font-bold">한권의나</span>
            </div>
            <p className="text-white/70 mb-4 leading-relaxed">
              당신의 삶을 품격있게 기록하고, 사랑하는 이들에게 전하는 한 권의 유산을 만드는 여정을 시작하세요.
            </p>
            <div className="flex space-x-4">
              <a href="http://pf.kakao.com/_xabkWn/chat" target="_blank" rel="noopener noreferrer">
                <button className="bg-[#FEE500] text-black px-3 py-1 rounded-lg text-sm font-medium hover:bg-[#FFDC00] transition-colors flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  카카오톡 문의
                </button>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">서비스</h3>
            <ul className="space-y-2 text-white/70">
              <li><button onClick={() => handleLinkClick('/brand-story')} className="hover:text-white transition-colors">브랜드 스토리</button></li>
              <li><button onClick={() => handleLinkClick('/process')} className="hover:text-white transition-colors">진행과정</button></li>
              <li><button onClick={() => handleLinkClick('/samples')} className="hover:text-white transition-colors">자서전 샘플</button></li>
              <li><button onClick={() => handleLinkClick('/pricing')} className="hover:text-white transition-colors">서비스 가격</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">고객지원</h3>
            <ul className="space-y-2 text-white/70">
              <li><button onClick={handleFAQClick} className="hover:text-white transition-colors">자주 묻는 질문</button></li>
              <li><button onClick={() => handleLinkClick('/consultation')} className="hover:text-white transition-colors">상담하기</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center text-white/70">
          <div className="mb-4 text-sm">
            <p>상호: 에임와이즈 | 사업자번호: 407-07-66575</p>
            <p>소재지: 경기도 양주시 부흥로 1936, 405호</p>
          </div>
          <p>&copy; 2025 한권의나 All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
