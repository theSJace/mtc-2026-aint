import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section id="register" className="py-18 md:py-20 bg-green-deep text-center">
      <div className="max-w-[580px] mx-auto px-6">
        <div className="text-5xl mb-4.5">🤲</div>
        <h2 className="font-playfair text-3xl md:text-4xl text-white mb-3">
          Ready to join the community?
        </h2>
        <p className="text-[15px] text-white/65 mb-9 leading-relaxed">
          Alhamdulillah — may Allah SWT bless your wealth, protect your family, and accept this Sadaqah Jariyah from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
          <Link to="/sign-in">
          <Button variant="gold" size="lg">
            ✦ Daftar Sekarang — Login / Register
          </Button>
        </Link>
          <Button variant="outline" size="lg">
            🕌 Help at Counter
          </Button>
        </div>
        <div className="inline-flex items-center gap-1.5 mt-5.5 text-[11px] text-white/35 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2">
          🔒 PDPA Protected · Official LPM Ar-Raudhah Portal
        </div>
      </div>
    </section>
  )
}