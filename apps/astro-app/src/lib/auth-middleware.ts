import type { APIContext } from "astro";
import { supabase } from "./supabase";

export interface AuthResult {
  success: true;
  user: { id: string };
}

export interface AuthError {
  success: false;
  response: Response;
}

export type AuthMiddlewareResult = AuthResult | AuthError;

/**
 * Middleware to authenticate API requests using Supabase session tokens
 * @param context - Astro API context containing cookies
 * @returns AuthResult with user data if authenticated, or AuthError with error response
 */
export async function requireAuth(
  context: APIContext,
): Promise<AuthMiddlewareResult> {
  const { cookies } = context;

  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    return {
      success: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  // Set session for authenticated request
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

  if (sessionError || !sessionData.session) {
    return {
      success: false,
      response: new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  // Get authenticated user
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      success: false,
      response: new Response(JSON.stringify({ error: "User not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return {
    success: true,
    user: { id: userData.user.id },
  };
}
