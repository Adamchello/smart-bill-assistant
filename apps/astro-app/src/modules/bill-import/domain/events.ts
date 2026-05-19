import type { ParsedBillRow } from "./bill-import";

export type BillImportEvent =
  | { type: "FileSelected"; fileName: string }
  | { type: "ParseStarted" }
  | { type: "ParseSucceeded"; rows: ParsedBillRow[] }
  | { type: "ParseFailed"; errors: string[] }
  | { type: "RowUpdated"; rowId: string }
  | { type: "RowRemoved"; rowId: string }
  | { type: "ImportConfirmed"; validRowCount: number }
  | { type: "ImportSucceeded"; importedCount: number }
  | { type: "ImportFailed"; error: string };
