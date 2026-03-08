import { useLanguage } from "@/contexts/LanguageContext"

const PAYNOW_STEPS = ["paynowStep1", "paynowStep2", "paynowStep3", "paynowStep4"] as const
const BANK_STEPS = ["bankStep1", "bankStep2", "bankStep3"] as const
const CASH_STEPS = ["cashStep1", "cashStep2", "cashStep3"] as const

export function Payment() {
  const { t } = useLanguage()
  const p = t.paymentSection
  return (
    <section id="payment" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2.5">
          {p.paymentMethods}
        </div>
        <h2 className="font-playfair text-3xl md:text-4xl leading-tight text-green-deep mb-3.5">
          {p.simpleFamiliar}
        </h2>
        <p className="text-[15px] text-text-mid leading-relaxed max-w-lg mb-11">
          {p.chooseRibaFree}
        </p>

        <div className="grid md:grid-cols-[1.1fr_1fr] gap-6">
          <div className="border-2 border-gold rounded-2xl p-6.5 relative hover:shadow-md transition-shadow">
            <div className="absolute -top-3 left-5.5 bg-gold text-green-deep px-3 py-0.5 rounded-full text-[11px] font-bold">
              {p.recommended}
            </div>
            <div className="text-3xl mb-2.5">📲</div>
            <div className="font-playfair text-lg text-green-deep mb-2">{p.paynow}</div>
            <p className="text-[13px] text-text-mid leading-relaxed mb-3.5">
              {p.paynowDesc}
            </p>
            <ul className="flex flex-col gap-2">
              {PAYNOW_STEPS.map((key, i) => (
                <li key={key} className="flex gap-2 items-start text-[13px] text-text-mid">
                  <div className="w-5 h-5 bg-green-deep text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  {p[key]}
                </li>
              ))}
            </ul>
            <div className="bg-cream rounded-xl p-4.5 text-center mt-4.5">
              <div className="w-[90px] h-[90px] bg-green-deep rounded-lg mx-auto mb-2.5 flex items-center justify-center text-white text-[9px] font-semibold relative overflow-hidden">
                {p.paynow}
                <div className="absolute inset-[7px] bg-[repeating-conic-gradient(rgba(255,255,255,0.18)_0%_25%,transparent_0%_50%)] bg-[length:10px_10px]" />
              </div>
              <div className="text-[11px] text-text-light">
                <strong className="block text-xs text-green-deep mb-0.5">{p.yourPersonalisedQR}</strong>
                {p.generatedAfterReg}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4.5">
            <div className="border-2 border-green-pale rounded-2xl p-6.5 hover:border-green-soft hover:shadow-md transition-all">
              <div className="text-3xl mb-2.5">🏦</div>
              <div className="font-playfair text-lg text-green-deep mb-2">{p.bankStanding}</div>
              <p className="text-[13px] text-text-mid leading-relaxed mb-3.5">
                {p.bankStandingDesc}
              </p>
              <ul className="flex flex-col gap-2">
                {BANK_STEPS.map((key, i) => (
                  <li key={key} className="flex gap-2 items-start text-[13px] text-text-mid">
                    <div className="w-5 h-5 bg-green-deep text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {p[key]}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-2 border-green-pale rounded-2xl p-6.5 hover:border-green-soft hover:shadow-md transition-all">
              <div className="text-3xl mb-2.5">💵</div>
              <div className="font-playfair text-lg text-green-deep mb-2">{p.cashAtCounter}</div>
              <p className="text-[13px] text-text-mid leading-relaxed mb-3.5">
                {p.cashDesc}
              </p>
              <ul className="flex flex-col gap-2">
                {CASH_STEPS.map((key, i) => (
                  <li key={key} className="flex gap-2 items-start text-[13px] text-text-mid">
                    <div className="w-5 h-5 bg-green-deep text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {p[key]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
