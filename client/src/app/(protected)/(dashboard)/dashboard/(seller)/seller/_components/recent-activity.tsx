"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Clock, Users, TrendingUp } from "lucide-react";
import { SellerActivity } from "./types";
import {
  getSellerActivityIcon,
  getSellerActivityColor,
  getTimeAgo,
  formatCurrency,
} from "./utils";

interface SellerRecentActivityProps {
  activities: SellerActivity[];
  isLoading: boolean;
}

export function SellerRecentActivity({
  activities,
  isLoading,
}: SellerRecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getSellerActivityIcon(activity.type);
              const colorClass = getSellerActivityColor(activity.type);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {activity.description}
                        </p>

                        {/* Activity Details */}
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {activity.product_name && (
                            <div className="flex items-center gap-1">
                              <span>Product:</span>
                              <Badge variant="secondary" className="text-xs">
                                {activity.product_name}
                              </Badge>
                            </div>
                          )}

                          {activity.amount && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span className="font-medium text-green-600">
                                {formatCurrency(activity.amount)}
                              </span>
                            </div>
                          )}

                          {activity.customer_name && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{activity.customer_name}</span>
                            </div>
                          )}
                        </div>

                        {/* Order Info */}
                        {activity.order_id && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Order #{activity.order_id}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{getTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No recent activity</h3>
            <p className="text-muted-foreground">
              Your business activities will appear here once you start selling
            </p>
          </div>
        )}

        {/* Activity Summary */}
        {activities.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm font-medium">
                  {activities.filter((a) => a.type === "product_added").length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Products Added
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">
                  {activities.filter((a) => a.type === "order_received").length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Orders Received
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">
                  {
                    activities.filter((a) => a.type === "review_received")
                      .length
                  }
                </div>
                <div className="text-xs text-muted-foreground">Reviews</div>
              </div>
              <div>
                <div className="text-sm font-medium">
                  {activities.filter((a) => a.type === "product_sold").length}
                </div>
                <div className="text-xs text-muted-foreground">Sales</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
