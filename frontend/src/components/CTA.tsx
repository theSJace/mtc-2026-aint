import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"

export function CTA() {
  const { t } = useLanguage()
  return (
    <section id="register" className="py-18 md:py-20 bg-green-deep text-center">
      <div className="max-w-[580px] mx-auto px-6">
        <div className="text-5xl mb-4.5">🤲</div>
        <h2 className="font-playfair text-3xl md:text-4xl text-white mb-3">
          {t.cta.readyToJoin}
        </h2>
        <p className="text-[15px] text-white/65 mb-9 leading-relaxed">
          {t.cta.alhamdulillah}
        </p>
        <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
          <Link to="/sign-in">
            <Button variant="gold" size="lg">
              {t.cta.daftarSekarang}
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            {t.cta.helpAtCounter}
          </Button>
        </div>
        <div className="inline-flex items-center gap-1.5 mt-5.5 text-[11px] text-white/35 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2">
          {t.cta.pdpaPortal}
        </div>
      </div>
    </section>
  )
}
