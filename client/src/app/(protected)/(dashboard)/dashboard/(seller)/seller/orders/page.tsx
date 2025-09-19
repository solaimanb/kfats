"use client";

import React, { useMemo, useCallback } from "react";
import { useSellerOrders, useUpdateOrderStatus } from "@/lib/hooks/useOrders";
import { DataTable, createActionsColumn } from "@/components/common/data-table";
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
import { Package, RefreshCw, Search, Filter, X } from "lucide-react";
import { ColumnDef, Table } from "@tanstack/react-table";
import { Order } from "@/lib/types/orders";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  getStatusColor,
  getAllOrderStatuses,
  OrderStatusIcon,
} from "@/lib/utils/order-status";

export default function OrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useSellerOrders();
  const updateOrderStatus = useUpdateOrderStatus();

  const orders = data?.items || [];
  const totalOrders = data?.total || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewOrder = useCallback(
    (order: Order) => {
      router.push(`/orders/${order.id}`);
    },
    [router]
  );

  const handleUpdateStatus = useCallback(
    async (order: Order, newStatus: string) => {
      try {
        await updateOrderStatus.mutateAsync({
          orderId: order.id,
          status: newStatus,
        });
      } catch (error) {
        console.error("Failed to update order status:", error);
        // TODO: Add user-friendly error notification (toast, etc.)
      }
    },
    [updateOrderStatus]
  );

  const handleRefresh = useCallback(() => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
  }, [refetch, queryClient]);

  const toolbar = useCallback(
    (table: Table<Order>) => {
      const isFiltered = table.getState().columnFilters.length > 0;

      return (
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID..."
                value={
                  (table.getColumn("id")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("id")?.setFilterValue(event.target.value)
                }
                className="h-8 w-[150px] lg:w-[250px] pl-8"
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
                  {getAllOrderStatuses().map((status) => {
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
                        <div className="flex items-center gap-2">
                          <OrderStatusIcon status={status} />
                          {status.replace("_", " ").toUpperCase()}
                        </div>
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
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="ml-auto h-8"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
              />
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      );
    },
    [handleRefresh, isFetching]
  );

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order ID" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">#{row.getValue("id")}</div>
        ),
        filterFn: (row, id, value) => {
          const orderId = row.getValue(id) as number;
          return orderId.toString().includes(value.toLowerCase());
        },
      },
      {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => {
          const items = row.getValue("items") as Order["items"];
          return (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "total_amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ row }) => {
          const amount = row.getValue("total_amount") as number;
          return <div className="font-medium">${amount.toFixed(2)}</div>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge className={getStatusColor(status)}>
              <div className="flex items-center gap-1">
                <OrderStatusIcon status={status} />
                {status.replace("_", " ").toUpperCase()}
              </div>
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        enableSorting: false,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => {
          const date = row.getValue("created_at") as string;
          return (
            <div className="text-sm text-muted-foreground">
              {formatDate(date)}
            </div>
          );
        },
      },
      createActionsColumn<Order>({
        onView: handleViewOrder,
        customActions: [
          {
            label: "Mark as Paid",
            onClick: (order) => handleUpdateStatus(order, "paid"),
          },
          {
            label: "Start Processing",
            onClick: (order) => handleUpdateStatus(order, "processing"),
          },
          {
            label: "Mark as Shipped",
            onClick: (order) => handleUpdateStatus(order, "shipped"),
          },
          {
            label: "Mark as Delivered",
            onClick: (order) => handleUpdateStatus(order, "delivered"),
          },
          {
            label: "Put On Hold",
            onClick: (order) => handleUpdateStatus(order, "on_hold"),
          },
          {
            label: "Cancel Order",
            onClick: (order) => handleUpdateStatus(order, "cancelled"),
            variant: "destructive",
          },
        ],
      }),
    ],
    [handleViewOrder, handleUpdateStatus]
  );

  if (isLoading) return <div>Loading orders...</div>;
  if (isError)
    return <div>Error loading orders: {(error as Error)?.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seller Orders</h1>
          <p className="text-muted-foreground">
            Manage and track your product orders ({totalOrders.toLocaleString()}{" "}
            total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {orders.length} orders
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground">
                Orders for your products will appear here once customers make
                purchases.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={orders}
              pageSize={10}
              showPagination={true}
              toolbar={toolbar}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
