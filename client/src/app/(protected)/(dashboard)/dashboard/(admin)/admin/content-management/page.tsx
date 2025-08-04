import { Metadata } from "next"
import { ContentManagementTable } from "@/app/(protected)/(dashboard)/dashboard/(admin)/admin/content-management/_components/content-management-table"

export const metadata: Metadata = {
    title: "Content Management",
    description: "Manage and oversee all platform content with advanced filtering and admin controls.",
}

export default function ContentManagementPage() {
    return <ContentManagementTable />
}
