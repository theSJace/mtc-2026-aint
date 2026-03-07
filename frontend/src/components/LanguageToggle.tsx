import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { auth as apiAuth } from "@/lib/api"

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage()
  const { user, refreshUser } = useAuth()

  const toggle = async () => {
    const next = lang === "en" ? "ms" : "en"
    setLang(next)
    // Persist to backend if logged in
    if (user) {
      try {
        await apiAuth.updateLanguage(next)
        refreshUser({ ...user, preferred_language: next })
      } catch {
        // silent – local pref still saved
      }
    }
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-deep/20 text-green-deep hover:bg-green-pale transition-colors ${className ?? ""}`}
      title={lang === "en" ? "Tukar ke Bahasa Melayu" : "Switch to English"}
    >
      <span className="text-sm leading-none">{lang === "en" ? "🇸🇬" : "🌐"}</span>
      {lang === "en" ? "BM" : "EN"}
    </button>
  )
}
