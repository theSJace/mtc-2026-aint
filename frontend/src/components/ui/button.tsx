import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-green-deep text-white shadow-lg shadow-green-deep/25 hover:bg-green-mid hover:-translate-y-0.5",
        secondary:
          "border-2 border-green-deep bg-transparent text-green-deep hover:bg-green-pale",
        gold: "bg-gold text-green-deep shadow-lg shadow-gold/30 hover:bg-gold-light hover:-translate-y-0.5",
        outline:
          "border-2 border-white/35 bg-transparent text-white hover:bg-white/10",
        ghost: "hover:bg-green-pale hover:text-green-deep",
        link: "text-green-deep underline-offset-4 hover:underline",
      },
      size: {
        default: "px-7 py-4 text-base",
        sm: "px-5 py-2.5 text-sm",
        lg: "px-8 py-4 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }