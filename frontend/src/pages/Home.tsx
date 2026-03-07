import { Navbar } from "@/components/Navbar"
import { Hero } from "@/components/Hero"
import { Schemes } from "@/components/Schemes"
import { HowItWorks } from "@/components/HowItWorks"
import { Payment } from "@/components/Payment"
import { Help } from "@/components/Help"
import { FAQ } from "@/components/FAQ"
import { CTA } from "@/components/CTA"
import { Footer } from "@/components/Footer"
import { WhatsAppButton } from "@/components/WhatsAppButton"

export function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[66px]">
        <Hero />
        <Schemes />
        <HowItWorks />
        <Payment />
        <Help />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
