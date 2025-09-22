import { Metadata } from "next"
import { UserManagementTable } from "./_components/user-management-table"

export const metadata: Metadata = {
    title: "User Management",
    description: "Manage users and their roles in the KFATS platform.",
}

export default function UserManagementPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-muted-foreground">
                    Manage users, their roles, and account status.
                </p>
            </div>

            <UserManagementTable />
        </div>
    )
}
