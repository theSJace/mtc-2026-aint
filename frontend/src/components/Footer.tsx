import { useLanguage } from "@/contexts/LanguageContext"

export function Footer() {
  const { t } = useLanguage()
  const f = t.footer
  return (
    <footer className="bg-green-deep border-t border-white/10 py-7 px-6 flex flex-col md:flex-row justify-between items-center gap-3.5">
      <div className="text-xs text-white/45 text-center md:text-left leading-relaxed">
        <strong className="text-white/70 block">{f.lpmName}</strong>
        {f.addressTel}
      </div>
      <div className="flex gap-4.5 flex-wrap justify-center">
        <a href="#" className="text-xs text-white/45 hover:text-gold-light transition-colors">
          {f.privacyPolicy}
        </a>
        <a href="#" className="text-xs text-white/45 hover:text-gold-light transition-colors">
          {f.pdpaNotice}
        </a>
        <a href="#" className="text-xs text-white/45 hover:text-gold-light transition-colors">
          {f.contact}
        </a>
        <a href="#" className="text-xs text-white/45 hover:text-gold-light transition-colors">
          {f.adminLogin}
        </a>
      </div>
    </footer>
  )
}
