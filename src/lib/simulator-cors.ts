import { NextResponse } from "next/server";

export const simulatorCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigin = process.env.SIMULATOR_WEB_ORIGIN;
  return allowedOrigin && origin === allowedOrigin
    ? { "Access-Control-Allow-Origin": allowedOrigin, Vary: "Origin" }
    : {};
};

export const simulatorOptionsResponse = (request: Request, methods: string) =>
  new NextResponse(null, {
    headers: {
      ...simulatorCorsHeaders(request.headers.get("origin")),
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": methods,
    },
  });
