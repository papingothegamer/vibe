import { ProfileSettings } from "@/components/dashboard/profile/profile-settings"

export default function ProfilePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1" style={{ height: "calc(100vh - 5rem)" }}>
        <ProfileSettings />
      </div>
    </main>
  )
}

