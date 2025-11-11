export const prerender = false;
import type { APIRoute } from "astro";
import { z } from "zod";
import { supabase } from "../../../lib/supabase";
import { ApiError } from "../../../lib/api-response";

const signinSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    const validationResult = signinSchema.safeParse({ email, password });

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedEmail,
      password: validatedPassword,
    });

    if (error) {
      return ApiError(error.message, 500);
    }

    const { access_token, refresh_token } = data.session;
    cookies.set("sb-access-token", access_token, {
      path: "/",
    });
    cookies.set("sb-refresh-token", refresh_token, {
      path: "/",
    });
    return redirect("/dashboard");
  } catch (error) {
    console.error("Unexpected error:", error);
    return ApiError("Internal server error", 500);
  }
};
