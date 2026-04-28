"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { parseSpreadsheetFile } from "../integration/file-parsers";
import {
  validateSpreadsheetType,
  validateFileSize,
} from "../core/validators/file";
import type { ParsedBillRow } from "../models/bill-import";
import type { Category } from "@/modules/bill-management";
import { FileDropZone } from "./import/file-drop-zone";
import { ImportStats } from "./import/import-stats";
import { ImportTable } from "./import/import-table";
import { ImportErrors } from "./import/import-errors";
import { useImportBills } from "../integration/hooks";
import { useBills } from "@/modules/bill-management";
import {
  checkDuplicates,
  updateRowField,
  categorizeRows,
} from "../core/import-processor";

interface BillImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = "upload" | "review" | "importing";

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

  const { data: existingBills } = useBills({ enabled: open });

  const {
    mutate: mutateImportBills,
    error: importError,
    isPending: isImporting,
    reset: resetMutation,
  } = useImportBills();

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

      let processedRows = categorizeRows(result.rows);
      if (existingBills) {
        processedRows = checkDuplicates(processedRows, existingBills);
      }

      setRows(processedRows);
      setStep("review");
      setImportStatus({
        errors: [],
        isProcessing: false,
        successMessage: null,
      });
    },
    [existingBills],
  );

  const updateRow = useCallback(
    (id: string, field: keyof ParsedBillRow, value: string) => {
      setRows((prev) =>
        prev.map((row) =>
          row.id === id ? updateRowField(row, field, value) : row,
        ),
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
    mutateImportBills(validRows, {
      onSuccess: (data) => {
        setImportStatus((prev) => ({
          ...prev,
          successMessage: `Successfully imported ${data.imported} bills`,
        }));
        setTimeout(() => {
          resetState();
          onOpenChange(false);
        }, 2000);
      },
    });
  }, [rows, mutateImportBills, resetState, onOpenChange]);

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
