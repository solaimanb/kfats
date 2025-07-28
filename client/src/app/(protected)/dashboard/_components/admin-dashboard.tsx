"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUsers } from "@/lib/hooks/useUsers"
import { useCourses } from "@/lib/hooks/useCourses"
import { useArticles } from "@/lib/hooks/useArticles"
import { useProducts } from "@/lib/hooks/useProducts"
import {
  Users,
  BookOpen,
  PenTool,
  ShoppingBag,
  Shield,
  BarChart3,
  Settings,
  AlertCircle
} from "lucide-react"

interface AdminDashboardProps {
  userId?: number // Optional since we're not using it yet
}

export function AdminDashboard({}: AdminDashboardProps) {
  const { data: users } = useUsers()
  const { data: courses } = useCourses()
  const { data: articles } = useArticles()
  const { data: products } = useProducts()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.items?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses?.items?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles?.items?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Published articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.items?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Listed products
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users</span>
                <span className="text-sm font-medium">
                  {users?.items?.filter(u => u.status === 'active').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Users</span>
                <span className="text-sm font-medium">
                  {users?.items?.filter(u => u.status === 'pending').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Suspended Users</span>
                <span className="text-sm font-medium text-red-600">
                  {users?.items?.filter(u => u.status === 'suspended').length || 0}
                </span>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Settings className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">System Health</span>
                <span className="text-sm font-medium text-green-600">Good</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Sessions</span>
                <span className="text-sm font-medium">
                  {users?.items?.filter(u => u.last_login).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Approvals</span>
                <span className="text-sm font-medium text-orange-600">
                  {(courses?.items?.filter(c => c.status === 'draft').length || 0) +
                   (articles?.items?.filter(a => a.status === 'draft').length || 0)}
                </span>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-sm">New user registration</span>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-sm">Course published</span>
              <span className="text-xs text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-sm">Product listed</span>
              <span className="text-xs text-muted-foreground">6 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
