"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

const notifications: Array<{
    id: number
    type: string
    title: string
    description: string
    icon: React.ElementType
    read: boolean
    date: string
}> = []

export default function NotificationsPage() {
    // TODO: Implement fetching notifications from an API or state management
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto space-y-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {notifications.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <Bell className="mx-auto mb-2 h-8 w-8" />
                                <p>No notifications yet.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-border">
                                {notifications.map((n) => (
                                    <li key={n.id} className="flex items-center justify-between py-4">
                                        <div className="flex items-center gap-4">
                                            <n.icon className={`h-6 w-6 ${n.read ? 'text-muted-foreground' : 'text-primary'}`} />
                                            <div>
                                                <div className="font-medium">{n.title}</div>
                                                <div className="text-sm text-muted-foreground">{n.description}</div>
                                                <div className="text-xs text-muted-foreground mt-1">{n.date}</div>
                                            </div>
                                        </div>
                                        {!n.read && (
                                            <Button size="sm" variant="outline">Mark as read</Button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
