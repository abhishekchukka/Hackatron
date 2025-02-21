import Image from "next/image";
import Login from "./components/Login";
import { HeroSection } from "@/components/hero-section";
import { Features } from "@/components/features";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="">
      <div className="">
        <HeroSection />
        <Features />
        <Testimonials />
        <Footer />
      </div>
    </div>
  );
}
