import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticker } = body;

    if (!ticker) {
      return NextResponse.json(
        { ok: false, error: "Ticker is required" },
        { status: 400 }
      );
    }

    // Proxy to your Python backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl}/api/pipeline/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Extract authorization if needed, or pass service key
        "Authorization": request.headers.get("Authorization") || "",
      },
      body: JSON.stringify({ ticker: ticker.toUpperCase() }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { ok: false, error: errorData.detail || "Backend pipeline failed" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("Pipeline proxy error:", error);
    return NextResponse.json(
      { ok: false, error: "Next.js failed to connect to backend" },
      { status: 500 }
    );
  }
}
