"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  CategorySelector,
  type Category,
} from "@/components/category-selector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { queryClient } from "@/lib/query-client";

interface BillEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BillFormData {
  amount: number;
  date: string;
  providerName: string;
  description: string | null;
  category: Category;
}

interface FormState {
  amount: string;
  date: string;
  providerName: string;
  description: string;
  category: Category | undefined;
}

const createBill = async (formData: BillFormData) => {
  const response = await fetch("/api/bills/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: formData.amount,
      date: formData.date,
      providerName: formData.providerName.trim(),
      description: formData.description?.trim() || null,
      category: formData.category,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to save bill");
  }

  return data;
};

const suggestCategory = async (
  providerName: string,
): Promise<{ category: Category }> => {
  const response = await fetch("/api/bills/suggest-category", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ providerName }),
  });

  if (!response.ok) {
    throw new Error("Failed to suggest category");
  }

  const data = await response.json();
  return data;
};

const getInitialFormState = (): FormState => ({
  amount: "",
  date: new Date().toISOString().split("T")[0],
  providerName: "",
  description: "",
  category: undefined,
});

export function BillEntryForm({ open, onOpenChange }: BillEntryFormProps) {
  const [formState, setFormState] = useState<FormState>(getInitialFormState);
  const [debouncedProviderName, setDebouncedProviderName] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Debounce provider name for category suggestion
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedProviderName(formState.providerName);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formState.providerName]);

  const { data: categoryData } = useQuery(
    {
      queryKey: ["suggest-category", debouncedProviderName.trim()],
      queryFn: () => suggestCategory(debouncedProviderName.trim()),
      enabled: !!debouncedProviderName.trim(),
      retry: false,
      staleTime: Infinity,
    },
    queryClient,
  );

  useEffect(() => {
    if (categoryData?.category) {
      if (!formState.category) {
        setFormState((prev) => ({ ...prev, category: categoryData.category }));
      }
    }
  }, [categoryData, formState.category]);

  const resetForm = useCallback(() => {
    setFormState(getInitialFormState());
    setDebouncedProviderName("");
    setSuccessMessage(null);
  }, []);

  const {
    mutate: mutateCreateBill,
    reset,
    error,
    isPending,
  } = useMutation(
    {
      mutationFn: createBill,
      onSuccess: (data) => {
        setSuccessMessage("Bill saved successfully!");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["bills"] });

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      },
      onError: (error) => {
        console.error("Error submitting form:", error);
      },
    },
    queryClient,
  );

  useEffect(() => {
    if (!open) {
      resetForm();
      reset();
    }
  }, [open, resetForm, reset]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formState.amount || !formState.date || !formState.providerName) {
      reset();
      return;
    }

    const amountNum = parseFloat(formState.amount);
    if (isNaN(amountNum) || amountNum < 0) {
      reset();
      return;
    }

    mutateCreateBill({
      amount: amountNum,
      date: formState.date,
      providerName: formState.providerName.trim(),
      description: formState.description.trim() || null,
      category: formState.category || "Uncategorized",
    });
  };

  const updateField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const isFormValid =
    formState.amount && formState.date && formState.providerName;
  const suggestedCategory = categoryData?.category;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Bill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">
                  {error instanceof Error
                    ? error.message
                    : "Failed to save bill"}
                </p>
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3">
                <p className="text-sm text-green-600 dark:text-green-400">
                  {successMessage}
                </p>
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="amount">
                Amount <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formState.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  required
                  aria-invalid={error && !formState.amount ? "true" : "false"}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="date">
                Date <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="date"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={formState.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  required
                  aria-invalid={error && !formState.date ? "true" : "false"}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="provider">
                Provider Name <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="provider"
                  type="text"
                  placeholder="e.g., Electric Company"
                  value={formState.providerName}
                  onChange={(e) => updateField("providerName", e.target.value)}
                  required
                  aria-invalid={
                    error && !formState.providerName ? "true" : "false"
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">
                Description (optional)
              </FieldLabel>
              <FieldContent>
                <FieldDescription>Maximum 100 characters</FieldDescription>
                <Textarea
                  id="description"
                  placeholder="Add a description..."
                  value={formState.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 100) {
                      updateField("description", e.target.value);
                    }
                  }}
                  maxLength={100}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formState.description.length}/100
                </p>
              </FieldContent>
            </Field>

            <CategorySelector
              value={formState.category}
              onValueChange={(category) => updateField("category", category)}
              suggestedCategory={suggestedCategory}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isPending}>
              {isPending ? "Saving..." : "Save Bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
