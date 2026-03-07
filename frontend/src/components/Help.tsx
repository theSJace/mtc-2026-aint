export function Help() {
  const features = [
    {
      icon: "🧓",
      title: "Assisted Registration at Counter",
      description:
        "Staff will guide you through registration on a tablet. With Singpass, your details auto-fill in seconds.",
    },
    {
      icon: "👨‍👩‍👧",
      title: "Family Can Register for You",
      description:
        "Your son, daughter, or any family member can register and set up monthly PayNow on your behalf.",
    },
    {
      icon: "📞",
      title: "WhatsApp Us First",
      description:
        "Not sure what to bring? WhatsApp us and we'll tell you exactly what you need. We speak Malay and English.",
    },
  ]

  return (
    <section id="help" className="py-16 bg-gradient-to-br from-gold-light to-cream-dark">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-13">
          {/* Left Content */}
          <div>
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2.5">
              Not sure how to start?
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl leading-tight text-brown-warm mb-3.5">
              We'll sit with you<br />and do it together.
            </h2>
            <p className="text-[15px] text-text-mid leading-relaxed max-w-lg">
              Our mosque staff are trained to help every jemaah — no matter your age or comfort with technology. Come as you are.
            </p>

            <div className="flex flex-col gap-3.5 mt-6.5">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-3.5 items-start bg-white/65 rounded-xl p-4"
                >
                  <div className="w-9.5 h-9.5 bg-white rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    {feature.icon}
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

          {/* Right - Contact Box */}
          <div className="bg-white rounded-2xl p-7 shadow-md text-center">
            <div className="font-playfair text-lg text-green-deep mb-1.5">
              Hubungi Kami
            </div>
            <p className="text-xs text-text-light mb-5.5">
              We're here to help. No question is too small.
            </p>

            <a
              href="https://wa.me/6598337752"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-cream rounded-xl p-3.5 mb-3 text-left hover:bg-green-pale/30 transition-colors"
            >
              <div className="w-9.5 h-9.5 bg-green-pale rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                💬
              </div>
              <div>
                <strong className="block text-[13px] text-green-deep mb-0.5">WhatsApp</strong>
                <span className="text-xs text-text-mid">9833 7752 — fastest response</span>
              </div>
            </a>

            <a
              href="mailto:arraudhahfin@arraudhah.mosque.sg"
              className="flex items-center gap-3 bg-cream rounded-xl p-3.5 mb-3 text-left hover:bg-green-pale/30 transition-colors"
            >
              <div className="w-9.5 h-9.5 bg-green-pale rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                📧
              </div>
              <div>
                <strong className="block text-[13px] text-green-deep mb-0.5">Email</strong>
                <span className="text-xs text-text-mid">arraudhahfin@arraudhah.mosque.sg</span>
              </div>
            </a>

            <div className="flex items-center gap-3 bg-cream rounded-xl p-3.5 text-left">
              <div className="w-9.5 h-9.5 bg-green-pale rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                🕌
              </div>
              <div>
                <strong className="block text-[13px] text-green-deep mb-0.5">Visit Us</strong>
                <span className="text-xs text-text-mid">30 Bukit Batok East Ave 2, S659919</span>
              </div>
            </div>

            <div className="mt-3.5 text-xs text-text-light leading-relaxed">
              <strong className="text-text-mid">Counter Hours</strong>
              <br />
              Mon – Fri: 9am – 5pm
              <br />
              Saturday: 9am – 1pm
              <br />
              Closed on Public Holidays
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}