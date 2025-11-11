export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import { ApiError, ApiResponse } from "../../../lib/api-response";

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return ApiError("Unauthorized", 401);

  try {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("user_id", locals.user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bills:", error);
      return ApiError("Failed to fetch bills", 500, error.message);
    }

    return ApiResponse(data || [], 200);
  } catch (error) {
    console.error("Unexpected error:", error);
    return ApiError("Internal server error", 500);
  }
};
