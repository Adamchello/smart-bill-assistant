export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const VALID_SPREADSHEET_MIME_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const VALID_SPREADSHEET_EXTENSIONS = [".csv", ".xls", ".xlsx"];

export function validateSpreadsheetType(file: File): {
  valid: boolean;
  error?: string;
} {
  const extension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));

  if (
    !VALID_SPREADSHEET_MIME_TYPES.includes(file.type) &&
    !VALID_SPREADSHEET_EXTENSIONS.includes(extension)
  ) {
    return {
      valid: false,
      error: "Unsupported file format. Please upload a CSV, XLS, or XLSX file.",
    };
  }

  return { valid: true };
}

export function validateFileSize(
  file: File,
  maxSize = MAX_FILE_SIZE,
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB} MB limit. Please split your data into smaller files.`,
    };
  }
  return { valid: true };
}
