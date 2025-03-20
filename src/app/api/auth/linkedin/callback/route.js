import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: "Authorization code is missing" }, { status: 400 });
  }

  console.log("🔹 LinkedIn Callback Received - Redirecting to Token Exchange");

  // Correct API path: /api/auth/linkedin
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin?code=${code}`);
}
