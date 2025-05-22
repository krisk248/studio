"use client"

import Link from "next/link"
import { Settings, Moon, Sun, ALargeSmall, Check } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FontSizeSetting, ThemeSetting } from "@/lib/types"

const FONT_SIZES: { label: string; value: FontSizeSetting, multiplier: number }[] = [
  { label: "Default", value: "default", multiplier: 1 },
  { label: "Large", value: "large", multiplier: 1.25 }, // 20pt
  { label: "Extra Large", value: "extra-large", multiplier: 1.5 }, // 24pt
]

export function SiteHeader() {
  const { setTheme, theme } = useTheme()
  const [currentFontSize, setCurrentFontSize] = React.useState<FontSizeSetting>("default")

  React.useEffect(() => {
    const storedFontSize = localStorage.getItem("quizmate-font-size") as FontSizeSetting | null
    if (storedFontSize && FONT_SIZES.find(fs => fs.value === storedFontSize)) {
      applyFontSize(storedFontSize)
    } else {
      applyFontSize("default") // Ensure default is applied if nothing stored or invalid
    }
  }, [])
  
  const applyFontSize = (sizeValue: FontSizeSetting) => {
    const selectedSize = FONT_SIZES.find(fs => fs.value === sizeValue) || FONT_SIZES[0];
    document.documentElement.style.setProperty("--font-size-multiplier", selectedSize.multiplier.toString());
    setCurrentFontSize(sizeValue);
    localStorage.setItem("quizmate-font-size", sizeValue);
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          QuizMate
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {theme === "light" && <Sun className="mr-2 h-4 w-4" />}
                {theme === "dark" && <Moon className="mr-2 h-4 w-4" />}
                {theme === "system" && <Settings className="mr-2 h-4 w-4" />}
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(value) => setTheme(value as ThemeSetting)}
                  >
                    <DropdownMenuRadioItem value="light">
                      <Sun className="mr-2 h-4 w-4" /> Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon className="mr-2 h-4 w-4" /> Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <Settings className="mr-2 h-4 w-4" /> System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ALargeSmall className="mr-2 h-4 w-4" /> Font Size
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={currentFontSize} onValueChange={(value) => applyFontSize(value as FontSizeSetting)}>
                    {FONT_SIZES.map(size => (
                      <DropdownMenuRadioItem key={size.value} value={size.value}>
                        {size.label}
                        {currentFontSize === size.value && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
