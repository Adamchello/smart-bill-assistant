import { defineMiddleware } from "astro:middleware";
import { supabase } from "./lib/supabase";

// Protected API endpoints that require authentication
const protectedEndpoints = [
  "/api/bills/create",
  "/api/bills/list",
  "/api/bills/suggest-category",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Check if this is a protected endpoint
  const isProtected = protectedEndpoints.some((endpoint) =>
    pathname.startsWith(endpoint),
  );

  if (isProtected) {
    const accessToken = context.cookies.get("sb-access-token")?.value;
    const refreshToken = context.cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Set session for authenticated request
    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

    if (sessionError || !sessionData.session) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get authenticated user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Store user in context.locals for use in endpoints
    context.locals.user = { id: userData.user.id };
  }

  return next();
});
