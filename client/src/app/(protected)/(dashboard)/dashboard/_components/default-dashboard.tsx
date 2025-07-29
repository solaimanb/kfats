"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  PenTool,
  ShoppingBag,
  UserPlus,
  ArrowRight,
  BookOpen,
  Palette
} from "lucide-react"

interface DefaultDashboardProps {
  userId?: number // Optional since we're not using it yet
}

export function DefaultDashboard({}: DefaultDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to KFATS!</h1>
        <p className="text-muted-foreground">
          Kushtia Finearts and Technology School - Explore learning opportunities and creative resources
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Become a Student
            </CardTitle>
            <CardDescription>
              Access courses, track progress, and learn from expert mentors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Upgrade to Student
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Become a Mentor
            </CardTitle>
            <CardDescription>
              Share your knowledge by creating and teaching courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Upgrade to Mentor
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-purple-600" />
              Become a Writer
            </CardTitle>
            <CardDescription>
              Write and publish articles to share your insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Upgrade to Writer
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-600" />
              Become a Seller
            </CardTitle>
            <CardDescription>
              Sell your creative works and products to the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Upgrade to Seller
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Explore Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Discover amazing courses in fine arts and technology from our expert mentors.
            </p>
            <Button variant="outline" className="w-full">
              Browse Courses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Shop Creative Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse and purchase unique artworks and creative products from our talented community.
            </p>
            <Button variant="outline" className="w-full">
              Visit Marketplace
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Complete your profile</p>
                <p className="text-sm text-muted-foreground">Add your bio, skills, and interests</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Choose your role</p>
                <p className="text-sm text-muted-foreground">Upgrade to student, mentor, writer, or seller</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Start learning or creating</p>
                <p className="text-sm text-muted-foreground">Explore courses, write articles, or list products</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
