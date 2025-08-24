"use client"

import React from 'react'
import { useSellerOrders } from '@/lib/hooks/useOrders'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function OrdersPage() {
  const { data, isLoading, isError, error } = useSellerOrders()

  if (isLoading) return <div>Loading orders...</div>
  if (isError) return <div>Error loading orders: {(error as Error)?.message}</div>

  const orders = data?.items || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seller Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div>No orders found.</div>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHead>ID</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
