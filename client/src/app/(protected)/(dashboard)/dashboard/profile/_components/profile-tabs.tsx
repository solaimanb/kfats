"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User } from "@/lib/types/api"
import { ProfilePersonalInfo } from "./tabs/profile-personal-info"
import { ProfileSettings } from "./tabs/profile-settings"

interface ProfileTabsProps {
  user: User
}

export function ProfileTabs({ user }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("personal")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="personal">Personal Info</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal" className="space-y-4">
        <ProfilePersonalInfo user={user} />
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <ProfileSettings user={user} />
      </TabsContent>
    </Tabs>
  )
}
