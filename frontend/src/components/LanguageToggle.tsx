import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { auth as apiAuth } from "@/lib/api"
import type { Lang } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const LANGUAGES: { value: Lang; labelEn: string; labelMs: string }[] = [
  { value: "en", labelEn: "English", labelMs: "English" },
  { value: "ms", labelEn: "Bahasa Melayu", labelMs: "Bahasa Melayu" },
]

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage()
  const { user, refreshUser } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const selectLang = async (l: Lang) => {
    setLang(l)
    setOpen(false)
    if (user) {
      try {
        await apiAuth.updateLanguage(l)
        refreshUser({ ...user, preferred_language: l })
      } catch {
        // silent – local pref still saved
      }
    }
  }

  const optionLabel = (opt: (typeof LANGUAGES)[0]) => (lang === "en" ? opt.labelEn : opt.labelMs)

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border border-green-deep/25 bg-cream text-green-deep hover:bg-green-pale transition-colors shadow-sm"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t.common.chooseLanguage}
      >
        <span>{lang === "en" ? "EN" : "BM"}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1.5 min-w-[160px] py-1 rounded-lg border border-gold/25 bg-cream shadow-lg z-50"
        >
          {LANGUAGES.map((opt) => (
            <li key={opt.value} role="option" aria-selected={lang === opt.value}>
              <button
                type="button"
                onClick={() => selectLang(opt.value)}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm transition-colors",
                  lang === opt.value
                    ? "bg-green-pale text-green-deep font-medium"
                    : "text-text-dark hover:bg-cream-dark"
                )}
              >
                {optionLabel(opt)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
