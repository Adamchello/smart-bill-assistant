import type { ParsedBillRow } from "../domain/bill-import";
import type { Bill } from "@/modules/bill-management/domain/bill";
import { suggestCategory } from "@/modules/bill-management/core/category-suggestion";

export function checkDuplicates(
  rows: ParsedBillRow[],
  existingBills: Bill[],
): ParsedBillRow[] {
  if (!existingBills.length) return rows;

  return rows.map((row) => {
    const duplicate = existingBills.find(
      (bill) =>
        bill.provider_name.toLowerCase() === row.providerName.toLowerCase() &&
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
}

export function validateRow(row: ParsedBillRow): string[] {
  const errors: string[] = [];

  if (
    !row.amount ||
    parseFloat(row.amount) <= 0 ||
    isNaN(parseFloat(row.amount))
  ) {
    errors.push("Amount must be a positive number");
  }

  if (!row.date) {
    errors.push("Date is required");
  } else {
    const dateObj = new Date(row.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (isNaN(dateObj.getTime())) {
      errors.push("Invalid date format");
    } else if (dateObj > today) {
      errors.push("Date cannot be in the future");
    }
  }

  if (!row.providerName?.trim()) {
    errors.push("Provider name is required");
  }

  return errors;
}

export function updateRowField(
  row: ParsedBillRow,
  field: keyof ParsedBillRow,
  value: string,
): ParsedBillRow {
  const updated = { ...row, [field]: value };

  if (field === "providerName") {
    updated.category = suggestCategory(value);
  }

  updated.errors = validateRow(updated);
  return updated;
}

export function categorizeRows(rows: ParsedBillRow[]): ParsedBillRow[] {
  return rows.map((row) => ({
    ...row,
    category: suggestCategory(row.providerName),
  }));
}
