export const prerender = false;
import type { APIRoute } from "astro";
import { z } from "zod";
import { supabase } from "../../../lib/supabase";
import { ApiError } from "../../../lib/api-response";

const registerSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    const validationResult = registerSchema.safeParse({ email, password });

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

    const { email: validatedEmail, password: validatedPassword } =
      validationResult.data;

    const { error } = await supabase.auth.signUp({
      email: validatedEmail,
      password: validatedPassword,
    });

    if (error) {
      return ApiError(error.message, 500);
    }

    return redirect("/");
  } catch (error) {
    console.error("Unexpected error:", error);
    return ApiError("Internal server error", 500);
  }
};
