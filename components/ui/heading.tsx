// components/ui/heading.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export function Heading({
  as: Tag = "h2",
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Tag
      className={cn(
        "scroll-m-20 font-bold tracking-tight",
        {
          h1: "text-4xl md:text-5xl lg:text-6xl",
          h2: "text-3xl md:text-4xl",
          h3: "text-2xl md:text-3xl",
          h4: "text-xl md:text-2xl",
        }[Tag],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
