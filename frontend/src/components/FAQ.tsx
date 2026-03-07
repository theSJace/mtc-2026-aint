import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqData = [
  {
    question: "Is this insurance? Is it Shariah-compliant?",
    answer:
      "Skim Pintar is a donation (sadaqah) to the mosque's building fund — not insurance. There is no akad bay'. The mosque provides urusan jenazah as a courtesy to regular donors. Fully Shariah-compliant, operating for 18 years.",
  },
  {
    question: "What happens if I miss a payment?",
    answer:
      "You'll receive a WhatsApp reminder if a payment is missed. You have a grace period before coverage is paused. After 3 consecutive missed payments, coverage is suspended — but you'll receive multiple warnings first. No more silent cancellations.",
  },
  {
    question: "How quickly does coverage start?",
    answer:
      "Coverage activates immediately upon your first successful PayNow payment — usually within minutes. Previously, GIRO took 21–30 working days. The new system eliminates that wait entirely.",
  },
  {
    question: "Who can I add as a dependant for Pintar Plus?",
    answer:
      "You may add spouse, children, siblings, parents and in-laws. Same-address family (Section A) and those at different addresses (Section B, up to 10 entries). You'll need their full name (per NRIC) and date of birth.",
  },
  {
    question: "Can I pay more than the minimum?",
    answer:
      "Yes. The minimum for Pintar Plus is $20/month, but you're welcome to donate $30, $50, or any amount. Any amount above the minimum is additional sadaqah to the mosque fund. Benefits remain the same.",
  },
  {
    question: "Is my data safe? What about PDPA?",
    answer:
      "Your personal data is protected under Singapore's PDPA. Lembaga Pentadbir Masjid Ar-Raudhah is the data controller. Data is used solely for membership administration. You may request access or correction at any time.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 bg-cream">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2.5">
          Common Questions
        </div>
        <h2 className="font-playfair text-3xl md:text-4xl leading-tight text-green-deep mb-10">
          Soalan Lazim
        </h2>

        <div className="grid md:grid-cols-2 gap-3.5">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl overflow-hidden border border-cream-dark transition-shadow ${
                openIndex === index ? "shadow-md" : ""
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-4.5 text-left gap-2.5"
              >
                <span className="text-[13px] font-semibold text-green-deep leading-relaxed">
                  {faq.question}
                </span>
                <div
                  className={`w-6 h-6 bg-green-pale rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={12} />
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-[300px]" : "max-h-0"
                }`}
              >
                <div className="px-4.5 pb-4.5 text-[13px] text-text-mid leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}