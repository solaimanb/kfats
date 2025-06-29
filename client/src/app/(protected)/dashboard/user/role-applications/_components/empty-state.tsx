"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold mb-2">No Applications Yet</h3>
        <p className="text-muted-foreground text-sm mb-4 max-w-sm">
          Start your journey by applying for a mentor, writer, or seller role.
        </p>
        <Button asChild variant="default">
          <a href="/role-application/become-mentor">Apply for a Role</a>
        </Button>
      </CardContent>
    </Card>
  );
}
