import { useLanguage } from "@/contexts/LanguageContext"

export function Schemes() {
  const { t } = useLanguage()
  return (
    <section id="schemes" className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-green-deep rounded-[28px] p-10 md:p-14 grid md:grid-cols-2 gap-14">
          <div>
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold-light mb-2.5">
              {t.schemes.whatIs}
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl leading-tight text-white mb-3.5">
              {t.schemes.moreThanDonation}<br />
              {t.schemes.promiseFamily}
            </h2>
            <p className="text-[15px] text-white/70 leading-relaxed max-w-[380px]">
              {t.schemes.description}
            </p>
            <div className="mt-6 bg-white/6 border-l-[3px] border-gold rounded-r-[10px] p-4 pr-5 text-sm italic text-white/75 leading-relaxed">
              {t.schemes.quote}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white/8 border border-white/10 rounded-2xl p-5.5">
              <div className="flex justify-between items-start gap-2.5 mb-3">
                <div className="font-playfair text-lg font-semibold text-white">
                  {t.schemes.pintarLabel}
                </div>
                <div className="text-[11px] font-bold bg-gold text-green-deep px-2.5 py-1 rounded-full whitespace-nowrap">
                  {t.schemes.perMonth5}
                </div>
              </div>
              <ul className="flex flex-col gap-1.5">
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  {t.schemes.benefit1}
                </li>
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  {t.schemes.benefit2}
                </li>
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  {t.schemes.benefit3}
                </li>
              </ul>
            </div>

            <div className="bg-gold/15 border border-gold/40 rounded-2xl p-5.5">
              <div className="flex justify-between items-start gap-2.5 mb-3">
                <div className="font-playfair text-lg font-semibold text-white">
                  {t.schemes.pintarPlusLabel}
                </div>
                <div className="text-[11px] font-bold bg-gold text-green-deep px-2.5 py-1 rounded-full whitespace-nowrap">
                  {t.schemes.perMonth20}
                </div>
              </div>
              <ul className="flex flex-col gap-1.5">
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  {t.schemes.plusBenefit1}
                </li>
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  {t.schemes.plusBenefit2}
                </li>
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  {t.schemes.plusBenefit3}
                </li>
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  {t.schemes.plusBenefit4}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
