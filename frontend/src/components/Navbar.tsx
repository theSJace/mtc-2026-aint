import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 backdrop-blur-xl border-b border-gold/20 transition-shadow ${
        scrolled ? "shadow-lg shadow-green-deep/5" : ""
      } bg-cream/95`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9.5 h-9.5 rounded-lg bg-green-deep flex items-center justify-center overflow-hidden">
          <span className="text-white text-lg">🕌</span>
        </div>
        <div>
          <strong className="block font-playfair text-sm text-green-deep leading-tight">
            Skim Pintar
          </strong>
          <span className="text-xs text-text-light">Masjid Ar-Raudhah</span>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-7">
        <a href="#how" className="text-sm font-medium text-text-mid hover:text-green-mid transition-colors">
          How It Works
        </a>
        <a href="#schemes" className="text-sm font-medium text-text-mid hover:text-green-mid transition-colors">
          Schemes
        </a>
        <a href="#payment" className="text-sm font-medium text-text-mid hover:text-green-mid transition-colors">
          Payment
        </a>
        <a href="#help" className="text-sm font-medium text-text-mid hover:text-green-mid transition-colors">
          Need Help?
        </a>
        <Button size="sm">Register Now →</Button>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center gap-2">
        <Button size="sm" className="text-xs">Register →</Button>
        <a
          href="https://wa.me/6598337752"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center text-base"
        >
          💬
        </a>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-9 h-9 rounded-full bg-green-pale text-green-deep flex items-center justify-center"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-cream border-b border-gold/20 p-4 flex flex-col gap-3 md:hidden shadow-lg">
          <a href="#how" className="text-sm font-medium text-text-mid hover:text-green-mid py-2" onClick={() => setMobileMenuOpen(false)}>
            How It Works
          </a>
          <a href="#schemes" className="text-sm font-medium text-text-mid hover:text-green-mid py-2" onClick={() => setMobileMenuOpen(false)}>
            Schemes
          </a>
          <a href="#payment" className="text-sm font-medium text-text-mid hover:text-green-mid py-2" onClick={() => setMobileMenuOpen(false)}>
            Payment
          </a>
          <a href="#help" className="text-sm font-medium text-text-mid hover:text-green-mid py-2" onClick={() => setMobileMenuOpen(false)}>
            Need Help?
          </a>
        </div>
      )}
    </nav>
  )
}