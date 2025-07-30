"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOverviewAnalytics, useUserAnalytics, useActivityData, useCourseAnalytics, useArticleAnalytics, useProductAnalytics } from "@/lib/hooks/useAnalytics"
import { RoleApplicationReview } from "./role-application-review"
import { formatDistanceToNow } from "date-fns"
import {
  Users,
  BookOpen,
  PenTool,
  ShoppingBag,
  Shield,
  BarChart3,
  Settings,
  AlertCircle,
  UserCheck,
  TrendingUp,
  Activity,
  Eye
} from "lucide-react"

interface AdminDashboardProps {
  userId?: number
}

export function AdminDashboard({ }: AdminDashboardProps) {
  const { data: overviewData, isLoading: overviewLoading } = useOverviewAnalytics()
  const { data: userAnalytics, isLoading: userAnalyticsLoading } = useUserAnalytics()
  const { data: activityData, isLoading: activityLoading } = useActivityData()
  const { data: courseAnalytics, isLoading: courseAnalyticsLoading } = useCourseAnalytics()
  const { data: articleAnalytics, isLoading: articleAnalyticsLoading } = useArticleAnalytics()
  const { data: productAnalytics, isLoading: productAnalyticsLoading } = useProductAnalytics()

  if (overviewLoading || userAnalyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'course_created':
        return <BookOpen className="h-4 w-4 text-green-500" />
      case 'article_published':
        return <PenTool className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-50 border-blue-200'
      case 'course_created':
        return 'bg-green-50 border-green-200'
      case 'article_published':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData?.totals.users || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{overviewData?.growth.new_users_this_month || 0} this month
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData?.totals.courses || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{overviewData?.growth.new_courses_this_month || 0} this month
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData?.totals.articles || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{overviewData?.growth.new_articles_this_month || 0} this month
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData?.totals.products || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Eye className="h-3 w-3 mr-1" />
              Marketplace items
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users (30 days)</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {userAnalytics?.active_users || 0}
                </Badge>
              </div>

              {/* User Status Distribution */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">By Status</h4>
                {userAnalytics?.status_distribution && Object.entries(userAnalytics.status_distribution).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{status}</span>
                    <span className={`text-sm font-medium ${status === 'active' ? 'text-green-600' :
                        status === 'suspended' ? 'text-red-600' :
                          status === 'pending' ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Role Distribution */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">By Role</h4>
                {overviewData?.user_distribution && Object.entries(overviewData.user_distribution).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{role}</span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">System Health</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Excellent
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Total Enrollments</span>
                <span className="text-sm font-medium">
                  {overviewData?.totals.enrollments || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Growth Rate</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  +12.5%
                </Badge>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Platform Usage</span>
                  <span>89%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {activityData?.activities.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {activityData?.activities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Application Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Role Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RoleApplicationReview onlyPending={true} />
        </CardContent>
      </Card>

      {/* User Analytics Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Analytics
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userAnalyticsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAnalytics?.status_distribution && Object.entries(userAnalytics.status_distribution).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{status}</span>
                      <Badge className={
                        status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                          status === 'suspended' ? 'bg-red-100 text-red-800 border-red-200' :
                            status === 'pending' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                      }>
                        {count as number}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userAnalyticsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Users</span>
                    <Badge variant="outline">
                      {userAnalytics?.total_users || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Users (30 days)</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {userAnalytics?.active_users || 0}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Analytics Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Course Analytics
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courseAnalyticsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Courses</span>
                    <Badge variant="outline">
                      {courseAnalytics?.overview?.total_courses || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Published</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {courseAnalytics?.overview?.published_courses || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Enrollments</span>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {courseAnalytics?.overview?.total_enrollments || 0}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {courseAnalytics?.popular_courses && courseAnalytics.popular_courses.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseAnalytics.popular_courses.slice(0, 3).map((course: {
                    course_id: number
                    title: string
                    enrolled_count: number
                    actual_enrollments: number
                  }, index: number) => (
                    <div key={course.course_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{course.title}</h4>
                        </div>
                      </div>
                      <Badge>
                        {course.enrolled_count} enrollments
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Content Analytics Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Content Analytics
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Articles Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {articleAnalyticsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Articles</span>
                    <Badge variant="outline">
                      {articleAnalytics?.overview?.total_articles || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Published</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {articleAnalytics?.overview?.published_articles || 0}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Products Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productAnalyticsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Products</span>
                    <Badge variant="outline">
                      {productAnalytics?.overview?.total_products || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Available</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {productAnalytics?.overview?.active_products || 0}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
