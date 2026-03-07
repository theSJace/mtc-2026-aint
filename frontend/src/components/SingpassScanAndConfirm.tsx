import { useMemo, useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchMyInfoAfterSingpassAuth } from "@/lib/singpass"
import type { SingpassPrefill } from "@/lib/singpass"

const SINGPASS_DATA_ITEMS = [
  "Full Name",
  "I/C Number",
  "Date of Birth",
  "Home Address",
  "Postal Code",
  "Contact Number",
  "Email",
] as const

export interface SingpassScanAndConfirmProps {
  /** When true, the overlay is visible */
  open: boolean
  /** Callback to close the flow (e.g. Back or Not okay) */
  onClose: () => void
  /** Callback when user confirms; receives fetched prefill. Caller can navigate or set form state. */
  onConfirm: (prefill: SingpassPrefill) => void
  /** Optional title above the QR (e.g. "Log in with Singpass" or "Auto-fill from Singpass") */
  title?: string
  /** If true, render as a modal overlay; if false, render inline (e.g. full page on sign-in) */
  asModal?: boolean
}

export function SingpassScanAndConfirm({
  open,
  onClose,
  onConfirm,
  title = "Log in with Singpass",
  asModal = true,
}: SingpassScanAndConfirmProps) {
  const sessionId = useMemo(
    () => (open ? `singpass-demo-${Date.now()}` : ""),
    [open]
  )

  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  // Reset dialog when flow opens/closes
  useEffect(() => {
    if (open) setShowDialog(false)
  }, [open])

  const handleScanned = () => setShowDialog(true)
  const handleDialogNotOkay = () => {
    setShowDialog(false)
    onClose()
  }
  const handleDialogOkay = async () => {
    setLoading(true)
    try {
      const prefill = await fetchMyInfoAfterSingpassAuth(sessionId)
      setShowDialog(false)
      onConfirm(prefill)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const qrCard = (
    <Card
      className="w-full max-w-[440px] rounded-xl border border-gold/20 shadow-lg shadow-green-deep/10"
      onClick={(e) => e.stopPropagation()}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium text-green-deep">
          Scan QR code
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 items-center">
        <div className="bg-white p-4 rounded-xl border border-gold/20 inline-block">
          <QRCodeSVG
            value={sessionId}
            size={220}
            level="M"
            includeMargin={false}
          />
        </div>
        <p className="text-sm text-text-mid text-center">
          Open your SingPass app and scan this QR code to authorise and share your details.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="w-full rounded-lg font-medium border-2 border-green-deep"
          onClick={handleScanned}
          disabled={loading}
        >
          {loading ? "Retrieving your details…" : "I've scanned — continue"}
        </Button>
      </CardContent>
    </Card>
  )

  const content = (
    <>
      {!asModal && (
        <div className="w-full max-w-[440px] flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-text-mid hover:text-green-deep w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2 className="text-xl md:text-2xl font-medium text-green-deep">
            {title}
          </h2>
          <p className="text-sm text-text-mid">
            Scan the QR code with your SingPass app
          </p>
        </div>
      )}
      {asModal ? qrCard : <div className="mt-6">{qrCard}</div>}

      {showDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="singpass-data-dialog-title"
          onClick={handleDialogNotOkay}
        >
          <Card
            className="w-full max-w-[440px] rounded-xl border border-gold/20 shadow-xl bg-cream"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-2">
              <CardTitle id="singpass-data-dialog-title" className="text-lg font-medium text-green-deep">
                Data we will fetch from Singpass
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-text-mid">
                The following information will be retrieved from Singpass and used to pre-fill your sign-up form:
              </p>
              <ul className="text-sm text-text-dark list-disc list-inside space-y-1">
                {SINGPASS_DATA_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-sm text-text-mid">
                Are you okay with sharing this data?
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  className="flex-1 rounded-lg font-medium"
                  onClick={handleDialogOkay}
                  disabled={loading}
                >
                  Okay
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 rounded-lg font-medium border-2 border-green-deep"
                  onClick={handleDialogNotOkay}
                  disabled={loading}
                >
                  Not okay
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )

  if (asModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center py-8" onClick={(e) => e.stopPropagation()}>
          {content}
        </div>
      </div>
    )
  }

  return <div className="flex flex-col items-center">{content}</div>
}

