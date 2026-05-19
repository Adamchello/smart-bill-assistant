"use client";

import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ParsedBillRow } from "../domain/bill-import";
import { FileDropZone } from "./import/file-drop-zone";
import { ImportStats } from "./import/import-stats";
import { ImportTable } from "./import/import-table";
import { ImportErrors } from "./import/import-errors";
import { useBills } from "@/modules/bill-management/core/store";
import { useImportStore } from "../core/store";

interface BillImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillImport({ open, onOpenChange }: BillImportProps) {
  const { data: existingBills } = useBills({ enabled: open });
  const store = useImportStore(existingBills);

  useEffect(() => {
    if (!open) store.resetState();
  }, [open, store.resetState]);

  const handleFinalize = useCallback(() => {
    store.handleFinalize(() => {
      setTimeout(() => {
        store.resetState();
        onOpenChange(false);
      }, 2000);
    });
  }, [store, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {store.step === "upload" && "Import Bills"}
            {store.step === "review" && "Review Import"}
            {store.step === "importing" && "Importing..."}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          {store.step === "upload" && (
            <FileDropZone
              onFileSelect={store.processFile}
              isProcessing={store.importStatus.isProcessing}
              errors={store.importStatus.errors}
            />
          )}

          {(store.step === "review" || store.step === "importing") && (
            <div className="space-y-4 h-full flex flex-col">
              <ImportStats
                total={store.totalRows}
                valid={store.validRows}
                errors={store.errorRows}
                duplicates={store.duplicateRows}
              />
              <div className="flex-1 min-h-0 ">
                <ImportTable
                  rows={store.rows}
                  onUpdateRow={store.updateRow}
                  onUpdateCategory={store.updateCategory}
                  onRemoveRow={store.removeRow}
                />
              </div>
              <ImportErrors rows={store.rows} />
              {store.importError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 shrink-0">
                  <p className="text-sm text-destructive">
                    {store.importError instanceof Error
                      ? store.importError.message
                      : "Failed to import bills"}
                  </p>
                </div>
              )}
              {store.importStatus.successMessage && (
                <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 shrink-0">
                  <p className="text-sm text-green-600">
                    {store.importStatus.successMessage}
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
            disabled={store.isImporting}
          >
            Cancel
          </Button>
          {store.step === "review" && (
            <Button
              onClick={handleFinalize}
              disabled={store.validRows === 0 || store.isImporting}
            >
              {store.isImporting
                ? "Importing..."
                : `Import ${store.validRows} Bills`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
