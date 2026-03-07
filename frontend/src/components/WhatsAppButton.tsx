export function WhatsAppButton() {
  return (
    <div className="fixed bottom-5 right-5 z-[99]">
      <a
        href="https://wa.me/6598337752"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] text-white px-4.5 py-3 rounded-full text-[13px] font-semibold shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(37,211,102,0.5)] transition-all"
      >
        <span>💬</span>
        <span className="hidden sm:inline">WhatsApp Us</span>
      </a>
    </div>
  )
}