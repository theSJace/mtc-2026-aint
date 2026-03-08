import { useLanguage } from "@/contexts/LanguageContext"

export function Help() {
  const { t } = useLanguage()
  const features = t.help.features
  return (
    <section id="help" className="py-16 bg-gradient-to-br from-gold-light to-cream-dark">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-13">
          <div>
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2.5">
              {t.help.notSureHow}
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl leading-tight text-brown-warm mb-3.5 whitespace-pre-line">
              {t.help.sitWithYou}
            </h2>
            <p className="text-[15px] text-text-mid leading-relaxed max-w-lg">
              {t.help.staffTrained}
            </p>
            <div className="flex flex-col gap-3.5 mt-6.5">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-3.5 items-start bg-white/65 rounded-xl p-4"
                >
                  <div className="w-9.5 h-9.5 bg-white rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    {["🧓", "👨‍👩‍👧", "📞"][index]}
                  </div>
                  <div>
                    <strong className="block text-[13px] text-brown-warm mb-1">
                      {feature.title}
                    </strong>
                    <p className="text-xs text-text-mid leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 shadow-md text-center">
            <div className="font-playfair text-lg text-green-deep mb-1.5">
              {t.help.contactUs}
            </div>
            <p className="text-xs text-text-light mb-5.5">
              {t.help.weAreHere}
            </p>
            <a
              href="https://wa.me/6598337752"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-cream rounded-xl p-3.5 mb-3 text-left hover:bg-green-pale/30 transition-colors"
            >
              <div className="w-9.5 h-9.5 bg-green-pale rounded-lg flex items-center justify-center text-lg flex-shrink-0">💬</div>
              <div>
                <strong className="block text-[13px] text-green-deep mb-0.5">{t.help.whatsapp}</strong>
                <span className="text-xs text-text-mid">{t.help.whatsappDesc}</span>
              </div>
            </a>
            <a
              href="mailto:arraudhahfin@arraudhah.mosque.sg"
              className="flex items-center gap-3 bg-cream rounded-xl p-3.5 mb-3 text-left hover:bg-green-pale/30 transition-colors"
            >
              <div className="w-9.5 h-9.5 bg-green-pale rounded-lg flex items-center justify-center text-lg flex-shrink-0">📧</div>
              <div>
                <strong className="block text-[13px] text-green-deep mb-0.5">{t.help.email}</strong>
                <span className="text-xs text-text-mid">arraudhahfin@arraudhah.mosque.sg</span>
              </div>
            </a>
            <div className="flex items-center gap-3 bg-cream rounded-xl p-3.5 text-left">
              <div className="w-9.5 h-9.5 bg-green-pale rounded-lg flex items-center justify-center text-lg flex-shrink-0">🕌</div>
              <div>
                <strong className="block text-[13px] text-green-deep mb-0.5">{t.help.visitUs}</strong>
                <span className="text-xs text-text-mid">{t.help.visitUsDesc}</span>
              </div>
            </div>
            <div className="mt-3.5 text-xs text-text-light leading-relaxed">
              <strong className="text-text-mid">{t.help.counterHours}</strong>
              <br />
              {t.help.monFri}
              <br />
              {t.help.sat}
              <br />
              {t.help.closedHolidays}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
