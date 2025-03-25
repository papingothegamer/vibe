import { createServerSupabaseClient } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Moodboard, MoodboardItem } from "../../../types/moodboard"

// Add default styles
const defaultStyles = {
  backgroundColor: "#FFEB3B",
  fontSize: 16,
  fontWeight: "normal" as const,
  color: "#000000",
  textAlign: "left" as const
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()

  // Fetch the moodboard
  const { data: moodboard, error } = await supabase
    .from("moodboards")
    .select("*")
    .eq("id", params.id)
    .single<Moodboard>()

  if (error || !moodboard) {
    notFound()
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="container flex items-center justify-between py-4 md:py-6">
        <Logo />
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="hidden sm:flex">
            <Link href="/">Create Your Own</Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 container flex flex-col items-center justify-center py-6 md:py-12">
        <h1 className="font-clash text-2xl md:text-3xl mb-6">{moodboard.title}</h1>

        <div
          className="w-full max-w-4xl h-[60vh] md:h-[70vh] relative overflow-hidden rounded-lg border border-border/50 shadow-lg paper-texture"
          style={{ backgroundColor: moodboard.background_color }}
        >
          {moodboard.items.map((item: MoodboardItem) => (
            <div
              key={item.id}
              className="absolute pin-effect pin-shadow"
              style={{
                left: item.position.x,
                top: item.position.y,
                zIndex: item.zIndex,
                width: item.size.width,
                height: item.size.height,
                transform: `rotate(${Math.random() * 6 - 3}deg)`,
              }}
            >
              {item.type === "image" ? (
                <div className="w-full h-full bg-white p-1 shadow-md">
                  <img
                    src={item.src || "/placeholder.svg"}
                    alt="Moodboard item"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-full h-full p-3 shadow-md"
                  style={{
                    backgroundColor: item.style?.backgroundColor === "transparent" 
                      ? defaultStyles.backgroundColor 
                      : item.style?.backgroundColor || defaultStyles.backgroundColor,
                    backgroundImage: "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                    fontSize: `${item.style?.fontSize || defaultStyles.fontSize}px`,
                    fontWeight: item.style?.fontWeight || defaultStyles.fontWeight,
                    color: item.style?.color || defaultStyles.color,
                    textAlign: item.style?.textAlign || defaultStyles.textAlign,
                  }}
                >
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline" size="sm" className="sm:hidden">
            <Link href="/">Create Your Own</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

