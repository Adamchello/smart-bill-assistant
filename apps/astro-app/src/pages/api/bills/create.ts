export const prerender = false;
import type { APIRoute } from "astro";
import { z } from "zod";
import { supabase } from "../../../lib/supabase";
import { ApiError, ApiResponse } from "../../../lib/api-response";
import { createSupabaseServerClient } from "@/kernel/db/supabase-server";

const createBillSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required" })
    .positive("Amount must be a positive number"),
  date: z.string({ required_error: "Date is required" }).refine(
    (date) => {
      const billDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return !isNaN(billDate.getTime()) && billDate <= today;
    },
    {
      message: "Date must be a valid date and cannot be in the future",
    },
  ),
  providerName: z
    .string({ required_error: "Provider name is required" })
    .min(1, "Provider name cannot be empty")
    .trim(),
  description: z
    .string()
    .max(100, "Description must be 100 characters or less")
    .trim()
    .optional()
    .nullable(),
  category: z.string().optional().default("Uncategorized"),
});

export const POST: APIRoute = async (context) => {
  const supabase = createSupabaseServerClient(context);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await context.request.json();

    const validationResult = createBillSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return ApiError(
        firstError.message || "Validation failed",
        400,
        validationResult.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
      );
    }

    const { amount, date, providerName, description, category } =
      validationResult.data;

    const { data, error } = await supabase
      .from("bills")
      .insert({
        user_id: user.id,
        amount: amount,
        date: date,
        provider_name: providerName,
        description: description || null,
        category: category,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating bill:", error);
      return ApiError("Failed to save bill", 500, error.message);
    }

    return ApiResponse(data, 201, "Bill saved successfully");
  } catch (error) {
    console.error("Unexpected error:", error);
    return ApiError("Internal server error", 500);
  }
};
