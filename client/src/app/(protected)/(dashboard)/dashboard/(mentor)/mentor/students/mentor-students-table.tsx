"use client";

import React, { useMemo, useCallback } from "react";
import { DataTable } from "@/components/common/data-table";
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Search, Filter, X, BookOpen } from "lucide-react";
import { ColumnDef, Table } from "@tanstack/react-table";

type Student = {
  user_id: number;
  full_name: string;
  email: string;
  course_id: number;
  course_title: string;
  enrolled_at: string;
  progress_percentage: number;
  status: string;
};

type StudentsResponse = {
  items: Student[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

interface MentorStudentsTableProps {
  initialData: StudentsResponse;
  error?: string | null;
}

export function MentorStudentsTable({
  initialData,
  error = null,
}: MentorStudentsTableProps) {
  const students = initialData?.items || [];
  const totalStudents = initialData?.total || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700";
      case "dropped":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const toolbar = useCallback(
    (table: Table<Student>) => {
      const isFiltered = table.getState().columnFilters.length > 0;

      return (
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or email..."
                value={
                  (table.getColumn("full_name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("full_name")?.setFilterValue(event.target.value)
                }
                className="h-8 w-[200px] lg:w-[300px] pl-8"
              />
            </div>

            {table.getColumn("status") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="mr-2 h-4 w-4" />
                    Status
                    {(() => {
                      const filterValue = table
                        .getColumn("status")
                        ?.getFilterValue();
                      return filterValue ? (
                        <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                          {Array.isArray(filterValue)
                            ? (filterValue as string[]).length
                            : 1}
                        </Badge>
                      ) : null;
                    })()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[150px]">
                  <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["active", "completed", "inactive", "dropped"].map((status) => {
                    const column = table.getColumn("status");
                    const isSelected = column?.getFilterValue()
                      ? (column.getFilterValue() as string[]).includes(status)
                      : false;

                    return (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={isSelected}
                        onCheckedChange={(value) => {
                          const currentFilter =
                            (column?.getFilterValue() as string[]) || [];
                          if (value) {
                            column?.setFilterValue([...currentFilter, status]);
                          } else {
                            column?.setFilterValue(
                              currentFilter.filter((s) => s !== status)
                            );
                          }
                        }}
                      >
                        <span className="capitalize">{status}</span>
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isFiltered && (
              <Button
                variant="ghost"
                onClick={() => table.resetColumnFilters()}
                className="h-8 px-2 lg:px-3"
              >
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      );
    },
    []
  );

  const columns: ColumnDef<Student>[] = useMemo(
    () => [
      {
        accessorKey: "full_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Student" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium">{row.getValue("full_name")}</div>
              <div className="text-sm text-muted-foreground">
                {row.original.email}
              </div>
            </div>
          </div>
        ),
        filterFn: (row, id, value) => {
          const fullName = row.getValue(id) as string;
          const email = row.original.email;
          return (
            fullName.toLowerCase().includes(value.toLowerCase()) ||
            email.toLowerCase().includes(value.toLowerCase())
          );
        },
      },
      {
        accessorKey: "course_title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Course" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue("course_title")}</span>
          </div>
        ),
      },
      {
        accessorKey: "enrolled_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Enrolled" />
        ),
        cell: ({ row }) => {
          const date = row.getValue("enrolled_at") as string;
          return (
            <div className="text-sm text-muted-foreground">
              {formatDate(date)}
            </div>
          );
        },
      },
      {
        accessorKey: "progress_percentage",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Progress" />
        ),
        cell: ({ row }) => {
          const progress = row.getValue("progress_percentage") as number;
          return (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge className={getStatusBadgeClass(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        enableSorting: false,
      },
    ],
    []
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Students</h1>
            <p className="text-muted-foreground">
              Manage and track your enrolled students
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <X className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">Error Loading Students</h3>
              <p className="text-muted-foreground mb-4">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Students</h1>
          <p className="text-muted-foreground">
            Manage and track your enrolled students ({totalStudents.toLocaleString()}{" "}
            total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {students.length} students
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No students yet</h3>
              <p className="text-muted-foreground">
                Students enrolled in your courses will appear here.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={students}
              pageSize={20}
              showPagination={true}
              toolbar={toolbar}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}