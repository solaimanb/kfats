"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

interface RoleSelectionCardProps {
  role: "mentor" | "seller" | "writer"
  title: string
  description: string
  features: string[]
  icon: LucideIcon
  color: string
  onClick: () => void
  isDisabled?: boolean
  disabledReason?: string
}

export function RoleSelectionCard({
  title,
  description,
  features,
  icon: Icon,
  color,
  onClick,
  isDisabled = false,
  disabledReason
}: RoleSelectionCardProps) {
  return (
    <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${
      isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'
    }`}>
      <CardHeader className="pb-3">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isDisabled && (
            <Badge variant="secondary" className="text-xs">
              {disabledReason}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              {feature}
            </li>
          ))}
        </ul>
        <Button 
          onClick={onClick}
          disabled={isDisabled}
          variant={isDisabled ? "secondary" : "outline"}
          size="sm" 
          className={`w-full transition-colors ${
            !isDisabled && 'group-hover:bg-primary group-hover:text-primary-foreground'
          }`}
        >
          {isDisabled ? disabledReason : `Apply as ${title}`}
        </Button>
      </CardContent>
    </Card>
  )
}
