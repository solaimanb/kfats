"use client"

import { useAuth } from "@/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserRole } from "@/lib/types/api"
import { Users, PenTool, ShoppingBag, Star } from "lucide-react"
import Link from "next/link"

const roleFeatures = {
  // [UserRole.STUDENT]: {
  //   icon: BookOpen,
  //   title: "Student",
  //   description: "Access courses, track progress, and learn from expert mentors",
  //   features: ["Enroll in courses", "Track learning progress", "Access course materials", "Connect with mentors"],
  //   color: "bg-blue-500"
  // },
  [UserRole.MENTOR]: {
    icon: Users,
    title: "Mentor",
    description: "Create and manage courses, teach students, and share knowledge",
    features: ["Create courses", "Manage students", "Upload course content", "Earn from teaching"],
    color: "bg-green-500"
  },
  [UserRole.WRITER]: {
    icon: PenTool,
    title: "Writer",
    description: "Create and publish articles, blogs, and educational content",
    features: ["Write articles", "Publish blogs", "Build audience", "Share expertise"],
    color: "bg-purple-500"
  },
  [UserRole.SELLER]: {
    icon: ShoppingBag,
    title: "Seller",
    description: "List and sell products, manage inventory, and grow your business",
    features: ["List products", "Manage inventory", "Process orders", "Build marketplace presence"],
    color: "bg-orange-500"
  }
}

export function AuthenticatedHomePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we load your profile</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="h-6 w-6 text-yellow-500" />
            <Badge variant="secondary">Welcome to KFATS</Badge>
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
        </div>

        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Explore KFATS Opportunities</h2>
            <p className="text-muted-foreground">
              Apply for a role to unlock specialized features and opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(roleFeatures).map(([role, config]) => {
              const Icon = config.icon
              return (
                <Card key={role} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{config.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {config.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 mb-4">
                      {config.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/role-application" className="w-full">
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Apply Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
