import { Hero } from "@/components/Hero";
import { BrandStoryIntro } from "@/components/BrandStoryIntro";
import { Features } from "@/components/Features";
import { Process } from "@/components/Process";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F3] to-[#C1A875]/10">
      <Header />
      <Hero />
      <BrandStoryIntro />
      <Features />
      <Process />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
