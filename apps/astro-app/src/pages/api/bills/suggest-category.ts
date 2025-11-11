export const prerender = false;
import type { APIRoute } from "astro";
import { suggestCategory } from "../../../lib/category-suggestion";
import { ApiError, ApiResponse } from "../../../lib/api-response";

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return ApiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { providerName } = body;

    if (!providerName || typeof providerName !== "string") {
      return ApiError("Provider name is required", 400);
    }

    const suggestedCategory = suggestCategory(providerName);

    return ApiResponse({ category: suggestedCategory }, 200);
  } catch (error) {
    console.error("Error suggesting category:", error);
    return ApiError("Internal server error", 500);
  }
};
