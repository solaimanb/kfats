"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PenTool, ShoppingBag } from "lucide-react"
import type { ArticleAnalytics, ProductAnalytics } from "./types"

interface ContentAnalyticsSectionProps {
  data: {
    articles: ArticleAnalytics | undefined
    products: ProductAnalytics | undefined
  }
  isLoading: boolean
}

export function ContentAnalyticsSection({ data, isLoading }: ContentAnalyticsSectionProps) {
  return (
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
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Articles</span>
                  <Badge variant="outline">
                    {data?.articles?.overview?.total_articles || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Published</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {data?.articles?.overview?.published_articles || 0}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Products</span>
                  <Badge variant="outline">
                    {data?.products?.overview?.total_products || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Available</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {data?.products?.overview?.active_products || 0}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
