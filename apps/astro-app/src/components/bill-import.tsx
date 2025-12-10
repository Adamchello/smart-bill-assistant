"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { queryClient } from "@/lib/query-client";
import { parseSpreadsheetFile } from "@/lib/file-import";
import {
  validateSpreadsheetType,
  validateFileSize,
} from "@/lib/validators/file";
import type { ParsedBillRow } from "@/types/bill-import";
import { suggestCategory } from "@/lib/category-suggestion";
import type { Category } from "@/components/category-selector";
import type { Bill } from "@/components/bill-history";
import { FileDropZone } from "@/components/import/file-drop-zone";
import { ImportStats } from "@/components/import/import-stats";
import { ImportTable } from "@/components/import/import-table";
import { ImportErrors } from "@/components/import/import-errors";

interface BillImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = "upload" | "review" | "importing";

const getBills = async (): Promise<Bill[]> => {
  const response = await fetch("/api/bills/list");
  if (!response.ok) throw new Error("Failed to fetch bills");
  const data = await response.json();
  return data.data || [];
};

const importBills = async (
  bills: ParsedBillRow[],
): Promise<{ imported: number }> => {
  const response = await fetch("/api/bills/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bills: bills.map((bill) => ({
        amount: parseFloat(bill.amount),
        date: bill.date,
        providerName: bill.providerName,
        description: bill.description || null,
        category: bill.category,
      })),
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to import bills");
  }

  return response.json();
};

export function BillImport({ open, onOpenChange }: BillImportProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [rows, setRows] = useState<ParsedBillRow[]>([]);
  const [importStatus, setImportStatus] = useState<{
    errors: string[];
    isProcessing: boolean;
    successMessage: string | null;
  }>({
    errors: [],
    isProcessing: false,
    successMessage: null,
  });

  const { data: existingBills } = useQuery(
    { queryKey: ["bills"], queryFn: getBills, enabled: open },
    queryClient,
  );

  const {
    mutate: mutateImportBills,
    error: importError,
    isPending: isImporting,
    reset: resetMutation,
  } = useMutation(
    {
      mutationFn: importBills,
      onSuccess: (data) => {
        setImportStatus((prev) => ({
          ...prev,
          successMessage: `Successfully imported ${data.imported} bills`,
        }));
        queryClient.invalidateQueries({ queryKey: ["bills"] });
        setTimeout(() => {
          resetState();
          onOpenChange(false);
        }, 2000);
      },
    },
    queryClient,
  );

  const resetState = useCallback(() => {
    setStep("upload");
    setRows([]);
    setImportStatus({
      errors: [],
      isProcessing: false,
      successMessage: null,
    });
    resetMutation();
  }, [resetMutation]);

  useEffect(() => {
    if (!open) resetState();
  }, [open, resetState]);

  const checkDuplicates = useCallback(
    (parsedRows: ParsedBillRow[]): ParsedBillRow[] => {
      if (!existingBills?.length) return parsedRows;

      return parsedRows.map((row) => {
        const duplicate = existingBills.find(
          (bill) =>
            bill.provider_name.toLowerCase() ===
              row.providerName.toLowerCase() &&
            parseFloat(bill.amount.toString()) === parseFloat(row.amount) &&
            bill.date === row.date,
        );

        if (duplicate) {
          return {
            ...row,
            isDuplicate: true,
            duplicateOf: `${duplicate.provider_name} - $${duplicate.amount} on ${duplicate.date}`,
          };
        }
        return row;
      });
    },
    [existingBills],
  );

  const processFile = useCallback(
    async (file: File) => {
      setImportStatus({ errors: [], isProcessing: true, successMessage: null });

      const typeValidation = validateSpreadsheetType(file);
      if (!typeValidation.valid) {
        setImportStatus({
          errors: [typeValidation.error!],
          isProcessing: false,
          successMessage: null,
        });
        return;
      }

      const sizeValidation = validateFileSize(file);
      if (!sizeValidation.valid) {
        setImportStatus({
          errors: [sizeValidation.error!],
          isProcessing: false,
          successMessage: null,
        });
        return;
      }

      const result = await parseSpreadsheetFile(file);

      if (!result.success || result.rows.length === 0) {
        setImportStatus({
          errors:
            result.errors.length > 0
              ? result.errors
              : ["No valid bill data found."],
          isProcessing: false,
          successMessage: null,
        });
        return;
      }

      let processedRows = result.rows.map((row) => ({
        ...row,
        category: suggestCategory(row.providerName),
      }));
      processedRows = checkDuplicates(processedRows);

      setRows(processedRows);
      setStep("review");
      setImportStatus({
        errors: [],
        isProcessing: false,
        successMessage: null,
      });
    },
    [checkDuplicates],
  );

  const updateRow = useCallback(
    (id: string, field: keyof ParsedBillRow, value: string) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row;

          const updated = { ...row, [field]: value };
          const errors: string[] = [];

          if (
            !updated.amount ||
            parseFloat(updated.amount) <= 0 ||
            isNaN(parseFloat(updated.amount))
          ) {
            errors.push("Amount must be a positive number");
          }

          if (!updated.date) {
            errors.push("Date is required");
          } else {
            const dateObj = new Date(updated.date);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (isNaN(dateObj.getTime())) {
              errors.push("Invalid date format");
            } else if (dateObj > today) {
              errors.push("Date cannot be in the future");
            }
          }

          if (!updated.providerName?.trim()) {
            errors.push("Provider name is required");
          }

          if (field === "providerName") {
            updated.category = suggestCategory(value);
          }

          updated.errors = errors;
          return updated;
        }),
      );
    },
    [],
  );

  const updateCategory = useCallback((id: string, category: Category) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, category } : row)),
    );
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const handleFinalize = useCallback(() => {
    const validRows = rows.filter((row) => row.errors.length === 0);
    if (validRows.length === 0) return;
    setStep("importing");
    mutateImportBills(validRows);
  }, [rows, mutateImportBills]);

  const totalRows = rows.length;
  const validRows = rows.filter((row) => row.errors.length === 0).length;
  const errorRows = rows.filter((row) => row.errors.length > 0).length;
  const duplicateRows = rows.filter((row) => row.isDuplicate).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Import Bills"}
            {step === "review" && "Review Import"}
            {step === "importing" && "Importing..."}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          {step === "upload" && (
            <FileDropZone
              onFileSelect={processFile}
              isProcessing={importStatus.isProcessing}
              errors={importStatus.errors}
            />
          )}

          {(step === "review" || step === "importing") && (
            <div className="space-y-4 h-full flex flex-col">
              <ImportStats
                total={totalRows}
                valid={validRows}
                errors={errorRows}
                duplicates={duplicateRows}
              />
              <div className="flex-1 min-h-0 ">
                <ImportTable
                  rows={rows}
                  onUpdateRow={updateRow}
                  onUpdateCategory={updateCategory}
                  onRemoveRow={removeRow}
                />
              </div>
              <ImportErrors rows={rows} />
              {importError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 shrink-0">
                  <p className="text-sm text-destructive">
                    {importError instanceof Error
                      ? importError.message
                      : "Failed to import bills"}
                  </p>
                </div>
              )}
              {importStatus.successMessage && (
                <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 shrink-0">
                  <p className="text-sm text-green-600">
                    {importStatus.successMessage}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          {step === "review" && (
            <Button
              onClick={handleFinalize}
              disabled={validRows === 0 || isImporting}
            >
              {isImporting ? "Importing..." : `Import ${validRows} Bills`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
