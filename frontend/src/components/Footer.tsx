export function Footer() {
  return (
    <footer className="bg-green-deep border-t border-white/10 py-7 px-6 flex flex-col md:flex-row justify-between items-center gap-3.5">
      <div className="text-xs text-white/45 text-center md:text-left leading-relaxed">
        <strong className="text-white/70 block">Lembaga Pentadbir Masjid Ar-Raudhah</strong>
        30 Bukit Batok East Ave 2, Singapore 659919 · Tel: 6899 5840
      </div>
      <div className="flex gap-4.5 flex-wrap justify-center">
        <a href="#" className="text-xs text-white/45 hover:text-gold-light transition-colors">
          Privacy Policy
        </a>
        <a href="#" className="text-xs text-white/45 hover:text-gold-light transition-colors">
          PDPA Notice
        </a>
        <a href="#" className="text-xs text-white/45 hover:text-gold-light transition-colors">
          Contact
        </a>
        <a href="#" className="text-xs text-white/45 hover:text-gold-light transition-colors">
          Admin Login
        </a>
      </div>
    </footer>
  )
}