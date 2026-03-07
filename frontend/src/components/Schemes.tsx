export function Schemes() {
  return (
    <section id="schemes" className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-green-deep rounded-[28px] p-10 md:p-14 grid md:grid-cols-2 gap-14">
          {/* Left Content */}
          <div>
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold-light mb-2.5">
              What is Skim Pintar?
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl leading-tight text-white mb-3.5">
              More than a donation.<br />
              A promise to your family.
            </h2>
            <p className="text-[15px] text-white/70 leading-relaxed max-w-[380px]">
              As a regular donor to Masjid Ar-Raudhah's building fund, the mosque provides full urusan jenazah services for you and your loved ones — free of charge. Community gotong royong, not insurance.
            </p>
            <div className="mt-6 bg-white/6 border-l-[3px] border-gold rounded-r-[10px] p-4 pr-5 text-sm italic text-white/75 leading-relaxed">
              "This is Sadaqah Jariyah — continuous charity. Your contribution, however small, keeps the mosque running and the community cared for."
            </div>
          </div>
          
          {/* Right - Scheme Cards */}
          <div className="flex flex-col gap-4">
            {/* Skim Pintar */}
            <div className="bg-white/8 border border-white/10 rounded-2xl p-5.5">
              <div className="flex justify-between items-start gap-2.5 mb-3">
                <div className="font-playfair text-lg font-semibold text-white">
                  Skim Pintar
                </div>
                <div className="text-[11px] font-bold bg-gold text-green-deep px-2.5 py-1 rounded-full whitespace-nowrap">
                  $5 / month
                </div>
              </div>
              <ul className="flex flex-col gap-1.5">
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  Free urusan jenazah (ritual bathing, shrouding, burial, transport)
                </li>
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  20% discount on Masjid Ar-Raudhah religious courses
                </li>
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  Immediate activation upon first payment
                </li>
              </ul>
            </div>
            
            {/* Skim Pintar Plus */}
            <div className="bg-gold/15 border border-gold/40 rounded-2xl p-5.5">
              <div className="flex justify-between items-start gap-2.5 mb-3">
                <div className="font-playfair text-lg font-semibold text-white">
                  Skim Pintar Plus
                </div>
                <div className="text-[11px] font-bold bg-gold text-green-deep px-2.5 py-1 rounded-full whitespace-nowrap">
                  $20+ / month
                </div>
              </div>
              <ul className="flex flex-col gap-1.5">
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  All Pintar benefits for you, plus family members at same address
                </li>
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  50% course discount for parents & in-laws
                </li>
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  Cover up to 10 dependants (spouse, children, parents, in-laws, siblings)
                </li>
                <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                  <span className="text-gold-light text-[9px] mt-1">✦</span>
                  Donate more — $30, $50, or any amount above $20
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}