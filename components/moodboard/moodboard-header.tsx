import { Button } from "@/components/ui/button"
import type { Moodboard } from "@/lib/database.types"

export function MoodboardHeader({
  moodboard,
  hasUnsavedChanges,
}: {
  moodboard: Moodboard
  hasUnsavedChanges: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">
          {moodboard.title}
          {hasUnsavedChanges && (
            <span className="ml-2 text-sm text-muted-foreground">
              (Unsaved changes)
            </span>
          )}
        </h1>
      </div>
    </div>
  )
}