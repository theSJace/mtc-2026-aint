import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { t } = useLanguage()
  const items = t.faq.items

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 bg-cream">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2.5">
          {t.faq.commonQuestions}
        </div>
        <h2 className="font-playfair text-3xl md:text-4xl leading-tight text-green-deep mb-10">
          {t.faq.soalanLazim}
        </h2>

        <div className="grid md:grid-cols-2 gap-3.5">
          {items.map((faq, index) => (
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
