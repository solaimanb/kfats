import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User } from "@/lib/types/api"
import { Trash2, Shield, Eye } from "lucide-react"

interface ProfileSettingsProps {
  user: User
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Manage your privacy and visibility preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Checkbox defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Email</Label>
              <p className="text-sm text-muted-foreground">
                Display your email address on your profile
              </p>
            </div>
            <Checkbox />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Activity</Label>
              <p className="text-sm text-muted-foreground">
                Show your recent activity to other users
              </p>
            </div>
            <Checkbox defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Checkbox defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Checkbox />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and updates
              </p>
            </div>
            <Checkbox />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Shield className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Eye className="h-4 w-4 mr-2" />
            Two-Factor Authentication
          </Button>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="destructive" className="w-full justify-start">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
