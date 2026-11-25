import { NextResponse } from "next/server";

export function GET() {
  const response = new NextResponse(null, { status: 303, headers: { Location: "/login" } });
  response.cookies.set("crm_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
