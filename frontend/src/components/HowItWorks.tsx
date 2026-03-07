export function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: "📋",
      title: "Fill Your Details",
      description:
        "Login or register using SingPass MyInfo (auto-fills your details) or fill in manually. Add dependants for Pintar Plus.",
      time: "5 minutes",
      bgColor: "bg-green-pale",
      textColor: "text-green-deep",
    },
    {
      number: 2,
      icon: "📱",
      title: "Make Your First Donation",
      description:
        "Scan the personalised PayNow QR code or set up a monthly standing instruction in your banking app.",
      time: "2 minutes",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
    {
      number: 3,
      icon: "✅",
      title: "You're Active!",
      description:
        "Instant WhatsApp confirmation. Track your status, payments, and dependants from your member dashboard.",
      time: "Instant",
      bgColor: "bg-red-50",
      textColor: "text-red-800",
    },
  ]

  return (
    <section id="how" className="py-16 bg-cream-dark">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2.5">
          The New Process
        </div>
        <h2 className="font-playfair text-3xl md:text-4xl leading-tight text-green-deep mb-3.5">
          From 30 days to under 24 hours
        </h2>
        <p className="text-[15px] text-text-mid leading-relaxed max-w-lg mb-11">
          We've replaced the paper GIRO process with a simple digital flow. No queues, no waiting weeks for bank approval.
        </p>

        <div className="grid md:grid-cols-3 gap-5 relative">
          {/* Connection line for desktop */}
          <div className="hidden md:block absolute top-[44px] left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-0.5 bg-[repeating-linear-gradient(90deg,#52b788_0,#52b788_8px,transparent_8px,transparent_16px)]" />
          
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 md:p-7 shadow-md hover:-translate-y-1 transition-transform md:text-center"
            >
              <div className="flex md:flex-col items-center gap-3.5 md:gap-0">
                <div
                  className={`w-12.5 h-12.5 md:w-[50px] md:h-[50px] rounded-full flex items-center justify-center font-playfair text-lg font-bold ${step.bgColor} ${step.textColor} md:mx-auto md:mb-3.5 flex-shrink-0`}
                >
                  {step.number}
                </div>
                <div className="flex-1 md:flex-none">
                  <div className="text-2xl mb-2.5 hidden md:block">{step.icon}</div>
                  <div className="font-playfair text-base text-green-deep mb-2 md:mb-2">
                    {step.title}
                  </div>
                  <p className="text-[13px] text-text-mid leading-relaxed mb-3">
                    {step.description}
                  </p>
                  <div className="inline-block text-[11px] font-bold text-green-soft bg-green-pale px-2.5 py-1 rounded-full">
                    ⏱ {step.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}