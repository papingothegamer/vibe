import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="font-clash text-4xl mb-4">404 - Not Found</h1>
      <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  )
}

