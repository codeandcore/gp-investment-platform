import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: "Token is required." },
        { status: 400 },
      );
    }

    // Forward to the backend grant-access endpoint
    const res = await axios.get(
      `${BACKEND_URL}/api/applications/grant-access/${encodeURIComponent(token)}`,
      { maxRedirects: 0, validateStatus: () => true },
    );

    // The backend returns a redirect (302) — extract the redirect URL params
    // and return data directly to the frontend instead
    if (res.status === 302 || res.status === 301) {
      const location = res.headers["location"] || "";
      const url = new URL(location);
      return NextResponse.json({
        success: true,
        requesterEmail: url.searchParams.get("requester") || "",
        companyName: url.searchParams.get("company") || "",
        continueStep: Number(url.searchParams.get("step") || 1),
      });
    }

    // If backend returned JSON error
    return NextResponse.json(
      { message: res.data?.message || "Grant failed." },
      { status: res.status || 500 },
    );
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Server error. Please try again.";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
