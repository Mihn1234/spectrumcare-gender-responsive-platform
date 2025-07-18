import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: true, data: { message: "Daily Living Management System Active" } });
}
