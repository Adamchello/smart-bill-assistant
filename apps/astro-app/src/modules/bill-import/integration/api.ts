import type { ParsedBillRow } from "../domain/bill-import";

export const importBills = async (
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
