export function ApiError(
  message: string,
  status: number = 500,
  details?: string,
): Response {
  const body: { error: string; details?: string } = { error: message };
  if (details) {
    body.details = details;
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function ApiResponse<T>(
  data: T,
  status: number = 200,
  message?: string,
): Response {
  const body: { data: T; message?: string } = { data };
  if (message) {
    body.message = message;
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
