
import { HeroSection } from "@/components/hero-section";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import Developers from "./components/Developers";

export default function Home() {
  return (
    <div className="">
      <div className="">
        <HeroSection />
        <Features />
        <Developers/>
        <Footer />
      </div>
    </div>
  );
}
