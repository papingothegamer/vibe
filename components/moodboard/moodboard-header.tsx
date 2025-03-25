import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { SignOutDialog } from "../sign-out-dialog"
import { LogOut, Menu, X, User, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { MoodboardType } from "@/types/moodboard"

interface MoodboardHeaderProps {
  moodboard: MoodboardType | null
  hasUnsavedChanges: boolean
  sidebarOpen: boolean
  onSidebarToggle: () => void
  onTitleChange: (title: string) => void
}

export function MoodboardHeader({
  moodboard,
  hasUnsavedChanges,
  sidebarOpen,
  onSidebarToggle,
  onTitleChange,
}: MoodboardHeaderProps) {
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const [showSignOutDialog, setShowSignOutDialog] = useState(false)

  const getUserInitials = () => {
    if (!user) return "U"
    const name = user.user_metadata?.full_name || user.email || ""
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    const newTitle = e.target.textContent || "Untitled Moodboard"
    onTitleChange?.(newTitle)
    setIsEditingTitle(false)
  }

  return (
    <div className="flex justify-between items-center mb-4 bg-background/50 backdrop-blur-sm py-3 px-4 rounded-lg border border-border/30 shadow-sm">
      <div className="flex items-center gap-2">
        {onSidebarToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={onSidebarToggle}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}
        <h1
          className="font-clash text-xl md:text-2xl font-medium truncate select-none focus:outline-none"
          contentEditable={isEditingTitle}
          onBlur={handleTitleChange}
          onClick={() => setIsEditingTitle(true)}
          suppressContentEditableWarning
        >
          {moodboard?.title}
        </h1>
        {hasUnsavedChanges && (
          <span className="text-sm text-muted-foreground">
            (Unsaved changes)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block">
                {user?.user_metadata?.full_name || user?.email}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowSignOutDialog(true)}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SignOutDialog 
          open={showSignOutDialog} 
          onOpenChange={setShowSignOutDialog} 
        />
      </div>
    </div>
  )
}