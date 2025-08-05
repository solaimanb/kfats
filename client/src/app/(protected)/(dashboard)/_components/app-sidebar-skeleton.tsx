import { Skeleton } from "@/components/ui/skeleton"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"

export function AppSidebarSkeleton() {
    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" disabled>
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-x-hidden">
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <Skeleton className="h-4 w-24" />
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <SidebarMenuItem key={i}>
                                    <SidebarMenuButton disabled>
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <Skeleton className="h-4 w-20" />
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>
                        <Skeleton className="h-4 w-20" />
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <SidebarMenuItem key={i}>
                                    <SidebarMenuButton disabled>
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <Skeleton className="h-4 w-24" />
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>
                        <Skeleton className="h-4 w-16" />
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <SidebarMenuItem key={i}>
                                    <SidebarMenuButton disabled>
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <Skeleton className="h-4 w-16" />
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" disabled>
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <Skeleton className="h-4 w-24" />
                                <div className="flex items-center gap-1">
                                    <Skeleton className="h-3 w-3 rounded" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-4" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
