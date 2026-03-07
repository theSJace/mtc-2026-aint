import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * SingPass button following official guidelines:
 * - Red fill: #F4333D, hover: #B0262D
 * - Label: "Log in with Singpass" (official: "Log in" as two words)
 * - Logo matches x-height of label; border radius matches primary button
 * @see https://docs.developer.singpass.gov.sg/docs/products/singpass-login/singpass-button-guidelines-for-developers-and-designers
 */

/** Singpass logomark (keyhole / "i" icon) in white for use on red background */
function SingpassLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Keyhole shape: circle (dot of "i") + rounded bar (body) */}
      <path
        d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c-3.314 0-6 2.686-6 6v2h12v-2c0-3.314-2.686-6-6-6z"
        fill="currentColor"
      />
    </svg>
  )
}

export interface SingpassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label. Default: "Log in with Singpass" per official guidelines */
  children?: React.ReactNode
  /** Use compact style (e.g. for "Auto-fill from Singpass" link) */
  variant?: "button" | "link"
}

const SingpassButton = React.forwardRef<HTMLButtonElement, SingpassButtonProps>(
  (
    {
      className,
      children = "Log in with Singpass",
      variant = "button",
      disabled,
      ...props
    },
    ref
  ) => {
    if (variant === "link") {
      return (
        <button
          ref={ref}
          type="button"
          aria-label="Sing pass"
          className={cn(
            "inline-flex items-center gap-2 text-sm font-medium text-[#F4333D] hover:text-[#B0262D] focus:outline-none focus:ring-2 focus:ring-[#F4333D]/50 rounded focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
            className
          )}
          disabled={disabled}
          {...props}
        >
          <SingpassLogoIcon className="h-4 w-4 text-[#F4333D]" />
          {children}
        </button>
      )
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Sing pass"
        className={cn(
          "inline-flex items-center justify-center gap-2.5 w-full h-12 rounded-lg font-medium text-white text-base transition-colors bg-[#F4333D] hover:bg-[#B0262D] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          className
        )}
        disabled={disabled}
        {...props}
      >
        <SingpassLogoIcon className="h-5 w-5 text-white" />
        {children}
      </button>
    )
  }
)
SingpassButton.displayName = "SingpassButton"

export { SingpassButton, SingpassLogoIcon }
