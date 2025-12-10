"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BillEntryForm } from "@/components/bill-entry-form";
import { BillImport } from "@/components/bill-import";
import { BillHistory, type Bill } from "@/components/bill-history";
import { queryClient } from "../lib/query-client";
import { useAuth } from "@/kernel/auth/use-auth";
import { Upload } from "lucide-react";

const getBills = async (): Promise<Bill[]> => {
  const response = await fetch("/api/bills/list");
  if (!response.ok) {
    throw new Error("Failed to fetch bills");
  }
  const data = await response.json();
  return data.data || [];
};

export function DashboardContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const auth = useAuth();
  const email = auth.status === "authenticated" ? auth.user?.email : "";

  const query = useQuery(
    {
      queryKey: ["bills"],
      queryFn: getBills,
    },
    queryClient,
  );

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome {email}</h1>
          <p className="text-muted-foreground mt-2">
            We are happy to see you here
          </p>
        </div>
        <form action="/api/auth/signout">
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mb-6 flex gap-3">
        <Button onClick={() => setIsModalOpen(true)}>Add Bill</Button>
        <Button variant="outline" onClick={() => setIsImportOpen(true)}>
          <Upload className="h-4 w-4" />
          Import Bills
        </Button>
      </div>

      <BillEntryForm open={isModalOpen} onOpenChange={handleModalClose} />
      <BillImport open={isImportOpen} onOpenChange={setIsImportOpen} />

      {query.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 mb-6">
          <p className="text-sm text-destructive">
            {query.error instanceof Error
              ? query.error.message
              : "Failed to load bills"}
          </p>
        </div>
      )}

      {query.isLoading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Loading bills...</p>
        </div>
      ) : (
        <BillHistory
          bills={query.data || []}
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ["bills"] })
          }
        />
      )}
    </div>
  );
}
