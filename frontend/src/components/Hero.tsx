import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="bg-cream pt-0">
      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-green-pale text-green-mid px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5 border border-green-soft/30">
              <span className="w-1.5 h-1.5 bg-green-soft rounded-full animate-pulse" />
              Penderma Tetap Ar-Raudhah · 18 Years of Community Care
            </div>
            
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl leading-tight text-green-deep mb-5">
              Jaga Diri,<br />
              Jaga Keluarga,<br />
              Jaga <em className="text-gold not-italic">Komuniti</em>
            </h1>
            
            <p className="text-base text-text-mid leading-relaxed mb-8 max-w-lg">
              Skim Pintar is Masjid Ar-Raudhah's community donation scheme. With a monthly contribution as low as $5, you and your family receive full urusan jenazah (funeral) services — powered by the spirit of <em>gotong royong</em>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-9">
              <Link to="/sign-in"><Button>✦ Login / Register</Button></Link>
              <Button variant="secondary">🕌 Help at Counter</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-xs text-text-light">
                <div className="w-6.5 h-6.5 bg-green-pale rounded-full flex items-center justify-center text-sm">
                  🔒
                </div>
                PDPA Protected
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-light">
                <div className="w-6.5 h-6.5 bg-green-pale rounded-full flex items-center justify-center text-sm">
                  ✅
                </div>
                Shariah-compliant
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-light">
                <div className="w-6.5 h-6.5 bg-green-pale rounded-full flex items-center justify-center text-sm">
                  ⚡
                </div>
                Active in {"<"}24hrs
              </div>
            </div>
          </div>
          
          {/* Right Visual - Card */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-full max-w-[370px] h-[410px]">
              {/* Background Cards */}
              <div className="absolute w-[88%] h-[92%] top-[8%] left-[8%] bg-gradient-to-br from-green-mid to-green-deep rounded-3xl shadow-lg transform rotate-[5deg]" />
              <div className="absolute w-[90%] h-[94%] top-[4%] left-[4%] bg-gold-light rounded-3xl opacity-40 transform rotate-[2.5deg]" />
              
              {/* Main Card */}
              <div className="absolute top-0 left-0 w-[92%] h-[96%] bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-3.5">
                <div className="w-13 h-13 bg-green-deep rounded-xl flex items-center justify-center text-2xl">
                  🕌
                </div>
                <div>
                  <div className="font-playfair text-lg font-semibold text-green-deep">Skim Pintar</div>
                  <div className="text-[11px] text-text-light">Masjid Ar-Raudhah — Active Members</div>
                </div>
                
                <div className="bg-green-pale rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-text-light">Community Members</div>
                    <div className="font-playfair text-2xl font-bold text-green-deep">1,240+</div>
                  </div>
                  <span className="text-3xl">🌙</span>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1 bg-green-pale text-green-mid py-2 px-2 rounded-lg text-[10px] font-semibold text-center">
                    ✦ Coverage Active
                  </div>
                  <div className="flex-1 bg-amber-50 text-amber-700 py-2 px-2 rounded-lg text-[10px] font-semibold text-center">
                    ⚡ Instant Setup
                  </div>
                </div>
                
                <div className="flex items-start gap-2.5 bg-cream rounded-xl p-3 mt-auto">
                  <div className="text-lg">🤲</div>
                  <div className="text-[11px] text-text-mid leading-relaxed">
                    <strong className="block text-green-deep text-xs mb-0.5">Sadaqah Jariyah</strong>
                    Monthly donation to mosque building fund — continuous charity for all.
                  </div>
                </div>
              </div>
              
              {/* Floating Badges */}
              <div className="absolute right-[-8px] top-11 bg-white rounded-xl px-3.5 py-2.5 shadow-lg text-[11px] font-semibold text-green-deep animate-float">
                🕌 Urusan Jenazah
                <span className="block font-normal text-text-light text-[10px] mt-0.5">Covered for you & family</span>
              </div>
              <div className="absolute left-[-8px] bottom-16 bg-white rounded-xl px-3.5 py-2.5 shadow-lg text-[11px] font-semibold text-brown-warm animate-float-delayed">
                ⚡ No more 30-day wait
                <span className="block font-normal text-text-light text-[10px] mt-0.5">PayNow = instant activation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}