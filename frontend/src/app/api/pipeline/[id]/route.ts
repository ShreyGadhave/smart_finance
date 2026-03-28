import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    const authHeader = request.headers.get("Authorization") || "";

    // Fetch Run Details
    const runRes = await fetch(`${backendUrl}/api/pipeline/runs/${id}`, {
      headers: { "Authorization": authHeader },
    });
    
    if (!runRes.ok) return NextResponse.json({ ok: false, error: "Run not found" }, { status: 404 });
    const runData = await runRes.json();

    // Fetch Articles
    const articlesRes = await fetch(`${backendUrl}/api/pipeline/runs/${id}/articles`, {
      headers: { "Authorization": authHeader },
    });
    const articlesData = articlesRes.ok ? await articlesRes.json() : { articles: [] };

    // Fetch Trust Report
    const trustRes = await fetch(`${backendUrl}/api/trust/${id}`, {
      headers: { "Authorization": authHeader },
    });
    const trustData = trustRes.ok ? await trustRes.json() : { result: null };

    return NextResponse.json({
      ok: true,
      run: runData.run,
      articles: articlesData.articles,
      trust: trustData.result
    });
  } catch (error) {
    console.error("Run detail proxy error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch details" }, { status: 500 });
  }
}
