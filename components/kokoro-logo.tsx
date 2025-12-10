// Kokoro Logo Component
// Available in multiple sizes and color variants

interface KokoroLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "primary" | "white" | "accent"
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 48, text: "text-2xl" },
  xl: { icon: 64, text: "text-3xl" },
}

export function KokoroLogo({ size = "md", variant = "primary", showText = true, className = "" }: KokoroLogoProps) {
  const { icon, text } = sizeMap[size]

  const colorMap = {
    primary: {
      fill: "fill-foreground",
      text: "text-foreground",
    },
    white: {
      fill: "fill-white",
      text: "text-white",
    },
    accent: {
      fill: "fill-accent",
      text: "text-accent",
    },
  }

  const colors = colorMap[variant]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Mark - Abstract heart/envelope combination */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={colors.fill}
        aria-label="Kokoro logo"
      >
        {/* Outer envelope shape */}
        <path
          d="M6 14C6 11.7909 7.79086 10 10 10H38C40.2091 10 42 11.7909 42 14V34C42 36.2091 40.2091 38 38 38H10C7.79086 38 6 36.2091 6 34V14Z"
          fillOpacity="0.1"
        />
        {/* Heart shape */}
        <path d="M24 34L12.6 23.4C10.4 21.2 10.4 17.6 12.6 15.4C14.8 13.2 18.4 13.2 20.6 15.4L24 18.8L27.4 15.4C29.6 13.2 33.2 13.2 35.4 15.4C37.6 17.6 37.6 21.2 35.4 23.4L24 34Z" />
        {/* Envelope flap detail */}
        <path
          d="M6 14L24 26L42 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={variant === "white" ? "stroke-white/30" : "stroke-foreground/20"}
          fill="none"
        />
      </svg>

      {showText && <span className={`font-serif font-normal tracking-tight ${text} ${colors.text}`}>Kokoro</span>}
    </div>
  )
}

// Export individual logo mark for favicon/icon use
export function KokoroLogoMark({
  size = 32,
  className = "",
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`fill-current ${className}`}
    >
      <path
        d="M6 14C6 11.7909 7.79086 10 10 10H38C40.2091 10 42 11.7909 42 14V34C42 36.2091 40.2091 38 38 38H10C7.79086 38 6 36.2091 6 34V14Z"
        fillOpacity="0.15"
      />
      <path d="M24 34L12.6 23.4C10.4 21.2 10.4 17.6 12.6 15.4C14.8 13.2 18.4 13.2 20.6 15.4L24 18.8L27.4 15.4C29.6 13.2 33.2 13.2 35.4 15.4C37.6 17.6 37.6 21.2 35.4 23.4L24 34Z" />
    </svg>
  )
}
