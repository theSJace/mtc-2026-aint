export function Payment() {
  return (
    <section id="payment" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2.5">
          Payment Methods
        </div>
        <h2 className="font-playfair text-3xl md:text-4xl leading-tight text-green-deep mb-3.5">
          Simple, familiar, and interest-free
        </h2>
        <p className="text-[15px] text-text-mid leading-relaxed max-w-lg mb-11">
          Choose what works for you. All options are riba-free and MAS-compliant.
        </p>

        <div className="grid md:grid-cols-[1.1fr_1fr] gap-6">
          {/* PayNow - Recommended */}
          <div className="border-2 border-gold rounded-2xl p-6.5 relative hover:shadow-md transition-shadow">
            <div className="absolute -top-3 left-5.5 bg-gold text-green-deep px-3 py-0.5 rounded-full text-[11px] font-bold">
              ✦ Recommended
            </div>
            <div className="text-3xl mb-2.5">📲</div>
            <div className="font-playfair text-lg text-green-deep mb-2">
              PayNow
            </div>
            <p className="text-[13px] text-text-mid leading-relaxed mb-3.5">
              Scan a personalised QR monthly, or set up a standing instruction once and never think about it again. Instant — no bank delays.
            </p>
            <ul className="flex flex-col gap-2">
              {[
                "We generate your unique PayNow QR (Ref: SPTAR-XXXX)",
                "Scan with any SG banking app (DBS, OCBC, UOB, POSB…)",
                "Payment received instantly with your reference tagged",
                "Or: set up monthly standing instruction once — done!",
              ].map((step, i) => (
                <li key={i} className="flex gap-2 items-start text-[13px] text-text-mid">
                  <div className="w-5 h-5 bg-green-deep text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  {step}
                </li>
              ))}
            </ul>
            <div className="bg-cream rounded-xl p-4.5 text-center mt-4.5">
              <div className="w-[90px] h-[90px] bg-green-deep rounded-lg mx-auto mb-2.5 flex items-center justify-center text-white text-[9px] font-semibold relative overflow-hidden">
                PayNow
                <div className="absolute inset-[7px] bg-[repeating-conic-gradient(rgba(255,255,255,0.18)_0%_25%,transparent_0%_50%)] bg-[length:10px_10px]" />
              </div>
              <div className="text-[11px] text-text-light">
                <strong className="block text-xs text-green-deep mb-0.5">Your Personalised QR Code</strong>
                Generated after registration · Ref: SPTAR-XXXX
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4.5">
            {/* Bank Standing Instruction */}
            <div className="border-2 border-green-pale rounded-2xl p-6.5 hover:border-green-soft hover:shadow-md transition-all">
              <div className="text-3xl mb-2.5">🏦</div>
              <div className="font-playfair text-lg text-green-deep mb-2">
                Bank Standing Instruction
              </div>
              <p className="text-[13px] text-text-mid leading-relaxed mb-3.5">
                Set up automatic monthly PayNow transfers in your own banking app. Cancel anytime.
              </p>
              <ul className="flex flex-col gap-2">
                {[
                  "Open your banking app (DBS/POSB, OCBC, UOB)",
                  "Add Masjid Ar-Raudhah's PayNow UEN as a favourite",
                  "Set recurring monthly transfer with your SPTAR reference",
                ].map((step, i) => (
                  <li key={i} className="flex gap-2 items-start text-[13px] text-text-mid">
                    <div className="w-5 h-5 bg-green-deep text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cash at Counter */}
            <div className="border-2 border-green-pale rounded-2xl p-6.5 hover:border-green-soft hover:shadow-md transition-all">
              <div className="text-3xl mb-2.5">💵</div>
              <div className="font-playfair text-lg text-green-deep mb-2">
                Cash at Counter
              </div>
              <p className="text-[13px] text-text-mid leading-relaxed mb-3.5">
                Prefer to pay in person? Walk in during opening hours — staff record your payment immediately.
              </p>
              <ul className="flex flex-col gap-2">
                {[
                  "Visit mosque counter during opening hours",
                  "Quote your membership number (SPTAR-XXXX)",
                  "Receive official receipt and instant status update",
                ].map((step, i) => (
                  <li key={i} className="flex gap-2 items-start text-[13px] text-text-mid">
                    <div className="w-5 h-5 bg-green-deep text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {step}
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